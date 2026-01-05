# GRUHA Platform - Testing Guide

## 🚀 All Services Are Running

| Service | Port | Status |
|---------|------|--------|
| API Gateway | 3000 | ✅ Running |
| User Service | 3001 | ✅ Running |
| Wallet Service | 3002 | ✅ Running |
| Booking Service | 3003 | ✅ Running |
| Frontend (Next.js) | 3010 | ✅ Running |

## 📊 Test Data Created

| Entity | ID | Details |
|--------|-----|---------|
| MSME | `msme_1767606150942_bc98305c` | Krishna Grocery Store |
| Vendor (Warehouse) | `vendor_1767606367044_3fb3f49f` | SafeStore Warehouse |
| Vendor (Transport) | `vendor_1767606397470_37491afb` | FastMove Logistics |
| Wallet Balance | ₹50,000 | Relief Tokens allocated |

## 🌐 Pages to Test

Open these URLs in your browser:

1. **Debug Page (API Test)**: http://localhost:3010/debug
   - Shows all API connections
   - Displays live data from backend
   - Click "Refresh" to re-test APIs

2. **MSME Portal**: http://localhost:3010/msme
   - Shows Krishna Grocery Store dashboard
   - Displays wallet balance (₹50,000)
   - Shows active bookings

3. **MSME Wallet**: http://localhost:3010/msme/wallet
   - Detailed wallet view
   - Transaction history
   - Token allocations

4. **Warehouse Search**: http://localhost:3010/msme/warehouse
   - Search nearby warehouses
   - Book storage services

5. **Transport Search**: http://localhost:3010/msme/transport
   - Search transport services
   - Book transport

6. **Vendor Portal**: http://localhost:3010/vendor
   - View as vendor (SafeStore Warehouse)
   - See incoming bookings

7. **Home Page**: http://localhost:3010
   - Main landing page

## 🔄 If Data Not Showing

1. **Hard refresh browser**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache**: Open DevTools > Application > Clear Storage
3. **Check debug page**: Visit http://localhost:3010/debug to verify API connections

## 📡 API Verification Commands

```powershell
# Check MSME List
Invoke-RestMethod -Uri "http://localhost:3001/api/users/msme/list" -Method GET

# Check Wallet Balance  
Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/msme_1767606150942_bc98305c" -Method GET

# Check Vendor List
Invoke-RestMethod -Uri "http://localhost:3001/api/users/vendor/list" -Method GET
```

## 🛠️ Restart Services (if needed)

```powershell
# From project root
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)"

# Start API Gateway
cd services/api-gateway; npx ts-node src/index.ts

# Start User Service  
cd services/user-service; npx ts-node src/index.ts

# Start Wallet Service
cd services/wallet-service; npx ts-node src/index.ts

# Start Booking Service
cd services/booking-service; npx ts-node src/index.ts

# Start Frontend
cd apps/web; node "../../../node_modules/next/dist/bin/next" dev -p 3010
```

## ✅ Features Working

- ✅ MSME registration and listing
- ✅ Vendor registration and listing
- ✅ Wallet balance display
- ✅ Token allocation
- ✅ Real-time API data fetching
- ✅ Loading states
- ✅ Error handling
- ✅ CORS enabled across all services
