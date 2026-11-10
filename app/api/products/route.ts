import { NextRequest, NextResponse } from 'next/server';
import { getDbProducts, createDbProduct } from '@/lib/supabaseServer';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const products = await getDbProducts(category);
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, message: 'Product name and price are required' },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: body.id || `prod-${Date.now()}`,
      name: body.name,
      category: body.category || '1-gram-gold',
      subcategory: body.subcategory || 'general',
      description: body.description || '',
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['/floral-curve-earrings-front.webp'],
      inStock: body.inStock !== false,
      stockCount: Number(body.stockCount || 10),
      featured: Boolean(body.featured),
      material: body.material || '22KT Micro Gold Plated',
      polishWarranty: body.polishWarranty || '22KT Micro Gold Plated Finish',
      isWaterproof: Boolean(body.isWaterproof),
      isSweatproof: body.isSweatproof !== false,
      careInstructions: body.careInstructions || 'Keep away from direct perfumes, moisture and chemicals.',
      weightGrams: body.weightGrams ? Number(body.weightGrams) : undefined,
      sizeOptions: Array.isArray(body.sizeOptions) ? body.sizeOptions : [],
    };

    const saved = await createDbProduct(newProduct);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
