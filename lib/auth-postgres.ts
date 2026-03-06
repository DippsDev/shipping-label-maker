import { betterAuth } from "better-auth";
import { Pool } from "@vercel/postgres";

// Use Vercel Postgres in production, SQLite in development
const getDatabase = () => {
    if (process.env.POSTGRES_URL) {
        // Production: Use Vercel Postgres
        return new Pool({ connectionString: process.env.POSTGRES_URL });
    } else {
        // Development: Use SQLite
        const { kyselyAdapter } = require("@better-auth/kysely-adapter");
        const { Kysely, SqliteDialect } = require("kysely");
        const Database = require("better-sqlite3");

        const db = new Kysely({
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
