import { sql } from "@vercel/postgres";
import pg from "pg";

const { Pool } = pg;

// Create PostgreSQL connection pool for direct queries
export const createPool = () => {
    // Use Vercel Postgres connection string if available
    if (process.env.POSTGRES_URL) {
        return new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: { rejectUnauthorized: false },
            max: 20,
        } as any);
    }

    // Fallback to null (will use SQLite in development)
    return null;
};

// Export Vercel's sql helper for convenience
export { sql };
