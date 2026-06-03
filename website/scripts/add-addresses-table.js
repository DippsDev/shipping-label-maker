// @ts-nocheck
const Database = require('better-sqlite3');
const db = new Database('./db.sqlite');

// Create addresses table
db.exec(`
  CREATE TABLE IF NOT EXISTS address (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    addressLine1 TEXT NOT NULL,
    addressLine2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zipCode TEXT NOT NULL,
    country TEXT NOT NULL,
    isSaved INTEGER DEFAULT 1,
    lastUsed INTEGER,
    usageCount INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );
`);

console.log('✅ Address table created successfully!');
db.close();
