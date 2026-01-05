# GRUHA Platform - Complete Startup & Testing Guide

## 🚀 Quick Start (All Services)

Open **6 separate PowerShell terminals** and run each command:

### Terminal 1: API Gateway (Port 3000)
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\api-gateway"
npm install
npx ts-node src/index.ts
```

### Terminal 2: User Service (Port 3001)
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\user-service"
npm install
npx ts-node src/index.ts
```

### Terminal 3: Wallet Service (Port 3002)
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\wallet-service"
npm install
npx ts-node src/index.ts
```

### Terminal 4: Booking Service (Port 3003)
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\booking-service"
npm install
npx ts-node src/index.ts
```

### Terminal 5: Blockchain Service (Port 3005)
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\blockchain-service"
npm install
npx ts-node src/index.ts
```

### Terminal 6: Frontend (Port 3010)
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\apps\web"
npm install
npm run dev
```

---

## ✅ Health Check (Verify All Services Running)

Open a new PowerShell and run:
```powershell
# Check all services
@(3000, 3001, 3002, 3003, 3005) | ForEach-Object {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$_/health" -Method GET -TimeoutSec 5
        Write-Host "✓ Port $_`: $($response.service) - OK" -ForegroundColor Green
    } catch {
        Write-Host "✗ Port $_`: Not running" -ForegroundColor Red
    }
}
```

---

## 🧪 Complete Feature Testing Guide

### PHASE 1: Authentication (API Gateway - Port 3000)

#### 1.1 Send OTP
```powershell
$body = @{ phone = "+919876543210" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/otp/send" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** `{ success: true, message: "OTP sent successfully" }`

#### 1.2 Verify OTP (Use code: 123456 for dev)
```powershell
$body = @{ phone = "+919876543210"; code = "123456" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/otp/verify" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "JWT Token: $token"
```
**Expected:** JWT token returned

---

### PHASE 2: User Service (Port 3001)

#### 2.1 Register MSME
```powershell
$body = @{
    businessName = "Sharma Textiles"
    ownerName = "Rajesh Sharma"
    phone = "9876543210"
    email = "raj@sharmtextiles.com"
    udyamNumber = "UDYAM-MH-01-0012345"
    address = @{
        street = "123 Industrial Area"
        city = "Mumbai"
        state = "Maharashtra"
        pincode = "400001"
        coordinates = @{ lat = 19.0760; lng = 72.8777 }
    }
    businessType = "Manufacturing"
    category = "Textile"
    annualTurnover = 5000000
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri "http://localhost:3001/api/users/msme/register" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** MSME created with ID like `msme_xxx`

#### 2.2 Register Vendor (Warehouse)
```powershell
$body = @{
    phone = "9876543211"
    category = "warehouse"
    name = "Amit Patel"
    businessName = "SecureStore Warehouse"
    businessType = "Warehousing"
    gstNumber = "27AADCS1234P1ZH"
    address = "456 Logistics Park, Navi Mumbai"
    district = "Thane"
    state = "Maharashtra"
    pincode = "400705"
    geoLat = 19.0330
    geoLng = 73.0297
    serviceRadiusKm = 50
    bankAccountNumber = "1234567890"
    bankIfsc = "HDFC0001234"
    bankName = "HDFC Bank"
    emergencyPricingAgreed = $true
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/users/vendor/register" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Vendor created with ID like `vendor_xxx`

#### 2.3 List MSMEs
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/users/msme/list" -Method GET
```
**Expected:** List of registered MSMEs

#### 2.4 List Vendors
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/users/vendor/list" -Method GET
```
**Expected:** List of registered vendors

---

### PHASE 3: Wallet Service (Port 3002)

#### 3.1 Allocate Tokens (Authority Action)
```powershell
# Allocate Resilience Credits for pre-disaster preparedness
$body = @{
    msmeId = "msme_xxx"  # Use actual MSME ID from step 2.1
    disasterId = "cyclone_2026_001"
    tokenType = 0  # 0=Resilience Credit, 1=Relief Token
    amount = 50000
    validityDays = 30
    categories = @(0, 1)  # 0=Storage, 1=Transport
    allocatedBy = "authority_001"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/allocate" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Allocation created with balance showing 50000

#### 3.2 Check Wallet Balance
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/msme_xxx" -Method GET  # Use actual MSME ID
```
**Expected:** Balance showing Resilience Credits and Relief Tokens with active allocations

#### 3.3 Spend Tokens (with Fraud Detection)
```powershell
$body = @{
    msmeId = "msme_xxx"      # Use actual MSME ID
    vendorId = "vendor_xxx"  # Use actual vendor ID
    amount = 5000
    tokenType = 0            # 0=Resilience Credit
    category = 0             # 0=Storage
    bookingId = "booking_001"
    description = "Warehouse storage for 1 week"
    geoLat = 18.5204
    geoLng = 73.8567
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/spend" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Transaction processed, balance reduced

#### 3.4 Test Fraud Detection (Multiple rapid transactions)
```powershell
# Run 5 transactions quickly to trigger RAPID_FIRE flag
1..5 | ForEach-Object {
    $body = @{
        msmeId = "msme_001"
        vendorId = "vendor_001"
        amount = 5000
        category = "STORAGE"
        bookingId = "test_$_"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/spend" -Method POST -Body $body -ContentType "application/json"
    Start-Sleep -Milliseconds 500
}
```
**Expected:** Later transactions get flagged with RAPID_FIRE

#### 3.5 View Flagged Transactions
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/flagged" -Method GET
```
**Expected:** List of flagged transactions

#### 3.6 Approve/Reject Flagged Transaction
```powershell
# Get transaction ID from flagged list
$txnId = "txn_xxx"  # Replace with actual ID
$body = @{ reviewedBy = "authority_001"; reason = "Verified legitimate transaction" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3002/api/wallet/flagged/$txnId/approve" -Method POST -Body $body -ContentType "application/json"
```

---

### PHASE 4: Booking Service (Port 3003)

#### 4.1 Create Warehouse Booking
```powershell
$body = @{
    msmeId = "msme_xxx"         # Use actual MSME ID
    vendorId = "vendor_xxx"     # Use actual Vendor ID
    serviceType = "warehouse_storage"
    description = "Warehouse storage for textile goods - 1 week"
    quotedAmount = 5000
    warehouseId = "wh_test_001"
    startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    endDate = (Get-Date).AddDays(8).ToString("yyyy-MM-ddTHH:mm:ssZ")
    quantityKg = 500
    estimatedValue = 100000
    pickupAddress = @{
        street = "123 Industrial Area"
        city = "Mumbai"
        state = "Maharashtra"
        pincode = "400001"
        lat = 19.0760
        lng = 72.8777
    }
    specialInstructions = "Fragile textile goods - handle with care"
    emergencyContact = "9876543210"
    tokenType = 0
} | ConvertTo-Json -Depth 4

$booking = Invoke-RestMethod -Uri "http://localhost:3003/api/bookings" -Method POST -Body $body -ContentType "application/json"
$bookingId = $booking.data.bookingId
Write-Host "Booking ID: $bookingId"
```
**Expected:** Booking created with status "pending"

#### 4.2 Vendor Accepts Booking
```powershell
$body = @{ vendorId = "vendor_xxx" } | ConvertTo-Json  # Use actual vendor ID
Invoke-RestMethod -Uri "http://localhost:3003/api/bookings/$bookingId/accept" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Status changes to "accepted", wallet payment authorized

#### 4.3 Start Service
```powershell
$body = @{ vendorId = "vendor_xxx" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3003/api/bookings/$bookingId/start" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Status changes to "in_progress"

#### 4.4 Upload Proof (Required before completion)
```powershell
$body = @{
    uploadedBy = "vendor"
    type = "photo"
    url = "https://storage.gruha.gov.in/proofs/goods_stored.jpg"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3003/api/bookings/$bookingId/proof" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Proof attached to booking

#### 4.5 Complete Service
```powershell
$body = @{ 
    vendorId = "vendor_xxx"
    completionNotes = "Goods safely stored as agreed"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3003/api/bookings/$bookingId/complete" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Status "completed", payment "paid"

#### 4.6 View MSME Bookings
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/bookings/msme/msme_xxx" -Method GET  # Use actual MSME ID
```

#### 4.7 View Vendor Bookings
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/bookings/vendor/vendor_001" -Method GET
```

---

### PHASE 5: Blockchain Service (Port 3005)

#### 5.1 Mint Tokens on Blockchain
```powershell
$body = @{
    to = "0x1234567890123456789012345678901234567890"
    amount = "100000"
    tokenType = "RELIEF"
    disasterId = "cyclone_2026_001"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3005/api/tokens/mint" -Method POST -Body $body -ContentType "application/json"
```

#### 5.2 Check Token Balance
```powershell
$address = "0x1234567890123456789012345678901234567890"
Invoke-RestMethod -Uri "http://localhost:3005/api/tokens/balance/$address" -Method GET
```

#### 5.3 Get Blockchain Transaction
```powershell
$txHash = "0x..."  # Transaction hash from mint
Invoke-RestMethod -Uri "http://localhost:3005/api/transactions/$txHash" -Method GET
```

---

### PHASE 6: Frontend Testing (Port 3010)

Open browser and navigate to:

| URL | Portal | Test Actions |
|-----|--------|--------------|
| http://localhost:3010 | Landing | View all 4 portal links |
| http://localhost:3010/msme | MSME Dashboard | View balance, quick actions |
| http://localhost:3010/msme/warehouse | Warehouse Search | Search, filter, book |
| http://localhost:3010/msme/transport | Transport | Search, book transport |
| http://localhost:3010/msme/wallet | Wallet History | View transactions |
| http://localhost:3010/vendor | Vendor Dashboard | Accept/reject bookings |
| http://localhost:3010/authority | Authority | Declare disaster, allocate tokens |
| http://localhost:3010/public | Transparency | View spending data |

---

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on specific port
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force }
```

### Service Not Starting
```powershell
# Check if dependencies installed
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\api-gateway"
npm install
```

### Reset All Data (In-Memory)
Simply restart all services - data is reset on restart.

---

## 📊 Service Port Reference

| Service | Port | Endpoint |
|---------|------|----------|
| API Gateway | 3000 | http://localhost:3000 |
| User Service | 3001 | http://localhost:3001 |
| Wallet Service | 3002 | http://localhost:3002 |
| Booking Service | 3003 | http://localhost:3003 |
| Blockchain Service | 3005 | http://localhost:3005 |
| Frontend | 3010 | http://localhost:3010 |
