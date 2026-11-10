import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode } = await params;
    const { searchParams } = new URL(req.url);
    const isCod = searchParams.get('cod') === 'true';
    const weightKg = Number(searchParams.get('weight') || 0.25);
    const mult = Math.max(1, weightKg / 0.25);

    const rates = [
      {
        courier_name: 'Blue Dart Express Air',
        courier_company_id: 1,
        freight_charge: Math.round(78 * mult),
        cod_charges: isCod ? 30 : 0,
        rate: Math.round(78 * mult) + (isCod ? 30 : 0),
        etd: '2 Days (Air Fast Track)',
        rating: 4.8,
        mode: 'Air',
        is_surface: false,
        recommended: false,
      },
      {
        courier_name: 'Delhivery Surface Express',
        courier_company_id: 2,
        freight_charge: Math.round(42 * mult),
        cod_charges: isCod ? 25 : 0,
        rate: Math.round(42 * mult) + (isCod ? 25 : 0),
        etd: '3-4 Days',
        rating: 4.6,
        mode: 'Surface',
        is_surface: true,
        recommended: true,
      },
      {
        courier_name: 'DTDC Express Surface',
        courier_company_id: 3,
        freight_charge: Math.round(48 * mult),
        cod_charges: isCod ? 25 : 0,
        rate: Math.round(48 * mult) + (isCod ? 25 : 0),
        etd: '3 Days',
        rating: 4.5,
        mode: 'Surface',
        is_surface: true,
        recommended: false,
      },
      {
        courier_name: 'Ekart Logistics Surface',
        courier_company_id: 4,
        freight_charge: Math.round(39 * mult),
        cod_charges: isCod ? 20 : 0,
        rate: Math.round(39 * mult) + (isCod ? 20 : 0),
        etd: '3 Days',
        rating: 4.7,
        mode: 'Surface',
        is_surface: true,
        recommended: false,
      },
    ];

    return NextResponse.json({ success: true, data: rates, pincode });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
