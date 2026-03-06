import pg from "pg";
import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { Signer } from "@aws-sdk/rds-signer";

const { Pool } = pg;

// Create PostgreSQL connection pool for direct queries
export const createPool = () => {
    if (!process.env.PGHOST || !process.env.AWS_REGION || !process.env.AWS_ROLE_ARN || !process.env.PGUSER || !process.env.PGPORT) {
        return null;
    }

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

    return new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE || "postgres",
        password: () => signer.getAuthToken(),
        port: Number(process.env.PGPORT),
        ssl: { rejectUnauthorized: false },
        max: 20,
    });
};
