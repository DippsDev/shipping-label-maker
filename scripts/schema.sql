-- Aurora PostgreSQL Schema for Label Maker App
-- Run this in AWS Console or using any PostgreSQL client

-- Better Auth tables will be created automatically by the library
-- This script only creates the custom tables

-- Address table for storing user addresses
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
);

-- Create index for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_address_userId ON address("userId");

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
