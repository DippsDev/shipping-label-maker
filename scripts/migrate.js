// @ts-nocheck
const Database = require('better-sqlite3');
const db = new Database('./db.sqlite');

// Drop existing tables to recreate with correct schema

// Drop existing tables to recreate with correct schema
db.exec(`DROP TABLE IF EXISTS verification;`);
db.exec(`DROP TABLE IF EXISTS account;`);
db.exec(`DROP TABLE IF EXISTS session;`);
db.exec(`DROP TABLE IF EXISTS user;`);

// Create user table
db.exec(`
  CREATE TABLE user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    emailVerified INTEGER DEFAULT 0,
    name TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    image TEXT
  );
`);

// Create session table
db.exec(`
  CREATE TABLE session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );
`);

// Create account table
db.exec(`
  CREATE TABLE account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    expiresAt INTEGER,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );
`);

// Create verification table
db.exec(`
  CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`);

console.log('✅ Database tables created successfully!');
db.close();
