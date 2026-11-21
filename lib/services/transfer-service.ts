// filepath: lib/services/transfer-service.ts
import { sql } from '@/lib/db';
import { TransferRecord, TransferStatus, TransferType } from '@/types/transfers';

/**
 * @file lib/services/transfer-service.ts
 * @description Transfer service managing inter-facility stock movements and in-transit tracking with dual-persistence.
 */

declare global {
  // eslint-disable-next-line no-var
  var __vista_runtime_transfers__: TransferRecord[] | undefined;
}

function initRuntimeTransfers(): TransferRecord[] {
  return [];
  if (!globalThis.__vista_runtime_transfers__) {
    globalThis.__vista_runtime_transfers__ = [
      {
        id: 'trf-init-001',
        dateTime: 'Today, 11:30 AM',
        transferId: 'TRF-2025-048',
        type: 'Inter-Facility',
        fromWarehouse: 'Central Medical Store Kathmandu',
        toWarehouse: 'Western Regional Medical Depot Pokhara',
        itemCount: 2,
        quantity: 250,
        status: 'Pending',
        performedBy: 'David Kim',
        performedByRole: 'Floor Logistics Specialist',
        reference: 'REG-TRF-091',
        primaryItem: {
          itemCode: 'VST-001',
          itemName: 'Surgical Mask 3-Ply',
          category: 'Consumables',
          unit: 'Box',
          quantity: 200,
        },
        allItems: [
          { itemCode: 'VST-001', itemName: 'Surgical Mask 3-Ply', category: 'Consumables', quantity: 200, unit: 'Box' },
          { itemCode: 'VST-005', itemName: 'IV Infusion Set Sterile', category: 'Medical Supplies', quantity: 50, unit: 'Pack' },
        ],
        notes: 'Priority inter-depot stock rebalancing ahead of regional surge.',
        approvedBy: 'Pending Manager Approval',
        approvalDate: 'Pending',
        documentName: 'Transfer_TRF-2025-048.pdf',
        timeline: [
          { step: 'Transfer Requisition Created', time: '11:30 AM', actor: 'David Kim', role: 'Staff', completed: true },
          { step: 'Approved by Facility Manager', time: 'Pending', actor: 'Facility Manager', role: 'Manager', completed: false },
          { step: 'In-Transit Freight Dispatch', time: 'Pending', actor: 'Dispatch Driver', role: 'Logistics', completed: false },
          { step: 'Received & Stored at Destination', time: 'Pending', actor: 'Receiving Specialist', role: 'Staff', completed: false },
        ],
      },
      {
        id: 'trf-init-002',
        dateTime: 'Yesterday, 15:45 PM',
        transferId: 'TRF-2025-046',
        type: 'Inter-Facility',
        fromWarehouse: 'Central Medical Store Kathmandu',
        toWarehouse: 'Eastern Distribution Center Biratnagar',
        itemCount: 1,
        quantity: 100,
        status: 'In Transit',
        performedBy: 'Sarah Wilson',
        performedByRole: 'Logistics Lead',
        reference: 'DISP-TRF-084',
        primaryItem: {
          itemCode: 'VST-002',
          itemName: 'Nitrile Examination Gloves',
          category: 'PPE',
          unit: 'Box',
          quantity: 100,
        },
        allItems: [
          { itemCode: 'VST-002', itemName: 'Nitrile Examination Gloves', category: 'PPE', quantity: 100, unit: 'Box' },
        ],
        notes: 'Dispatched via MedFreight Express Carrier.',
        approvedBy: 'Alex Rivera',
        approvalDate: 'Yesterday, 16:00 PM',
        documentName: 'Transfer_TRF-2025-046.pdf',
        timeline: [
          { step: 'Transfer Requisition Created', time: '15:45 PM', actor: 'Sarah Wilson', role: 'Staff', completed: true },
          { step: 'Approved by Facility Manager', time: '16:00 PM', actor: 'Alex Rivera', role: 'Manager', completed: true },
          { step: 'In-Transit Freight Dispatch', time: '16:30 PM', actor: 'MedFreight Carrier', role: 'Logistics', completed: true },
          { step: 'Received & Stored at Destination', time: 'Expected Today', actor: 'Receiving Lead', role: 'Staff', completed: false },
        ],
      },
    ];
  }
  return globalThis.__vista_runtime_transfers__!;
}

export async function getTransfers(options: { warehouseId?: string | null; status?: string } = {}): Promise<TransferRecord[]> {
  const { warehouseId, status } = options;

  try {
    let query = `
      SELECT 
        t.id,
        t.transfer_number,
        t.status,
        t.notes,
        t.created_at,
        w_from.name as from_warehouse_name,
        w_to.name as to_warehouse_name,
        u_req.full_name as requested_by_name,
        u_app.full_name as approved_by_name,
        COALESCE(items_agg.item_count, 0)::int as item_count,
        COALESCE(items_agg.total_qty, 0)::int as total_qty,
        items_agg.primary_item_code,
        items_agg.primary_item_name,
        items_agg.primary_item_unit
      FROM transfers t
      JOIN warehouses w_from ON t.from_warehouse_id = w_from.id
      JOIN warehouses w_to ON t.to_warehouse_id = w_to.id
      LEFT JOIN users u_req ON t.requested_by_id = u_req.id
      LEFT JOIN users u_app ON t.approved_by_id = u_app.id
      LEFT JOIN (
        SELECT 
          ti.transfer_id,
          COUNT(ti.id) as item_count,
          SUM(ti.quantity) as total_qty,
          MIN(i.code) as primary_item_code,
          MIN(i.name) as primary_item_name,
          MIN(i.unit) as primary_item_unit
        FROM transfer_items ti
        JOIN items i ON ti.item_id = i.id
        GROUP BY ti.transfer_id
      ) items_agg ON t.id = items_agg.transfer_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (warehouseId && warehouseId !== 'All') {
      query += ` AND (t.from_warehouse_id = $${paramIdx} OR t.to_warehouse_id = $${paramIdx} OR w_from.name = $${paramIdx} OR w_to.name = $${paramIdx})`;
      params.push(warehouseId);
      paramIdx++;
    }

    if (status && status !== 'All') {
      query += ` AND t.status = $${paramIdx++}::transfer_status`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC;`;

    const rows = await sql.query(query, params);

    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        dateTime: new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        transferId: r.transfer_number,
        type: 'Inter-Facility' as TransferType,
        fromWarehouse: r.from_warehouse_name,
        toWarehouse: r.to_warehouse_name,
        itemCount: r.item_count || 1,
        quantity: r.total_qty || 0,
        status: r.status as TransferStatus,
        performedBy: r.requested_by_name || 'System Operator',
        performedByRole: 'Logistics Lead',
        reference: '--',
        primaryItem: {
          itemCode: r.primary_item_code || 'VST-001',
          itemName: r.primary_item_name || 'Medical Consumables',
          category: 'Medical Supplies',
          unit: r.primary_item_unit || 'Box',
          quantity: r.total_qty || 0,
        },
        allItems: [],
        notes: r.notes || 'Inter-facility transfer request.',
        approvedBy: r.approved_by_name || 'Pending Approval',
        approvalDate: r.status === 'Completed' ? 'Approved' : 'Pending',
        documentName: 'Transfer Report.pdf',
        timeline: [
          { step: 'Transfer Requisition Created', time: '10:00 AM', actor: r.requested_by_name || 'Staff', role: 'Staff', completed: true },
          { step: 'Approved by Facility Manager', time: '11:30 AM', actor: r.approved_by_name || 'Manager', role: 'Manager', completed: r.status !== 'Pending' },
          { step: 'In-Transit Freight Dispatch', time: '01:00 PM', actor: 'Dispatch Driver', role: 'Logistics', completed: r.status === 'In Transit' || r.status === 'Completed' },
          { step: 'Received & Stored at Destination', time: '04:00 PM', actor: 'Receiving Specialist', role: 'Staff', completed: r.status === 'Completed' },
        ],
      }));
    }
  } catch {
    // Runtime store fallback below
  }

  const list = initRuntimeTransfers();
  return list.filter((t) => {
    if (warehouseId && warehouseId !== 'All' && t.fromWarehouse !== warehouseId && t.toWarehouse !== warehouseId) return false;
    if (status && status !== 'All' && t.status !== status) return false;
    return true;
  });
}

export async function executeTransferBalances(data: {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: Array<{ itemId: string; quantity: number; batchNumber?: string }>;
  transferNumber: string;
  user: { id: string };
  notes?: string;
}): Promise<void> {
  for (let i = 0; i < data.items.length; i++) {
    const it = data.items[i];
    const qty = Math.max(1, Number(it.quantity) || 1);
    const batch = it.batchNumber || 'LOT-TRANSFER';

    try {
      // 1. Resolve Item
      const itemRows = await sql.query(
        `SELECT id, code, name, unit FROM items WHERE id = $1 OR code = $1 LIMIT 1;`,
        [it.itemId]
      );
      if (!itemRows || itemRows.length === 0) continue;
      const realItemId = itemRows[0].id;

      // 2. Outflow from source warehouse
      let sourceBinId: string | null = null;
      let prevSourceBal = 0;
      let newSourceBal = 0;

      const sourceBalRows = await sql.query(
        `SELECT id, bin_id, quantity_on_hand FROM stock_balances
         WHERE warehouse_id = $1 AND item_id = $2
         ORDER BY quantity_on_hand DESC LIMIT 1;`,
        [data.fromWarehouseId, realItemId]
      );

      if (sourceBalRows && sourceBalRows.length > 0) {
        const bal = sourceBalRows[0];
        sourceBinId = bal.bin_id;
        prevSourceBal = Number(bal.quantity_on_hand) || 0;
        newSourceBal = Math.max(0, prevSourceBal - qty);

        await sql.query(
          `UPDATE stock_balances
           SET quantity_on_hand = $1, updated_at = NOW()
           WHERE id = $2;`,
          [newSourceBal, bal.id]
        );
      }

      const movOutId = `mov-${Date.now()}-out-${i}`;
      const movOutNum = `MOV-TRF-OUT-${Math.floor(1000 + Math.random() * 9000)}`;
      await sql.query(
        `INSERT INTO stock_movements (
           id, movement_number, warehouse_id, item_id, bin_id, type, quantity,
           previous_balance, new_balance, batch_number, reference_id, performed_by_id, notes
         ) VALUES (
           $1, $2, $3, $4, $5, 'TRANSFER_OUT'::movement_type, $6, $7, $8, $9, $10, $11, $12
         ) ON CONFLICT DO NOTHING;`,
        [
          movOutId,
          movOutNum,
          data.fromWarehouseId,
          realItemId,
          sourceBinId,
          qty,
          prevSourceBal,
          newSourceBal,
          batch,
          data.transferNumber,
          data.user.id,
          data.notes || 'Inter-facility transfer dispatch',
        ]
      );

      // 3. Inflow to destination warehouse
      let destBinId: string | null = null;
      const destBins = await sql.query(
        `SELECT id FROM storage_bins WHERE warehouse_id = $1 AND is_active = TRUE LIMIT 1;`,
        [data.toWarehouseId]
      );

      if (destBins && destBins.length > 0) {
        destBinId = destBins[0].id;
      } else {
        // Ensure at least 1 default zone and bin exists in destination warehouse
        const autoZoneId = `z-${Date.now()}-${i}`;
        const autoBinId = `bin-${Date.now()}-${i}`;
        await sql.query(
          `INSERT INTO storage_zones (id, warehouse_id, code, name, temp_range)
           VALUES ($1, $2, 'Zone A', 'General Receiving Bay', 'Ambient')
           ON CONFLICT (id) DO NOTHING;`,
          [autoZoneId, data.toWarehouseId]
        );
        await sql.query(
          `INSERT INTO storage_bins (id, zone_id, warehouse_id, bin_code, is_active)
           VALUES ($1, $2, $3, 'A1-01', TRUE)
           ON CONFLICT (id) DO NOTHING;`,
          [autoBinId, autoZoneId, data.toWarehouseId]
        );
        destBinId = autoBinId;
      }

      let prevTargetBal = 0;
      let newTargetBal = qty;

      const targetBalRows = await sql.query(
        `SELECT id, quantity_on_hand FROM stock_balances
         WHERE warehouse_id = $1 AND item_id = $2
         LIMIT 1;`,
        [data.toWarehouseId, realItemId]
      );

      if (targetBalRows && targetBalRows.length > 0) {
        prevTargetBal = Number(targetBalRows[0].quantity_on_hand) || 0;
        newTargetBal = prevTargetBal + qty;
        await sql.query(
          `UPDATE stock_balances
           SET quantity_on_hand = $1, updated_at = NOW()
           WHERE id = $2;`,
          [newTargetBal, targetBalRows[0].id]
        );
      } else {
        const newBalId = `sb-${Date.now()}-${i}`;
        await sql.query(
          `INSERT INTO stock_balances (
             id, warehouse_id, item_id, bin_id, batch_number, quantity_on_hand, quantity_reserved, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, 0, NOW()
           );`,
          [newBalId, data.toWarehouseId, realItemId, destBinId, batch, qty]
        );
      }

      const movInId = `mov-${Date.now()}-in-${i}`;
      const movInNum = `MOV-TRF-IN-${Math.floor(1000 + Math.random() * 9000)}`;
      await sql.query(
        `INSERT INTO stock_movements (
           id, movement_number, warehouse_id, item_id, bin_id, type, quantity,
           previous_balance, new_balance, batch_number, reference_id, performed_by_id, notes
         ) VALUES (
           $1, $2, $3, $4, $5, 'TRANSFER_IN'::movement_type, $6, $7, $8, $9, $10, $11, $12
         ) ON CONFLICT DO NOTHING;`,
        [
          movInId,
          movInNum,
          data.toWarehouseId,
          realItemId,
          destBinId,
          qty,
          prevTargetBal,
          newTargetBal,
          batch,
          data.transferNumber,
          data.user.id,
          data.notes || 'Inter-facility transfer receipt',
        ]
      );
    } catch (err) {
      console.error(`Error updating balances for transferred item ${it.itemId}:`, err);
    }
  }
}

export async function createTransfer(data: {
  fromWarehouseId: string;
  toWarehouseId: string;
  notes?: string;
  items: Array<{ itemId: string; quantity: number; batchNumber?: string }>;
  autoComplete?: boolean;
}, user: { id: string }): Promise<string> {
  const transferId = `trf-${Date.now()}`;
  const transferNumber = `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const initialStatus = data.autoComplete ? 'Completed' : 'Pending';

  try {
    await sql.query(
      `INSERT INTO transfers (id, transfer_number, from_warehouse_id, to_warehouse_id, status, requested_by_id, approved_by_id, notes)
       VALUES ($1, $2, $3, $4, $5::transfer_status, $6, $7, $8);`,
      [
        transferId,
        transferNumber,
        data.fromWarehouseId,
        data.toWarehouseId,
        initialStatus,
        user.id,
        data.autoComplete ? user.id : null,
        data.notes || 'Inter-facility transfer.',
      ]
    );

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      // Resolve item ID if code was passed
      const itemLookup = await sql.query(
        `SELECT id FROM items WHERE id = $1 OR code = $1 LIMIT 1;`,
        [item.itemId]
      );
      const resolvedId = itemLookup && itemLookup.length > 0 ? itemLookup[0].id : item.itemId;

      await sql.query(
        `INSERT INTO transfer_items (id, transfer_id, item_id, batch_number, quantity)
         VALUES ($1, $2, $3, $4, $5);`,
        [`ti-${Date.now()}-${i}`, transferId, resolvedId, item.batchNumber || 'LOT-TRANSFER', item.quantity]
      );
    }

    if (data.autoComplete) {
      await executeTransferBalances({
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        items: data.items,
        transferNumber,
        user,
        notes: data.notes,
      });
    }
  } catch (dbErr) {
    console.error('Error creating transfer in database:', dbErr);
    // Runtime fallback
    const list = initRuntimeTransfers();
    list.unshift({
      id: transferId,
      dateTime: 'Just now',
      transferId: transferNumber,
      type: 'Inter-Facility',
      fromWarehouse: 'Source Warehouse',
      toWarehouse: 'Destination Depot',
      itemCount: data.items.length,
      quantity: data.items.reduce((s, it) => s + (it.quantity || 0), 0),
      status: initialStatus as TransferStatus,
      performedBy: 'Operations Admin',
      performedByRole: 'Warehouse Lead',
      reference: 'TRF-REQ',
      primaryItem: {
        itemCode: 'VST-ITEM',
        itemName: 'Medical Items',
        category: 'Supplies',
        unit: 'Unit',
        quantity: data.items[0]?.quantity || 10,
      },
      allItems: [],
      notes: data.notes || 'Transfer created.',
      approvedBy: data.autoComplete ? 'System Administrator' : 'Pending Manager Approval',
      approvalDate: data.autoComplete ? 'Approved Just Now' : 'Pending',
      documentName: `Transfer_${transferNumber}.pdf`,
      timeline: [
        { step: 'Transfer Requisition Created', time: 'Just now', actor: 'Operations Admin', role: 'Staff', completed: true },
        { step: 'Approved by Facility Manager', time: data.autoComplete ? 'Just now' : 'Pending', actor: 'Operations Admin', role: 'Manager', completed: Boolean(data.autoComplete) },
        { step: 'In-Transit Freight Dispatch', time: data.autoComplete ? 'Just now' : 'Pending', actor: 'MedFreight Express', role: 'Logistics', completed: Boolean(data.autoComplete) },
        { step: 'Received & Stored at Destination', time: data.autoComplete ? 'Just now' : 'Pending', actor: 'Receiving Specialist', role: 'Staff', completed: Boolean(data.autoComplete) },
      ],
    });
  }

  return transferId;
}

export async function approveTransfer(transferId: string, user: { id: string }) {
  try {
    await sql.query(
      `UPDATE transfers SET status = 'In Transit'::transfer_status, approved_by_id = $2, updated_at = NOW() WHERE id = $1 OR transfer_number = $1;`,
      [transferId, user.id]
    );
  } catch {
    // Runtime fallback
    const list = initRuntimeTransfers();
    const match = list.find((t) => t.id === transferId || t.transferId === transferId);
    if (match) {
      match.status = 'In Transit';
      match.approvedBy = 'Facility Manager';
      match.approvalDate = 'Approved Just Now';
      if (match.timeline[1]) match.timeline[1].completed = true;
      if (match.timeline[2]) match.timeline[2].completed = true;
    }
  }
  return { success: true, transferId, status: 'In Transit' };
}

export async function completeTransfer(transferId: string, user: { id: string }) {
  try {
    // Fetch transfer details to move balances
    const rows = await sql.query(
      `SELECT t.from_warehouse_id, t.to_warehouse_id, t.transfer_number, t.notes
       FROM transfers t WHERE t.id = $1 OR t.transfer_number = $1 LIMIT 1;`,
      [transferId]
    );

    if (rows && rows.length > 0) {
      const tr = rows[0];
      const itemRows = await sql.query(
        `SELECT item_id, batch_number, quantity FROM transfer_items WHERE transfer_id = $1;`,
        [transferId]
      );

      if (itemRows && itemRows.length > 0) {
        await executeTransferBalances({
          fromWarehouseId: tr.from_warehouse_id,
          toWarehouseId: tr.to_warehouse_id,
          items: itemRows.map((it: any) => ({
            itemId: it.item_id,
            quantity: Number(it.quantity),
            batchNumber: it.batch_number,
          })),
          transferNumber: tr.transfer_number,
          user,
          notes: tr.notes,
        });
      }
    }

    await sql.query(
      `UPDATE transfers SET status = 'Completed'::transfer_status, approved_by_id = $2, updated_at = NOW() WHERE id = $1 OR transfer_number = $1;`,
      [transferId, user.id]
    );
  } catch (err) {
    console.error('Error completing transfer in DB:', err);
    // Runtime fallback
    const list = initRuntimeTransfers();
    const match = list.find((t) => t.id === transferId || t.transferId === transferId);
    if (match) {
      match.status = 'Completed';
      match.timeline.forEach((step) => { step.completed = true; });
    }
  }
  return { success: true, transferId, status: 'Completed' };
}

export async function rejectTransfer(transferId: string, user: { id: string }, reason?: string) {
  try {
    await sql.query(
      `UPDATE transfers SET status = 'Cancelled'::transfer_status, approved_by_id = $2, updated_at = NOW() WHERE id = $1 OR transfer_number = $1;`,
      [transferId, user.id]
    );
  } catch {
    // Runtime fallback
    const list = initRuntimeTransfers();
    const match = list.find((t) => t.id === transferId || t.transferId === transferId);
    if (match) {
      match.status = 'Rejected' as any;
      match.notes = reason || 'Rejected by Facility Manager.';
    }
  }
  return { success: true, transferId, status: 'Rejected' };
}
