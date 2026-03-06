#!/usr/bin/env node

const pg = require('pg');
const { Signer } = require('@aws-sdk/rds-signer');

async function setupDatabase() {
    // Check if we have the required environment variables
    if (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGDATABASE) {
        console.error('❌ Missing required environment variables: PGHOST, PGUSER, PGDATABASE');
        process.exit(1);
    }

    console.log('🔧 Setting up Aurora PostgreSQL database...');
    console.log(`📍 Host: ${process.env.PGHOST}`);
    console.log(`👤 User: ${process.env.PGUSER}`);
    console.log(`📦 Database: ${process.env.PGDATABASE}`);

    try {
        // Create connection pool
        const pool = new pg.Pool({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT || 5432,
            ssl: { rejectUnauthorized: false },
        });

        console.log('🔗 Connecting to database...');
        const client = await pool.connect();

        try {
            // Create address table
            console.log('📝 Creating address table...');
            await client.query(`
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
            console.log('✅ Address table created');

            // Create index
            console.log('📑 Creating index...');
            await client.query(`
        CREATE INDEX IF NOT EXISTS idx_address_userId ON address("userId")
      `);
            console.log('✅ Index created');

            console.log('\n✨ Database setup complete!');
            console.log('🎉 Your Aurora PostgreSQL database is ready for authentication.');
        } finally {
            client.release();
        }

        await pool.end();
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();
