import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import Database from "better-sqlite3";
import { createPool } from "@/lib/db";

// Use Aurora PostgreSQL in production, SQLite in development
const getDb = () => {
  const pool = createPool();
  if (pool) {
    return { pool, isPostgres: true };
  }
  return { db: new Database("./db.sqlite"), isPostgres: false };
};

export async function GET() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbConnection = getDb();

  if (dbConnection.isPostgres && dbConnection.pool) {
    // PostgreSQL query
    const result = await dbConnection.pool.query(
      `SELECT * FROM address WHERE "userId" = $1 ORDER BY "lastUsed" DESC, "createdAt" DESC`,
      [session.user.id]
    );
    return NextResponse.json(result.rows);
  } else if (dbConnection.db) {
    // SQLite query
    const addresses = dbConnection.db
      .prepare(`SELECT * FROM address WHERE userId = ? ORDER BY lastUsed DESC, createdAt DESC`)
      .all(session.user.id);
    return NextResponse.json(addresses);
  }

  return NextResponse.json({ error: "Database not available" }, { status: 500 });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, addressLine1, addressLine2, city, state, zipCode, country, isSaved = true } = body;

  if (!name || !addressLine1 || !city || !state || !zipCode || !country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  const dbConnection = getDb();

  if (dbConnection.isPostgres && dbConnection.pool) {
    // PostgreSQL insert
    await dbConnection.pool.query(
      `INSERT INTO address (id, "userId", name, phone, "addressLine1", "addressLine2", city, state, "zipCode", country, "isSaved", "lastUsed", "usageCount", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [id, session.user.id, name, phone || null, addressLine1, addressLine2 || null, city, state, zipCode, country, isSaved, now, 1, now, now]
    );

    const result = await dbConnection.pool.query(`SELECT * FROM address WHERE id = $1`, [id]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } else if (dbConnection.db) {
    // SQLite insert
    dbConnection.db
      .prepare(
        `INSERT INTO address (id, userId, name, phone, addressLine1, addressLine2, city, state, zipCode, country, isSaved, lastUsed, usageCount, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, session.user.id, name, phone || null, addressLine1, addressLine2 || null, city, state, zipCode, country, isSaved ? 1 : 0, now, 1, now, now);

    const newAddress = dbConnection.db.prepare("SELECT * FROM address WHERE id = ?").get(id);
    return NextResponse.json(newAddress, { status: 201 });
  }

  return NextResponse.json({ error: "Database not available" }, { status: 500 });
}
