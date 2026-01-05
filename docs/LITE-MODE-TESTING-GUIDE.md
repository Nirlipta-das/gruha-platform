# 🧪 GRUHA Platform - Lite Mode Testing Guide

> **Complete testing guide for all services running without Docker**  
> Last Updated: January 2026

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Service Health Verification](#service-health-verification)
3. [API Gateway Testing](#api-gateway-testing)
4. [Authentication Flow Testing](#authentication-flow-testing)
5. [MSME Registration & KYC](#msme-registration--kyc)
6. [Wallet & Token Operations](#wallet--token-operations)
7. [Booking Flow Testing](#booking-flow-testing)
8. [Fraud Detection Testing](#fraud-detection-testing)
9. [Blockchain Service Testing](#blockchain-service-testing)
10. [Settlement Service Testing](#settlement-service-testing)
11. [Notification Services Testing](#notification-services-testing)
12. [Analytics & Audit Testing](#analytics--audit-testing)
13. [End-to-End Flows](#end-to-end-flows)
14. [PRD Compliance Checklist](#prd-compliance-checklist)

---

## Prerequisites

### 1. Start All Services

```powershell
# Navigate to project root
cd C:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)

# Start all services in lite mode
npm run dev
```

### 2. Verify Services Are Running

Wait ~10 seconds for all services to start, then run:

```powershell
# Quick health check script
$services = @(
    @{Name="Web App"; Port=3000; Path="/"},
    @{Name="API Gateway"; Port=3001; Path="/v1/health"},
    @{Name="Wallet"; Port=3002; Path="/health"},
    @{Name="Booking"; Port=3003; Path="/health"},
    @{Name="Notification"; Port=3004; Path="/health"},
    @{Name="User"; Port=3005; Path="/health"},
    @{Name="Settlement"; Port=3006; Path="/health"},
    @{Name="Audit"; Port=3007; Path="/health"},
    @{Name="Analytics"; Port=3008; Path="/health"},
    @{Name="Integration"; Port=3009; Path="/health"},
    @{Name="Fraud"; Port=3010; Path="/health"},
    @{Name="SMS"; Port=3011; Path="/health"},
    @{Name="Voice"; Port=3012; Path="/health"},
    @{Name="Token"; Port=3013; Path="/health"},
    @{Name="Blockchain"; Port=3014; Path="/health"}
)

foreach ($svc in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($svc.Port)$($svc.Path)" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ $($svc.Name) (Port $($svc.Port))" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($svc.Name) (Port $($svc.Port))" -ForegroundColor Red
    }
}
```

---

## Service Health Verification

### Test Each Service Health Endpoint

Open a **new PowerShell terminal** and run these tests:

```powershell
# API Gateway Health
Invoke-RestMethod -Uri "http://localhost:3001/v1/health"

# Expected Response:
# {
#   "status": "healthy",
#   "service": "api-gateway",
#   "database": "connected",
#   "cache": "connected",
#   "liteMode": true
# }
```

```powershell
# Blockchain Service Health
Invoke-RestMethod -Uri "http://localhost:3014/health"

# Expected Response:
# {
#   "status": "healthy",
#   "blockHeight": 1,
#   "walletCount": 0,
#   "mode": "local-file"
# }
```

---

## API Gateway Testing

### Base URL: `http://localhost:3001/v1`

### Test 1: Get System Status

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/v1/health" | ConvertTo-Json
```

### Test 2: List Available Endpoints

```powershell
# Get API documentation (if available)
Invoke-RestMethod -Uri "http://localhost:3001/v1/docs" -ErrorAction SilentlyContinue
```

---

## Authentication Flow Testing

### PRD Reference: §5.1 - OTP-based Authentication

### Test 1: Send OTP

```powershell
$body = @{
    phone = "+919876543210"
    purpose = "LOGIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/send" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected Response:
# {
#   "success": true,
#   "message": "OTP sent successfully",
#   "expiresIn": 300,
#   "requestId": "REQ-xxx"
# }
```

### Test 2: Verify OTP (Use test OTP: 123456 in lite mode)

```powershell
$body = @{
    phone = "+919876543210"
    otp = "123456"
    requestId = "REQ-xxx"  # Use requestId from previous response
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/verify" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { ... }
# }
```

### Test 3: Test with Pre-seeded User

The lite mode has pre-seeded test users. Try:

```powershell
$body = @{
    phone = "+919999999999"
    otp = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/verify" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## MSME Registration & KYC

### PRD Reference: §5.1.1 - MSME Onboarding

### Test 1: Register New MSME

```powershell
$token = "YOUR_JWT_TOKEN"  # From auth response

$body = @{
    businessName = "Test Trading Co"
    ownerName = "Ramesh Kumar"
    phone = "+919876543210"
    udyamNumber = "UDYAM-GJ-01-0012345"
    gstNumber = "24AAAAA0000A1Z5"
    businessCategory = "RETAIL"
    address = @{
        street = "123 Main Road"
        city = "Ahmedabad"
        state = "Gujarat"
        pincode = "380001"
        coordinates = @{
            lat = 23.0225
            lng = 72.5714
        }
    }
    bankDetails = @{
        accountNumber = "1234567890"
        ifscCode = "SBIN0001234"
        bankName = "State Bank of India"
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3001/v1/msme/register" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body
```

### Test 2: Get MSME Profile

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/v1/msme/profile" `
    -Headers @{ Authorization = "Bearer $token" }
```

### Test 3: Submit KYC Documents

```powershell
# In lite mode, KYC is auto-approved for testing
$body = @{
    documentType = "AADHAAR"
    documentNumber = "XXXX-XXXX-1234"
    frontImage = "base64_encoded_image_data"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/msme/kyc/submit" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body
```

---

## Wallet & Token Operations

### PRD Reference: §5.1.2 - Wallet Management, §7 - Token System

### Test 1: Get Wallet Balance

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/wallet/balance/MSME-001" `
    -Headers @{ Authorization = "Bearer $token" }

# Expected Response:
# {
#   "msmeId": "MSME-001",
#   "resilience_credits": 50000,
#   "relief_tokens": 25000,
#   "total_balance": 75000,
#   "currency": "INR"
# }
```

### Test 2: Get Transaction History

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/wallet/transactions/MSME-001" `
    -Headers @{ Authorization = "Bearer $token" }
```

### Test 3: Token Service - Get Token Allocations

```powershell
Invoke-RestMethod -Uri "http://localhost:3013/allocations/MSME-001"
```

### Test 4: Token Service - Check Spending Rules

```powershell
$body = @{
    msmeId = "MSME-001"
    amount = 5000
    category = "STORAGE"
    tokenType = "RESILIENCE_CREDIT"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3013/validate-spend" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Should validate spending rules per PRD §7
# - RESILIENCE_CREDIT: Only STORAGE, TRANSPORT
# - RELIEF_TOKEN: All categories, max 30% for wages
```

---

## Booking Flow Testing

### PRD Reference: §5.2 - Booking Services

### Test 1: Search Warehouses

```powershell
$body = @{
    latitude = 23.0225
    longitude = 72.5714
    radius = 50  # km
    requiredCapacity = 100  # sq meters
    startDate = "2026-01-10"
    endDate = "2026-01-20"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/warehouses/search" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected: List of available warehouses with pricing
```

### Test 2: Create Booking

```powershell
$body = @{
    msmeId = "MSME-001"
    vendorId = "VENDOR-001"
    serviceType = "STORAGE"
    warehouseId = "WH-001"
    startDate = "2026-01-10"
    endDate = "2026-01-20"
    capacity = 100
    paymentMethod = "RESILIENCE_CREDIT"
    estimatedValue = 15000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/bookings" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body

# Expected Response:
# {
#   "bookingId": "BK-xxx",
#   "status": "PENDING",
#   "vendorConfirmationRequired": true
# }
```

### Test 3: Get Booking Details

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/bookings/BK-001" `
    -Headers @{ Authorization = "Bearer $token" }
```

### Test 4: Vendor Accept Booking

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/bookings/BK-001/accept" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" }
```

---

## Fraud Detection Testing

### PRD Reference: §11 - Fraud Prevention

### Test 1: Analyze Transaction for Fraud

```powershell
$body = @{
    transactionId = "TXN-001"
    msmeId = "MSME-001"
    vendorId = "VENDOR-001"
    amount = 15000
    category = "STORAGE"
    location = @{
        lat = 23.0225
        lng = 72.5714
    }
    timestamp = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3010/analyze" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected Response (PRD §11 fraud scoring):
# {
#   "transactionId": "TXN-001",
#   "riskScore": 15,
#   "decision": "ALLOW",
#   "flags": [],
#   "rules_triggered": []
# }
```

### Test 2: Test Round Amount Detection

```powershell
# Test with suspicious round amount (should flag)
$body = @{
    transactionId = "TXN-002"
    msmeId = "MSME-001"
    vendorId = "VENDOR-001"
    amount = 50000  # Exact round amount - suspicious
    category = "REPAIRS"
    location = @{ lat = 23.0225; lng = 72.5714 }
    timestamp = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3010/analyze" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected: Higher risk score with ROUND_AMOUNT flag
```

### Test 3: Test Rapid-Fire Detection

```powershell
# Send multiple transactions quickly (should trigger RAPID_FIRE)
1..6 | ForEach-Object {
    $body = @{
        transactionId = "TXN-RAPID-$_"
        msmeId = "MSME-001"
        vendorId = "VENDOR-001"
        amount = 5000
        category = "STORAGE"
        location = @{ lat = 23.0225; lng = 72.5714 }
        timestamp = (Get-Date).ToString("o")
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3010/analyze" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
}

# Later transactions should show RAPID_FIRE flag
```

### Test 4: Get Fraud Statistics

```powershell
Invoke-RestMethod -Uri "http://localhost:3010/stats"
```

---

## Blockchain Service Testing

### PRD Reference: §7 - Blockchain Implementation

### Test 1: Create Wallet

```powershell
$body = @{
    ownerId = "MSME-001"
    ownerType = "MSME"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3014/wallets" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected Response:
# {
#   "address": "0x...",
#   "ownerId": "MSME-001",
#   "balance": { "RESILIENCE_CREDIT": 0, "RELIEF_TOKEN": 0 }
# }
```

### Test 2: Mint Tokens (Authority Only)

```powershell
$body = @{
    walletAddress = "0x..."  # From wallet creation
    tokenType = "RESILIENCE_CREDIT"
    amount = 50000
    disasterId = "DIS-2026-001"
    validityDays = 30
    categories = @("STORAGE", "TRANSPORT")
    authorityId = "AUTH-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3014/tokens/mint" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected: Minted tokens + blockchain transaction hash
```

### Test 3: Spend Tokens

```powershell
$body = @{
    fromWallet = "0x..."  # MSME wallet
    toWallet = "0x..."    # Vendor wallet
    tokenType = "RESILIENCE_CREDIT"
    amount = 5000
    category = "STORAGE"
    bookingId = "BK-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3014/tokens/spend" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test 4: Get Blockchain Status

```powershell
Invoke-RestMethod -Uri "http://localhost:3014/chain/status"

# Shows: Block height, pending transactions, integrity status
```

### Test 5: Verify Chain Integrity

```powershell
Invoke-RestMethod -Uri "http://localhost:3014/chain/verify"

# Expected: { "valid": true, "blockCount": X }
```

### Test 6: Get Transaction by Hash

```powershell
Invoke-RestMethod -Uri "http://localhost:3014/transactions/TXN_HASH"
```

---

## Settlement Service Testing

### PRD Reference: §12.4 - Vendor Settlement (T+0)

### Test 1: Initiate Settlement

```powershell
$body = @{
    vendorId = "VENDOR-001"
    bookingId = "BK-001"
    tokenAmount = 15000
    bankAccount = @{
        accountNumber = "9876543210"
        ifscCode = "HDFC0001234"
        bankName = "HDFC Bank"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3006/settlements" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected: Settlement created with PENDING status
```

### Test 2: Check Settlement Status

```powershell
Invoke-RestMethod -Uri "http://localhost:3006/settlements/STL-001"
```

### Test 3: Get Vendor Settlement History

```powershell
Invoke-RestMethod -Uri "http://localhost:3006/vendors/VENDOR-001/settlements"
```

### Test 4: Check Liquidity Pool Status

```powershell
Invoke-RestMethod -Uri "http://localhost:3006/liquidity-pool/status"

# Shows available liquidity for T+0 payments
```

---

## Notification Services Testing

### PRD Reference: §5.2 - Multi-channel Notifications

### Test 1: Send Push Notification

```powershell
$body = @{
    userId = "USER-001"
    title = "Disaster Alert"
    message = "Cyclone warning for your region. Take preventive action."
    type = "DISASTER_WARNING"
    priority = "HIGH"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/notifications/push" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test 2: Test SMS Service

```powershell
$body = @{
    phone = "+919876543210"
    message = "GRUHA BAL"  # Check balance command
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3011/sms/incoming" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Expected: SMS response with balance info
```

### Test 3: Test SMS Commands (PRD §12 - Offline Support)

```powershell
# Test different SMS commands
$commands = @(
    "GRUHA BAL",           # Check balance
    "GRUHA FIND",          # Find warehouses
    "GRUHA STATUS BK-001", # Check booking status
    "GRUHA SOS"            # Emergency alert
)

foreach ($cmd in $commands) {
    $body = @{
        phone = "+919876543210"
        message = $cmd
    } | ConvertTo-Json
    
    Write-Host "Testing: $cmd"
    Invoke-RestMethod -Uri "http://localhost:3011/sms/incoming" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    Write-Host "---"
}
```

### Test 4: Test Voice Service

```powershell
$body = @{
    msmeId = "MSME-001"
    alertType = "DISASTER_WARNING"
    message = "Cyclone alert for your area"
    language = "hi"  # Hindi
    priority = "CRITICAL"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3012/voice/alert" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## Analytics & Audit Testing

### PRD Reference: §2.1, §2.2 - KPI Monitoring

### Test 1: Get Platform KPIs

```powershell
Invoke-RestMethod -Uri "http://localhost:3008/kpis"

# Expected Response (PRD §2.2):
# {
#   "elpr": 42.5,                    # Economic Loss Prevention Rate
#   "msme_activation_rate": 78.3,    # KYC completion rate
#   "preparedness_action_rate": 65.2,# % alerted MSMEs who book
#   "fund_velocity_hours": 4.2,      # Time to first relief spend
#   "vendor_settlement_time_hours": 0.8,
#   "leakage_rate": 0.02,
#   "transaction_fraud_rate": 0.001
# }
```

### Test 2: Get Disaster Analytics

```powershell
Invoke-RestMethod -Uri "http://localhost:3008/analytics/disaster/DIS-001"
```

### Test 3: Get Real-time Metrics

```powershell
Invoke-RestMethod -Uri "http://localhost:3008/metrics/realtime"
```

### Test 4: Audit Service - Get Audit Trail

```powershell
Invoke-RestMethod -Uri "http://localhost:3007/audit/transactions/TXN-001"
```

### Test 5: Audit Service - Get Blockchain Events

```powershell
Invoke-RestMethod -Uri "http://localhost:3007/events?entity=MSME-001"
```

---

## End-to-End Flows

### Flow 1: Complete MSME Onboarding to First Booking

```powershell
# Step 1: Send OTP
$otpResponse = Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/send" `
    -Method POST -ContentType "application/json" `
    -Body (@{ phone = "+919876543210"; purpose = "REGISTER" } | ConvertTo-Json)

# Step 2: Verify OTP
$authResponse = Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/verify" `
    -Method POST -ContentType "application/json" `
    -Body (@{ phone = "+919876543210"; otp = "123456"; requestId = $otpResponse.requestId } | ConvertTo-Json)

$token = $authResponse.token

# Step 3: Register MSME
$msmeResponse = Invoke-RestMethod -Uri "http://localhost:3001/v1/msme/register" `
    -Method POST -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body (@{
        businessName = "Test MSME"
        ownerName = "Test Owner"
        phone = "+919876543210"
        udyamNumber = "UDYAM-GJ-01-0099999"
        businessCategory = "MANUFACTURING"
        address = @{ city = "Ahmedabad"; state = "Gujarat"; pincode = "380001" }
    } | ConvertTo-Json -Depth 3)

Write-Host "MSME Created: $($msmeResponse.id)"

# Step 4: Check Wallet
$wallet = Invoke-RestMethod -Uri "http://localhost:3002/wallet/balance/$($msmeResponse.id)" `
    -Headers @{ Authorization = "Bearer $token" }

Write-Host "Wallet Balance: $($wallet.total_balance)"

# Step 5: Search Warehouses
$warehouses = Invoke-RestMethod -Uri "http://localhost:3003/warehouses/search" `
    -Method POST -ContentType "application/json" `
    -Body (@{ latitude = 23.0225; longitude = 72.5714; radius = 50 } | ConvertTo-Json)

Write-Host "Found $($warehouses.count) warehouses"

# Step 6: Create Booking
$booking = Invoke-RestMethod -Uri "http://localhost:3003/bookings" `
    -Method POST -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body (@{
        msmeId = $msmeResponse.id
        vendorId = "VENDOR-001"
        serviceType = "STORAGE"
        warehouseId = "WH-001"
        startDate = "2026-01-15"
        endDate = "2026-01-25"
        capacity = 50
        paymentMethod = "RESILIENCE_CREDIT"
    } | ConvertTo-Json)

Write-Host "Booking Created: $($booking.bookingId)"
```

### Flow 2: Token Minting → Spending → Settlement

```powershell
# Step 1: Authority mints tokens for disaster relief
$mintResponse = Invoke-RestMethod -Uri "http://localhost:3014/tokens/mint" `
    -Method POST -ContentType "application/json" `
    -Body (@{
        walletAddress = "0xMSME001"
        tokenType = "RELIEF_TOKEN"
        amount = 100000
        disasterId = "DIS-2026-001"
        validityDays = 90
        categories = @("STORAGE", "TRANSPORT", "REPAIRS", "MATERIALS", "WAGES")
        authorityId = "AUTH-001"
    } | ConvertTo-Json)

Write-Host "Minted: $($mintResponse.amount) tokens"

# Step 2: MSME spends tokens
$spendResponse = Invoke-RestMethod -Uri "http://localhost:3014/tokens/spend" `
    -Method POST -ContentType "application/json" `
    -Body (@{
        fromWallet = "0xMSME001"
        toWallet = "0xVENDOR001"
        tokenType = "RELIEF_TOKEN"
        amount = 15000
        category = "REPAIRS"
        bookingId = "BK-001"
    } | ConvertTo-Json)

Write-Host "Spent: Transaction hash $($spendResponse.txHash)"

# Step 3: Vendor settlement
$settlement = Invoke-RestMethod -Uri "http://localhost:3006/settlements" `
    -Method POST -ContentType "application/json" `
    -Body (@{
        vendorId = "VENDOR-001"
        bookingId = "BK-001"
        tokenAmount = 15000
        bankAccount = @{
            accountNumber = "1234567890"
            ifscCode = "HDFC0001234"
            bankName = "HDFC Bank"
        }
    } | ConvertTo-Json -Depth 3)

Write-Host "Settlement: $($settlement.status) - ₹$($settlement.inrAmount)"
```

### Flow 3: Fraud Detection End-to-End

```powershell
# Test a transaction that should be blocked
$fraudTest = Invoke-RestMethod -Uri "http://localhost:3010/analyze" `
    -Method POST -ContentType "application/json" `
    -Body (@{
        transactionId = "TXN-FRAUD-TEST"
        msmeId = "MSME-001"
        vendorId = "VENDOR-001"
        amount = 100000  # Large round amount
        category = "WAGES"  # > 30% spending in wages (violation)
        location = @{ lat = 0; lng = 0 }  # Invalid location
        timestamp = (Get-Date).ToString("o")
    } | ConvertTo-Json)

Write-Host "Risk Score: $($fraudTest.riskScore)"
Write-Host "Decision: $($fraudTest.decision)"
Write-Host "Flags: $($fraudTest.flags -join ', ')"
```

---

## PRD Compliance Checklist

Use this checklist to verify all PRD requirements are working:

### §4 - User Roles
- [ ] MSME can register and complete KYC
- [ ] MSME can view wallet balance
- [ ] Vendor can accept/reject bookings
- [ ] Authority can allocate tokens
- [ ] Public can view transparency dashboard

### §5 - Core Flows
- [ ] OTP authentication works
- [ ] MSME registration completes in < 2 minutes
- [ ] Warehouse search returns results in < 3 seconds
- [ ] Booking can be created in < 5 clicks
- [ ] Multi-channel notifications work (push, SMS, voice)

### §7 - Blockchain & Tokens
- [ ] Resilience Credits limited to STORAGE, TRANSPORT
- [ ] Relief Tokens support all categories
- [ ] Wage spending capped at 30%
- [ ] Token expiry enforced
- [ ] All transactions logged on blockchain

### §11 - Fraud Prevention
- [ ] Round amount detection works
- [ ] Rapid-fire detection works
- [ ] Vendor collusion detection works
- [ ] Geo-fencing validation works
- [ ] Risk score calculation correct

### §12 - Offline Support
- [ ] SMS commands work (GRUHA BAL, GRUHA FIND, etc.)
- [ ] Offline transaction queue works
- [ ] Voice alerts work

### §12.4 - Settlement
- [ ] Vendors receive INR (not tokens)
- [ ] T+0 settlement via liquidity pool
- [ ] Settlement tracking works

### §2.2 - KPIs
- [ ] ELPR calculation works
- [ ] MSME activation rate tracked
- [ ] Fund velocity measured
- [ ] Leakage rate calculated

---

## Troubleshooting

### Common Issues

**1. Service not responding**
```powershell
# Check if port is in use
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

# Restart services
taskkill /F /IM node.exe
npm run dev
```

**2. Authentication failing**
- Use test OTP: `123456` in lite mode
- Check pre-seeded users in `services/api-gateway/data/gruha_dev.json`

**3. Blockchain errors**
- Check blockchain data file: `services/blockchain-service/data/blockchain.json`
- Delete file to reset blockchain

**4. Port conflicts**
```powershell
# Kill specific port
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

---

## Quick Test Commands Reference

```powershell
# Health checks
Invoke-RestMethod http://localhost:3001/v1/health
Invoke-RestMethod http://localhost:3014/health

# Auth
Invoke-RestMethod http://localhost:3001/v1/auth/otp/send -Method POST -Body '{"phone":"+919999999999"}' -ContentType "application/json"

# Wallet
Invoke-RestMethod http://localhost:3002/wallet/balance/MSME-001

# Blockchain
Invoke-RestMethod http://localhost:3014/chain/status

# KPIs
Invoke-RestMethod http://localhost:3008/kpis

# Fraud check
Invoke-RestMethod http://localhost:3010/stats
```

---

**Happy Testing! 🚀**

For issues or questions, refer to the main PRD document: `gruha_complete_prd (1).txt`
