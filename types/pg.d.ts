declare module 'pg' {
    export interface PoolConfig {
        host?: string;
        user?: string;
        database?: string;
        password?: string | (() => Promise<string>);
        port?: number;
        ssl?: boolean | { rejectUnauthorized: boolean };
        max?: number;
    }

    export interface QueryResult {
        rows: unknown[];
        rowCount: number;
    }

    export class Pool {
        constructor(config: PoolConfig);
        query(sql: string, values?: unknown[]): Promise<QueryResult>;
        end(): Promise<void>;
    }
}
