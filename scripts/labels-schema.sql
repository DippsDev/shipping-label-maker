-- Labels table for tracking generated labels
CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  carrier TEXT NOT NULL,
  service TEXT NOT NULL,
  "trackingNumber" TEXT NOT NULL,
  "shipToName" TEXT NOT NULL,
  "shipToAddress" TEXT NOT NULL,
  "shipToCity" TEXT NOT NULL,
  "shipToState" TEXT NOT NULL,
  "shipToZip" TEXT NOT NULL,
  weight TEXT,
  "createdAt" BIGINT NOT NULL
);

-- Create index for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_labels_userId ON labels("userId");

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_labels_trackingNumber ON labels("trackingNumber");
