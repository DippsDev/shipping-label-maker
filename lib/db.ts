import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import { Pool } from "pg";

// Create AWS RDS Signer for IAM authentication
const createSigner = () => {
    if (!process.env.PGHOST || !process.env.AWS_REGION || !process.env.AWS_ROLE_ARN) {
        return null;
    }

    return new Signer({
        hostname: process.env.PGHOST,
        port: Number(process.env.PGPORT),
        username: process.env.PGUSER,
        region: process.env.AWS_REGION,
        credentials: awsCredentialsProvider({
            roleArn: process.env.AWS_ROLE_ARN,
            clientConfig: { region: process.env.AWS_REGION },
        }),
    });
};

// Create PostgreSQL connection pool
export const createPool = () => {
    const signer = createSigner();

    if (signer) {
        // Production: Use Aurora PostgreSQL with IAM authentication
        const pool = new Pool({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            database: process.env.PGDATABASE || "postgres",
            password: () => signer.getAuthToken(),
            port: Number(process.env.PGPORT),
            ssl: { rejectUnauthorized: false },
            max: 20,
        });

        attachDatabasePool(pool);
        return pool;
    }

    // Development: Return null to use SQLite
    return null;
};

// Single query transaction
export async function query(sql: string, args: unknown[]) {
    const pool = createPool();
    if (!pool) {
        throw new Error("Database pool not available");
    }
    return pool.query(sql, args);
}
