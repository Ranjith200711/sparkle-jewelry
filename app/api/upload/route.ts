import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('photos') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'No photos uploaded' }, { status: 400 });
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || 'image/jpeg';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;
      imageUrls.push(dataUrl);
    }

    return NextResponse.json({ success: true, imageUrls });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
