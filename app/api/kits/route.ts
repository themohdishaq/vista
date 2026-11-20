// filepath: app/api/kits/route.ts
import { NextResponse } from 'next/server';
import { getKits } from '@/lib/services/kit-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const kits = await getKits();
    return NextResponse.json({ success: true, data: kits });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
