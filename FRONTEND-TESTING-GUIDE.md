# GRUHA Platform - Complete Frontend Testing Guide

## 🚀 Quick Start: Run Everything in One Terminal

```bash
# From root directory, start all services + frontend in one command:
npm run start:all
```

This starts:
| Service | Port | Color in Terminal |
|---------|------|-------------------|
| API Gateway | 3000 | Cyan |
| User Service | 3001 | Green |
| Wallet Service | 3002 | Yellow |
| Booking Service | 3003 | Magenta |
| Blockchain Service | 3005 | Blue |
| Frontend (Next.js) | 3010 | White |

### Alternative: Start Services and Frontend Separately

```bash
# Terminal 1: Start all backend services
npm run services:dev

# Terminal 2: Start frontend
npm run web:dev
```

---

## 🌐 Access Points

| Portal | URL | Description |
|--------|-----|-------------|
| **Home** | http://localhost:3010 | Landing page with portal links |
| **MSME Portal** | http://localhost:3010/msme | MSME dashboard, wallet, bookings |
| **Vendor Portal** | http://localhost:3010/vendor | Vendor dashboard, booking management |
| **Authority Dashboard** | http://localhost:3010/authority | Admin controls, token allocation |
| **Public Transparency** | http://localhost:3010/public | Public audit dashboard |

---

## 🧪 Complete Feature Testing Guide

### Phase 1: Verify Services Are Running

Open http://localhost:3010 and check the API Status indicators on each portal page. You should see green checkmarks.

**Manual API Check:**
```powershell
# Check all services
Invoke-WebRequest http://localhost:3000/health  # API Gateway
Invoke-WebRequest http://localhost:3001/health  # User Service
Invoke-WebRequest http://localhost:3002/health  # Wallet Service
Invoke-WebRequest http://localhost:3003/health  # Booking Service
Invoke-WebRequest http://localhost:3005/health  # Blockchain Service
```

---

### Phase 2: MSME Portal Testing (`/msme`)

#### 2.1 View Registered MSMEs
1. Navigate to http://localhost:3010/msme
2. Should see list of registered MSMEs (fetched from User Service)
3. Click on any MSME to see details

#### 2.2 MSME Registration (API Test)
```powershell
$body = @{
    businessName = "Test Grocery Store"
    ownerName = "Ramesh Kumar"
    phone = "9876543210"
    address = @{
        street = "123 Main Road"
        city = "Mumbai"
        state = "Maharashtra"
        pincode = "400001"
    }
    businessType = "retail"
} | ConvertTo-Json -Depth 3

Invoke-WebRequest -Uri "http://localhost:3001/api/users/msme/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

#### 2.3 View Wallet Balance
1. Select an MSME from the list
2. Wallet balance panel shows:
   - Resilience Credits (pre-disaster tokens)
   - Relief Tokens (post-disaster tokens)
   - Active allocations with expiry dates

#### 2.4 View Bookings
1. Bookings section shows all bookings for selected MSME
2. Status flow: `pending` → `accepted` → `in_progress` → `completed`

---

### Phase 3: Vendor Portal Testing (`/vendor`)

#### 3.1 View Registered Vendors
1. Navigate to http://localhost:3010/vendor
2. See list of vendors by category (warehouse, transport, repair, etc.)

#### 3.2 Vendor Registration (API Test)
```powershell
$body = @{
    phone = "9988776655"
    category = "warehouse"
    name = "SafeStore Warehouse"
    location = @{
        street = "Industrial Area"
        city = "Pune"
        state = "Maharashtra"
        pincode = "411001"
        lat = 18.5204
        lng = 73.8567
    }
    capacity = 5000
    emergencyPricing = @{
        perKgPerDay = 3
        maxCapPrice = 5
    }
} | ConvertTo-Json -Depth 3

Invoke-WebRequest -Uri "http://localhost:3001/api/users/vendor/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

#### 3.3 Accept/Reject Bookings
1. Select a vendor from the list
2. See pending bookings in "Pending Bookings" section
3. Click "Accept" or "Reject" buttons
4. Booking status updates in real-time

#### 3.4 Complete a Service
1. For accepted bookings, click "Start Service"
2. After service completion, click "Complete"
3. Upload proof photos (if UI supports)

---

### Phase 4: Authority Dashboard Testing (`/authority`)

#### 4.1 View Platform Statistics
1. Navigate to http://localhost:3010/authority
2. Dashboard shows:
   - Total Allocated funds
   - Total Spent
   - Active MSMEs count
   - Active Vendors count
   - Flagged Transactions

#### 4.2 Allocate Tokens to MSME
1. Find "Allocate Tokens" form
2. Fill in:
   - **MSME ID**: Select from dropdown or enter ID
   - **Disaster ID**: e.g., `cyclone_2024_001`
   - **Token Type**: Resilience Credit (0) or Relief Token (1)
   - **Amount**: e.g., 50000
   - **Validity Days**: e.g., 30
   - **Categories**: Select allowed spending categories
3. Click "Allocate"
4. Success message appears

**API Test:**
```powershell
$msmeId = "msme_1767592630177_8da13302"  # Replace with actual ID

$body = @{
    msmeId = $msmeId
    disasterId = "cyclone_2024_mumbai"
    tokenType = 1
    amount = 25000
    validityDays = 30
    categories = @(1, 2, 3)
    allocatedBy = "authority_district_001"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/api/wallet/allocate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

#### 4.3 Review Flagged Transactions
1. Scroll to "Flagged Transactions" section
2. See transactions flagged by fraud detection system
3. Click "Approve" or "Reject" for each
4. Provide reason for decision

---

### Phase 5: Public Transparency Portal Testing (`/public`)

#### 5.1 View Platform Metrics
1. Navigate to http://localhost:3010/public
2. See aggregated public statistics:
   - Total funds disbursed
   - Utilization rate
   - MSMEs supported
   - Category breakdown

#### 5.2 Transaction Explorer
1. Search transactions by ID or blockchain hash
2. View transaction details:
   - Amount
   - Token type
   - Category
   - Blockchain verification status

#### 5.3 Category Breakdown
1. Visual chart showing spending by category
2. Storage, Transport, Repairs, Wages, Equipment

---

### Phase 6: Complete User Flow Test

#### 6.1 Pre-Disaster Flow (Resilience Credits)
1. **Authority allocates Resilience Credits** to an MSME
2. **MSME views wallet** - sees new allocation
3. **MSME searches warehouses** - finds safe storage
4. **MSME creates booking** with warehouse vendor
5. **Vendor accepts booking**
6. **MSME spends tokens** for storage
7. **Vendor completes service**
8. **Transaction visible** in public portal

#### 6.2 Post-Disaster Flow (Relief Tokens)
1. **Authority declares disaster** and allocates Relief Tokens
2. **MSME receives tokens** with spending rules
3. **MSME books repair service**
4. **Vendor performs repairs**
5. **Transaction logged on blockchain**
6. **Vendor receives INR settlement**

---

## 🔗 Blockchain Integration Status

The blockchain service (Port 3005) provides:

| Feature | Status | Description |
|---------|--------|-------------|
| Token Minting | ✅ | Authority mints tokens for MSMEs |
| Token Spending | ✅ | MSMEs spend tokens with vendors |
| Balance Tracking | ✅ | Real-time balance from blockchain |
| Transaction Audit | ✅ | All transactions logged on-chain |
| Fraud Detection | ✅ | Rule-based + anomaly detection |

**Blockchain API Endpoints:**
```
GET  /api/blockchain/status     - Check blockchain connection
GET  /api/blockchain/stats      - Get platform statistics
GET  /api/blockchain/msme/:wallet/balance - Get MSME balance
POST /api/blockchain/transaction - Record transaction
GET  /api/blockchain/verify/:txHash - Verify transaction
```

**Test Blockchain Connection:**
```powershell
Invoke-WebRequest http://localhost:3005/api/blockchain/status | 
    Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## 🛡️ Fraud Detection Testing

The wallet service includes fraud detection. Test it:

```powershell
# Create suspicious transaction (round amount + rapid fire)
$body = @{
    msmeId = "msme_test"
    vendorId = "vendor_test"
    amount = 10000  # Round amount triggers flag
    tokenType = 1
    category = 1
    bookingId = "booking_test"
} | ConvertTo-Json

# Make multiple rapid requests to trigger RAPID_FIRE flag
1..6 | ForEach-Object {
    Invoke-WebRequest -Uri "http://localhost:3002/api/wallet/spend" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    Start-Sleep -Milliseconds 100
}

# Check flagged transactions
Invoke-WebRequest http://localhost:3002/api/wallet/flagged
```

---

## 📱 Offline Mode Testing

1. Open browser DevTools (F12)
2. Go to Network tab → check "Offline"
3. Navigate the app - should still work with cached data
4. Offline indicator appears at bottom
5. Transactions queue for later sync

---

## 🐛 Troubleshooting

### Services Not Starting
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force

# Reinstall dependencies
npm install

# Start again
npm run start:all
```

### Port Already in Use
```powershell
# Find process on port (e.g., 3000)
netstat -ano | findstr :3000

# Kill by PID
taskkill /PID <pid> /F
```

### Frontend Not Connecting to APIs
1. Check browser console for CORS errors
2. Verify all services are running
3. Check environment variables in `.env.local`

### Blockchain Not Responding
```powershell
# Check blockchain service specifically
Invoke-WebRequest http://localhost:3005/health

# Check if contract is deployed
Invoke-WebRequest http://localhost:3005/api/blockchain/status
```

---

## 📊 Test Data Reference

| Entity | Sample ID |
|--------|-----------|
| MSME | `msme_1767592630177_8da13302` |
| Vendor | `vendor_1767592778440_6bbb94c0` |
| Booking | `booking_1767594182289_d04a2fa2` |
| Disaster | `cyclone_2024_mumbai` |

---

## ✅ Testing Checklist

- [ ] All services start with `npm run start:all`
- [ ] Home page loads at http://localhost:3010
- [ ] MSME portal shows real MSME list
- [ ] Vendor portal shows real vendor list
- [ ] Authority can allocate tokens
- [ ] Flagged transactions appear for review
- [ ] Public portal shows platform statistics
- [ ] Transactions visible in explorer
- [ ] Blockchain service responds to status check
- [ ] Offline mode shows indicator
