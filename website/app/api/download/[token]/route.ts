import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateLabelBuffer } from '@/lib/label-generator';

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: record, error } = await supabase
    .from('label_tokens')
    .select('*')
    .eq('id', token)
    .single();

  if (error || !record) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
  }

  if (record.used) {
    return NextResponse.json({ error: 'Token already used' }, { status: 410 });
  }

  if (record.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 410 });
  }

  // Mark token as used immediately to prevent race-condition double-spend
  await supabase
    .from('label_tokens')
    .update({ used: true })
    .eq('id', token);

  const labelData = JSON.parse(record.labelData);
  const pngBuffer = await generateLabelBuffer(labelData, false);

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="label_${labelData.trackingNumber}.png"`,
    },
  });
}
