import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";

const db = new Kysely({
    dialect: new SqliteDialect({
        database: new Database("./db.sqlite"),
    }),
});

export const auth = betterAuth({
    database: kyselyAdapter(db),
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
