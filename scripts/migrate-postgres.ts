import { config } from "dotenv";
import pg from "pg";

const { Pool } = pg;

// Load environment variables from .env.local
config({ path: ".env.local" });

// Bypass SSL certificate validation for migration
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function migrate() {
  if (!process.env.POSTGRES_URL) {
    console.error("PostgreSQL pool not available. Make sure environment variables are set.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
  } as any);

  try {
    console.log("Creating Better Auth tables...");

    // Better Auth will create its own tables automatically
    // But we need to create the address table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS address (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        "addressLine1" TEXT NOT NULL,
        "addressLine2" TEXT,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        "zipCode" TEXT NOT NULL,
        country TEXT NOT NULL,
        "isSaved" BOOLEAN DEFAULT true,
        "lastUsed" BIGINT NOT NULL,
        "usageCount" INTEGER DEFAULT 1,
        "createdAt" BIGINT NOT NULL,
        "updatedAt" BIGINT NOT NULL
      )
    `);

    console.log("✅ Address table created successfully");

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_address_userId ON address("userId")
    `);

    console.log("✅ Indexes created successfully");
    console.log("✅ Migration completed!");

    await pool.end();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
