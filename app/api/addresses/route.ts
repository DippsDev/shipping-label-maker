import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function GET() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Bypass auth for testing
  const userId = session?.user?.id || "test-user";
  const dbSupabase = getSupabase();

  const { data, error } = await dbSupabase
    .from('address')
    .select('*')
    .eq('userId', userId)
    .order('lastUsed', { ascending: false })
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Bypass auth for testing
  const userId = session?.user?.id || "test-user";

  const body = await request.json();
  const { name, phone, addressLine1, addressLine2, city, state, zipCode, country, isSaved = true } = body;

  if (!name || !addressLine1 || !city || !state || !zipCode || !country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const dbSupabase = getSupabase();

  const { data, error } = await dbSupabase
    .from('address')
    .insert({
      id,
      userId,
      name,
      phone: phone || null,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state,
      zipCode,
      country,
      isSaved,
      lastUsed: now,
      usageCount: 1,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
