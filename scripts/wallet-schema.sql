-- Wallet table for tracking user balances
CREATE TABLE IF NOT EXISTS wallet (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL
);

-- Create index for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_wallet_userId ON wallet("userId");

-- Wallet transactions table for tracking all balance changes
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'credit' or 'debit'
  description TEXT,
  "createdAt" BIGINT NOT NULL
);

-- Create index for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_userId ON wallet_transactions("userId");
