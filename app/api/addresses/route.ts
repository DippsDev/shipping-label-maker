import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createPool } from "@/lib/db";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Bypass auth for testing
  const userId = session?.user?.id || "test-user";

  const pool = createPool();
  if (!pool) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  const result = await pool.query(
    `SELECT * FROM address WHERE "userId" = $1 ORDER BY "lastUsed" DESC, "createdAt" DESC`,
    [userId]
  );
  return NextResponse.json(result.rows);
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

  const pool = createPool();
  if (!pool) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  await pool.query(
    `INSERT INTO address (id, "userId", name, phone, "addressLine1", "addressLine2", city, state, "zipCode", country, "isSaved", "lastUsed", "usageCount", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [id, userId, name, phone || null, addressLine1, addressLine2 || null, city, state, zipCode, country, isSaved, now, 1, now, now]
  );

  const result = await pool.query(`SELECT * FROM address WHERE id = $1`, [id]);
  return NextResponse.json(result.rows[0], { status: 201 });
}
