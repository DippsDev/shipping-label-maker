import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely, SqliteDialect, PostgresDialect } from "kysely";
import Database from "better-sqlite3";
import pg from "pg";

const { Pool } = pg;

// Use Supabase Postgres in production, SQLite in development
const getDatabase = () => {
    if (process.env.POSTGRES_URL) {
        // Production: Use Supabase Postgres
        const pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: { rejectUnauthorized: false },
            max: 20,
        } as any);

        const db = new Kysely<any>({
            dialect: new PostgresDialect({ pool } as any),
        });
        return kyselyAdapter(db);
    } else {
        // Development: Use SQLite
        const db = new Kysely<any>({
            dialect: new SqliteDialect({
                database: new Database("./db.sqlite"),
            }),
        });
        return kyselyAdapter(db);
    }
};

export const auth = betterAuth({
    database: getDatabase(),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        },
    },
});
