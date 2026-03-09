# Wallet System

The wallet system tracks user balances for label generation costs.

## Features

✅ **Dynamic Balance**: Each user has their own wallet balance
✅ **Default Balance**: New users start with $100.00
✅ **In-Memory Storage**: Balances stored in memory (resets on server restart)
✅ **Dashboard Display**: Real-time balance shown on dashboard
✅ **Transaction Support**: Credit and debit operations

## API Endpoints

### GET /api/wallet?userId={userId}
Get wallet balance for a user.

**Response:**
```json
{
  "balance": 100.00,
  "userId": "guest"
}
```

### POST /api/wallet
Update wallet balance (add or deduct funds).

**Request:**
```json
{
  "userId": "guest",
  "amount": 10.00,
  "type": "credit" // or "debit"
}
```

**Response:**
```json
{
  "success": true,
  "balance": 110.00,
  "userId": "guest"
}
```

## How It Works

1. **New User**: Gets $100.00 default balance
2. **Dashboard**: Fetches balance from `/api/wallet`
3. **Label Generation**: Can deduct cost from balance (future feature)
4. **Top Up**: Can add funds via credit operation

## Default Balance

- New users: **$100.00**
- Stored per userId
- Resets when server restarts (in-memory storage)

## Future Enhancements

- [ ] Persist to database (PostgreSQL/SQLite)
- [ ] Deduct balance when generating labels
- [ ] Add payment integration for top-ups
- [ ] Transaction history
- [ ] Low balance notifications
- [ ] Pricing per carrier/service

## Database Schema

For production, use the schema in `scripts/wallet-schema.sql`:

```sql
CREATE TABLE wallet (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL
);

CREATE TABLE wallet_transactions (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  "createdAt" BIGINT NOT NULL
);
```

## Testing

1. Go to Dashboard
2. See "Wallet Balance" showing $100.00
3. Generate labels (balance stays same for now)
4. Restart server → balance resets to $100.00

To test balance updates, use the API:

```bash
# Add $50
curl -X POST http://localhost:3000/api/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId":"guest","amount":50,"type":"credit"}'

# Deduct $25
curl -X POST http://localhost:3000/api/wallet \
  -H "Content-Type: application/json" \
  -d '{"userId":"guest","amount":25,"type":"debit"}'
```
