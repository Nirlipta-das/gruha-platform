# GRUHA Quick Start Guide - SQLite Mode (No Docker)

This guide helps you run the GRUHA platform with real data using SQLite (no Docker or external services required).

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
# Install all dependencies
npm install

# Build shared packages first
cd packages/shared-db && npm install && npm run build
cd ../shared-types && npm install && npm run build
cd ../..
```

## Running the Platform

### Option 1: Run All Services (Recommended)

```bash
# Terminal 1 - Start API Gateway (port 3001)
cd services/api-gateway
npm run dev

# Terminal 2 - Start Wallet Service (port 3005)
cd services/wallet-service  
npm run dev

# Terminal 3 - Start Booking Service (port 3004)
cd services/booking-service
npm run dev

# Terminal 4 - Start Frontend (port 3000)
cd apps/web
npm run dev
```

### Option 2: Just Frontend (Mock Data)
```bash
cd apps/web
npm run dev
```

## Database

The SQLite database is automatically created and seeded on first run:
- Location: `services/api-gateway/data/gruha.db`
- Contains: 10 MSMEs, 6 vendors, 5 warehouses, 2 active disasters, etc.

### Manual Seeding
```bash
npm run db:seed
# or
cd packages/shared-db && npx tsx src/seed.ts
```

## Demo Accounts

### MSMEs (Login with mobile number + OTP: 123456)
| Mobile | Business | Location |
|--------|----------|----------|
| 9876543210 | Rajesh Textiles | Surat, Gujarat |
| 9876543211 | Sharma Electronics | Mumbai, Maharashtra |
| 9876543212 | Reddy Farm Produce | Vijayawada, AP |
| 9876543213 | Nair Spices | Kochi, Kerala |
| 9876543214 | Kumar Handicrafts | Patna, Bihar |

### Vendors (Login with mobile number + OTP: 123456)
| Mobile | Business | Category |
|--------|----------|----------|
| 9988776655 | SafeKeep Warehousing | Warehouse |
| 9988776656 | FastTrack Logistics | Transport |
| 9988776657 | SecureVault Storage | Warehouse |

### Authorities (Login with mobile number + OTP: 123456)
| Mobile | Name | Role |
|--------|------|------|
| 9000000001 | Dist. Collector, Surat | DISTRICT_DMO |
| 9000000002 | State DMO, Gujarat | STATE_DMO |
| 9999999999 | Super Admin | SUPER_ADMIN |

## API Endpoints

### API Gateway (Port 3001)
- `POST /v1/auth/otp/send` - Send OTP
- `POST /v1/auth/otp/verify` - Verify OTP & get JWT
- `GET /v1/msme/profile` - Get MSME profile
- `GET /v1/msme/wallet` - Get wallet balance

### Wallet Service (Port 3005)
- `GET /api/wallet/:msmeId` - Get wallet balance
- `GET /api/wallet/:msmeId/allocations` - Get token allocations
- `GET /api/wallet/:msmeId/transactions` - Get transactions
- `POST /api/wallet/spend` - Spend tokens

### Booking Service (Port 3004)
- `GET /api/warehouses` - Search warehouses
- `GET /api/warehouses/:id` - Get warehouse details
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details

## Testing the Flow

### 1. Login as MSME
```bash
# Request OTP
curl -X POST http://localhost:3001/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'

# Verify OTP (use 123456 for demo)
curl -X POST http://localhost:3001/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "otp": "123456"}'
```

### 2. Check Wallet Balance
```bash
curl http://localhost:3005/api/wallet/MSME-001
```

### 3. Search Warehouses
```bash
curl "http://localhost:3004/api/warehouses?floodSafe=true"
```

### 4. Create Booking
```bash
curl -X POST http://localhost:3004/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "msmeId": "MSME-001",
    "vendorId": "VENDOR-001", 
    "warehouseId": "WH-001",
    "serviceType": "STORAGE",
    "quantity": 500,
    "startDate": "2025-02-01",
    "endDate": "2025-02-08",
    "isEmergency": true
  }'
```

## Frontend URLs

- **Landing Page**: http://localhost:3000
- **MSME Dashboard**: http://localhost:3000/msme/dashboard
- **Wallet**: http://localhost:3000/msme/wallet
- **Warehouse Search**: http://localhost:3000/msme/warehouses
- **Vendor Portal**: http://localhost:3000/vendor
- **Authority Dashboard**: http://localhost:3000/authority
- **Public Transparency**: http://localhost:3000/public

## Troubleshooting

### "Database not connected"
- Ensure `packages/shared-db` is built: `cd packages/shared-db && npm run build`
- Check if `services/api-gateway/data/` directory exists

### "Module not found: @gruha/shared-db"
- Run `npm install` from the root directory
- Ensure all workspace packages are linked properly

### "Port already in use"
- Kill existing processes: `npx kill-port 3000 3001 3004 3005`

### Reset Database
```bash
rm services/api-gateway/data/gruha.db
npm run db:seed
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Frontend      │────▶│   API Gateway    │────▶│   SQLite DB    │
│   (Next.js)     │     │   (Express)      │     │   (gruha.db)   │
│   Port 3000     │     │   Port 3001      │     │                │
└─────────────────┘     └──────────────────┘     └────────────────┘
         │                      │
         │              ┌───────┴────────┐
         │              │                │
         ▼              ▼                ▼
┌─────────────────┐  ┌───────────────┐  ┌────────────────┐
│  Wallet Service │  │Booking Service│  │  Other Services│
│   Port 3005     │  │   Port 3004   │  │   (Future)     │
└─────────────────┘  └───────────────┘  └────────────────┘
```

## Next Steps

1. Test the MSME login flow in the browser
2. View wallet balances (real data from SQLite)
3. Search warehouses (real geo-filtered data)
4. Create a booking (persisted to database)
5. View transactions in wallet history

Happy coding! 🚀
