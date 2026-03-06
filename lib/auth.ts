import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely, SqliteDialect, PostgresDialect } from "kysely";
import Database from "better-sqlite3";
import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { Signer } from "@aws-sdk/rds-signer";
import pg from "pg";

const { Pool } = pg;

// Use Aurora PostgreSQL in production, SQLite in development
const getDatabase = () => {
    // Check if we're in production with PostgreSQL
    if (process.env.PGHOST && process.env.AWS_REGION && process.env.AWS_ROLE_ARN && process.env.PGUSER && process.env.PGPORT) {
        // Production: Use Aurora PostgreSQL
        const signer = new Signer({
            hostname: process.env.PGHOST,
            port: Number(process.env.PGPORT),
            username: process.env.PGUSER,
            region: process.env.AWS_REGION,
            credentials: awsCredentialsProvider({
                roleArn: process.env.AWS_ROLE_ARN,
                clientConfig: { region: process.env.AWS_REGION },
            }),
        });

        const pool = new Pool({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            database: process.env.PGDATABASE || "postgres",
            password: () => signer.getAuthToken(),
            port: Number(process.env.PGPORT),
            ssl: { rejectUnauthorized: false },
            max: 20,
        });

        const db = new Kysely({
            dialect: new PostgresDialect({ pool: pool as any }),
        });
        return kyselyAdapter(db);
    } else {
        // Development: Use SQLite
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
