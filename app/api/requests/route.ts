// filepath: app/api/requests/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { sql } from '@/lib/db';
import { getRequests, createRequest, approveRequest, rejectRequest } from '@/lib/services/request-service';
import type { RequestPriority } from '@/types/requests';

export const dynamic = 'force-dynamic';

interface RequestPayloadItem {
  itemId?: unknown;
  quantity?: unknown;
}

interface CreateRequestPayload {
  warehouseId?: unknown;
  items?: unknown;
  itemId?: unknown;
  quantity?: unknown;
  requestedQuantity?: unknown;
  priority?: unknown;
  urgency?: unknown;
  purpose?: unknown;
  notes?: unknown;
  department?: unknown;
}

function isRequestPriority(value: string): value is RequestPriority {
  return ['Urgent', 'High', 'Normal', 'Low'].includes(value);
}

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    const { searchParams } = new URL(request.url);

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned.',
      });
    }

    let warehouseId: string | string[] | undefined = searchParams.get('warehouseId') || undefined;
    if (!scope.isAdmin) {
      if (typeof warehouseId === 'string' && warehouseId) {
        const isAllowed = scope.assignedWarehouseIds.includes(warehouseId) || scope.warehouseId === warehouseId;
        if (!isAllowed) {
          warehouseId = scope.assignedWarehouseIds.length > 0 ? scope.assignedWarehouseIds : (scope.warehouseId || undefined);
        }
      } else {
        warehouseId = scope.assignedWarehouseIds.length > 0 ? scope.assignedWarehouseIds : (scope.warehouseId || undefined);
      }
    }

    const status = searchParams.get('status') || undefined;
    const requests = await getRequests({ warehouseId, status });
    return NextResponse.json({ success: true, data: requests });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: No warehouse facility assigned.' },
        { status: 403 }
      );
    }

    const parsedBody: unknown = await request.json();
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return NextResponse.json(
        { success: false, message: 'A valid request body is required.' },
        { status: 400 }
      );
    }

    const body = parsedBody as CreateRequestPayload;
    let requestedWarehouseId = typeof body.warehouseId === 'string' && body.warehouseId.trim()
      ? body.warehouseId.trim()
      : scope.warehouseId;

    if (!scope.isAdmin) {
      const allowedWhIds = new Set(scope.assignedWarehouseIds);
      if (scope.warehouseId) allowedWhIds.add(scope.warehouseId);

      if (typeof body.warehouseId === 'string' && body.warehouseId.trim()) {
        const candidate = body.warehouseId.trim();
        if (allowedWhIds.has(candidate)) {
          requestedWarehouseId = candidate;
        } else {
          return NextResponse.json(
            { success: false, message: 'Forbidden: You are not assigned to the requested warehouse facility.' },
            { status: 403 }
          );
        }
      } else {
        requestedWarehouseId = scope.warehouseId;
      }
    }

    if (typeof requestedWarehouseId !== 'string' || !requestedWarehouseId.trim()) {
      return NextResponse.json(
        { success: false, message: 'A warehouse must be assigned before submitting a stock request.' },
        { status: 400 }
      );
    }
    const warehouseId = requestedWarehouseId.trim();

    const rawItems: RequestPayloadItem[] = Array.isArray(body.items)
      ? body.items as RequestPayloadItem[]
      : [{ itemId: body.itemId, quantity: body.quantity ?? body.requestedQuantity }];
    if (rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one item is required.' },
        { status: 400 }
      );
    }

    const items: Array<{ itemId: string; quantity: number }> = [];
    for (const item of rawItems) {
      const itemCodeOrId = typeof item?.itemId === 'string' ? item.itemId.trim() : '';
      const quantity = Number(item?.quantity);
      if (!itemCodeOrId || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { success: false, message: 'Each requested item must have a valid item and positive whole-number quantity.' },
          { status: 400 }
        );
      }

      const itemRows = await sql.query(
        `SELECT id, code, name FROM items WHERE (id = $1 OR code = $1 OR LOWER(code) = LOWER($1) OR LOWER(name) = LOWER($1)) AND deleted_at IS NULL LIMIT 1;`,
        [itemCodeOrId]
      );
      if (!itemRows.length) {
        return NextResponse.json(
          { success: false, message: `Item "${itemCodeOrId}" was not found in active inventory.` },
          { status: 400 }
        );
      }

      items.push({ itemId: itemRows[0].id, quantity });
    }

    const priority = typeof body.priority === 'string'
      ? body.priority
      : typeof body.urgency === 'string' ? body.urgency : 'Normal';
    const normalizedPriority = priority === 'Medium' ? 'Normal' : priority;
    if (!isRequestPriority(normalizedPriority)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request priority.' },
        { status: 400 }
      );
    }

    const purpose = typeof body.purpose === 'string' ? body.purpose : body.notes;
    if (typeof purpose !== 'string' || !purpose.trim()) {
      return NextResponse.json(
        { success: false, message: 'A request purpose is required.' },
        { status: 400 }
      );
    }

    // Ensure the requester exists in the users table and is linked to the warehouse
    let requesterId: string | null = null;
    const requesterRows = await sql.query(
      `SELECT id, assigned_warehouse_id, role, status
       FROM users
       WHERE (id = $1 OR LOWER(email) = LOWER($2))
         AND deleted_at IS NULL
       ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END
       LIMIT 1;`,
      [scope.user.id, scope.user.email]
    );

    if (requesterRows.length > 0) {
      requesterId = requesterRows[0].id;
      if (!scope.isAdmin && requesterRows[0].assigned_warehouse_id !== warehouseId) {
        await sql.query(
          `UPDATE users SET assigned_warehouse_id = $1, role = $2::user_role WHERE id = $3;`,
          [warehouseId, scope.role || 'staff', requesterId]
        );
      }
    } else {
      // Check if soft-deleted or needs insert
      const softDeleted = await sql.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR id = $2 LIMIT 1;`,
        [scope.user.email, scope.user.id]
      );
      if (softDeleted.length > 0) {
        await sql.query(
          `UPDATE users
           SET id = $1, full_name = $2, role = $3::user_role, status = 'active'::user_status,
               assigned_warehouse_id = $4, deleted_at = NULL, updated_at = NOW()
           WHERE id = $5;`,
          [scope.user.id, scope.user.name || 'Warehouse Staff', scope.role || 'staff', warehouseId, softDeleted[0].id]
        );
        requesterId = scope.user.id;
      } else {
        await sql.query(
          `INSERT INTO users (id, full_name, username, email, password_hash, role, status, department, assigned_warehouse_id, approved_at, deleted_at)
           VALUES ($1, $2, $3, $4, $5, $6::user_role, 'active'::user_status, 'Operations', $7, NOW(), NULL)
           ON CONFLICT (id) DO UPDATE SET assigned_warehouse_id = EXCLUDED.assigned_warehouse_id, deleted_at = NULL;`,
          [scope.user.id, scope.user.name || 'Warehouse Staff', scope.user.email, scope.user.email, scope.user.email, scope.role || 'staff', warehouseId]
        );
        requesterId = scope.user.id;
      }
    }

    if (requesterId && warehouseId) {
      try {
        await sql.query(
          `INSERT INTO user_warehouse_assignments (id, user_id, warehouse_id, is_primary)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (user_id, warehouse_id) DO UPDATE SET is_primary = TRUE;`,
          [`uwa-${requesterId}-${warehouseId}`, requesterId, warehouseId]
        );
      } catch {}
    }

    const requestId = await createRequest({
      warehouseId,
      department: typeof body.department === 'string' && body.department.trim()
        ? body.department.trim()
        : 'Field Operations',
      priority: normalizedPriority,
      purpose: purpose.trim(),
      items,
    }, { id: requesterId! });

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Stock request submitted for manager review.',
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create stock request:', err);
    return NextResponse.json({ success: false, message: 'Unable to submit the stock request.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (!scope.isAdmin && !scope.isManager) {
      return NextResponse.json(
        { success: false, message: 'Only an assigned manager or administrator can review stock requests.' },
        { status: 403 }
      );
    }
    if (scope.isManager && scope.isUnassigned) {
      return NextResponse.json(
        { success: false, message: 'You must be assigned to a warehouse to review requests.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, action } = body;

    if (typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ success: false, message: 'Request ID is required' }, { status: 400 });
    }
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ success: false, message: 'Action must be approve or reject.' }, { status: 400 });
    }

    let reviewerId: string = scope.user.id;
    const reviewerRows = await sql.query(
      `SELECT id, role, status, assigned_warehouse_id
       FROM users
       WHERE (id = $1 OR LOWER(email) = LOWER($2))
         AND deleted_at IS NULL
       ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END
       LIMIT 1;`,
      [scope.user.id, scope.user.email]
    );

    if (reviewerRows.length > 0) {
      reviewerId = reviewerRows[0].id;
    } else {
      try {
        await sql.query(
          `INSERT INTO users (id, full_name, username, email, password_hash, role, status, department, assigned_warehouse_id, approved_at, deleted_at)
           VALUES ($1, $2, $3, $4, $5, $6::user_role, 'active'::user_status, 'Management', $7, NOW(), NULL)
           ON CONFLICT (id) DO UPDATE SET assigned_warehouse_id = EXCLUDED.assigned_warehouse_id, deleted_at = NULL;`,
          [scope.user.id, scope.user.name || 'Inventory Manager', scope.user.email, scope.user.email, scope.user.email, scope.isAdmin ? 'super_admin' : 'manager', scope.warehouseId]
        );
      } catch {}
    }

    const reviewer = { id: reviewerId };
    const result = action === 'reject'
      ? await rejectRequest(id, reviewer)
      : await approveRequest(id, reviewer);
    return NextResponse.json({
      ...result,
      success: true,
      message: action === 'reject' ? 'Request rejected.' : 'Request approved.',
    });
  } catch (err: any) {
    const isConflict = err instanceof Error && err.message.startsWith('Request not found');
    return NextResponse.json(
      { success: false, message: err.message },
      { status: isConflict ? 409 : 500 }
    );
  }
}
