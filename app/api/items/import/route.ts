// filepath: app/api/items/import/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { bulkImportItems } from '@/lib/services/item-service';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin only can import inventory.' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let parsedRows: any[] = [];
    let targetWarehouseId = 'wh-001';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const wh = formData.get('warehouseId') as string | null;
      if (wh) targetWarehouseId = wh;

      if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(sheet);

      parsedRows = rawJson.map((row: any) => ({
        code: row['Item Code'] || row['Code'] || row['code'] || row['SKU'],
        name: row['Item Name'] || row['Name'] || row['name'] || row['Title'],
        category: row['Category'] || row['category'],
        unit: row['Unit'] || row['unit'] || 'Box',
        stockQuantity: row['Quantity'] || row['Stock Quantity'] || row['stockQuantity'] || row['Qty'] || 0,
        reorderLevel: row['Reorder Level'] || row['reorderLevel'] || 100,
        description: row['Description'] || row['description'] || '',
      }));
    } else {
      const body = await request.json();
      parsedRows = body.items || [];
      if (body.warehouseId) targetWarehouseId = body.warehouseId;
    }

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid item rows detected in spreadsheet.' },
        { status: 400 }
      );
    }

    const result = await bulkImportItems(parsedRows, targetWarehouseId);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.importedCount} items into the database.`,
      importedCount: result.importedCount,
      errors: result.errors,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Error processing spreadsheet import: ' + err.message },
      { status: 500 }
    );
  }
}
