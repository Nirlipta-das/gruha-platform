# 🧪 GRUHA Platform - Comprehensive Testing Guide

## Table of Contents
1. [Prerequisites Setup](#1-prerequisites-setup)
2. [Quick Start (Lite Mode - No Docker)](#2-quick-start-lite-mode---no-docker)
3. [Starting All Services](#3-starting-all-services)
4. [Frontend Testing Guide](#4-frontend-testing-guide)
5. [API Testing Guide](#5-api-testing-guide)
6. [Portal-Specific Testing](#6-portal-specific-testing)
7. [Feature Testing Checklist](#7-feature-testing-checklist)
8. [Test Data & Credentials](#8-test-data--credentials)

---

## 1. Prerequisites Setup

### 1.1 Node.js & npm
Ensure you have Node.js v18+ installed:
```powershell
node --version  # Should be v18.x or higher
npm --version
```

### 1.2 Install Project Dependencies
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)"
npm install
```

---

## 2. Quick Start (Lite Mode - No Docker)

**If you don't have Docker installed or it's not working**, you can run the API Gateway in "Lite Mode" which uses a JSON file database and in-memory cache instead of PostgreSQL/Redis.

### 2.1 Start API Gateway in Lite Mode

**Option A: Using PowerShell (Recommended)**
Open a new PowerShell window:
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\api-gateway"
$env:USE_LITE_MODE="true"
$env:NO_DOCKER="true"
$env:PORT="3001"
npx tsx src/server.ts
```

**Option B: Using npm (if .env file is configured)**
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\api-gateway"
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════════╗
║   🏠 GRUHA API Gateway                                        ║
║   Server running at: http://localhost:3001                    ║
║   Mode: 📦 LITE (No Docker)                                   ║
║   Database: ✅ Connected                                       ║
║   Cache: ✅ Connected                                          ║
╚═══════════════════════════════════════════════════════════════╝
```

### 2.2 Seed Test Data
Before testing, seed the database with sample data:
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\services\api-gateway"
npm run seed
```

This creates:
- 5 test users (MSME, Vendor, Authority)
- 2 MSMEs with profiles
- 2 Vendors
- 3 Warehouses
- Sample transactions

### 2.3 Start Frontend
In a separate terminal:
```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)\apps\web"
npm run dev
```
Frontend will be available at: http://localhost:3000

### 2.4 Test Credentials (Lite Mode)
| User Type | Phone Number | Static OTP |
|-----------|--------------|------------|
| MSME | +919876543210 | 123456 |
| MSME 2 | +919876543220 | 123456 |
| Vendor | +919876543211 | 123456 |
| Authority | +919876543212 | 123456 |

### 2.5 Quick API Test
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3001/v1/health"

# Send OTP
$body = '{"mobile_number": "+919876543210", "user_type": "MSME"}'
Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/send" -Method POST -ContentType "application/json" -Body $body

# Verify OTP (use static OTP 123456)
$body = '{"mobile_number": "+919876543210", "otp": "123456"}'
$response = Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/verify" -Method POST -ContentType "application/json" -Body $body
$token = $response.data.accessToken

# Test authenticated endpoint
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3001/v1/msme/wallet" -Method GET -Headers $headers
```

---

## 3. Starting All Services (Full Docker Mode)

### 3.1 Install Docker Desktop (Required for Full Mode)

**Option A: Download from Official Site**
1. Visit https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Run the installer
4. Restart your computer
5. Open Docker Desktop and wait for it to start

**Option B: Using Winget (Windows Package Manager)**
```powershell
winget install Docker.DockerDesktop
```

**Verify Docker Installation:**
```powershell
docker --version
docker-compose --version
```

### 3.2 Start Infrastructure (Docker)

**Start all databases and infrastructure:**
```powershell
# From project root
npm run docker:up

# Or directly
docker-compose -f infra/docker/docker-compose.yml up -d
```

This starts:
| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Primary database |
| MongoDB | 27017 | Logs & flexible schemas |
| Redis | 6379 | Caching, sessions, queues |
| MinIO | 9000, 9001 | S3-compatible object storage |
| RabbitMQ | 5672, 15672 | Message queue |

**Verify infrastructure is running:**
```powershell
docker ps
```

### 2.2 Access Infrastructure Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| MinIO Console | http://localhost:9001 | `minioadmin` / `minioadmin` |
| RabbitMQ Management | http://localhost:15672 | `gruha_mq` / `gruha_mq_pass` |

### 2.3 Start Backend Services

**Option A: Start All Services Together (Using Turbo)**
```powershell
npm run dev
```

**Option B: Start Services Individually**

Open separate terminal windows for each service:

```powershell
# Terminal 1 - API Gateway (Required)
cd services/api-gateway
npm run dev
# Runs on http://localhost:3001

# Terminal 2 - User Service
cd services/user-service
npm run dev
# Runs on http://localhost:3002

# Terminal 3 - Wallet Service
cd services/wallet-service
npm run dev
# Runs on http://localhost:3003

# Terminal 4 - Booking Service
cd services/booking-service
npm run dev
# Runs on http://localhost:3004

# Terminal 5 - Token Service
cd services/token-service
npm run dev
# Runs on http://localhost:3005

# Terminal 6 - Notification Service
cd services/notification-service
npm run dev
# Runs on http://localhost:3006
```

### 2.4 Start Frontend Application
```powershell
cd apps/web
npm run dev
# Runs on http://localhost:3000
```

---

## 3. Frontend Testing Guide

### 3.1 Available Routes

| Route | Description | Portal |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | Login page | All users |
| `/register` | Registration page | MSMEs, Vendors |
| `/msme/*` | MSME portal | MSME users |
| `/vendor/*` | Vendor portal | Vendor users |
| `/authority/*` | Authority dashboard | Authority users |
| `/public/*` | Public transparency | Everyone |
| `/recovery/*` | Recovery marketplace | MSMEs |

### 3.2 Browser Testing Checklist

**General UI/UX:**
- [ ] Page loads within 3 seconds on 3G
- [ ] Responsive design on mobile (use Chrome DevTools - Toggle device)
- [ ] Dark mode toggle works
- [ ] Emergency mode toggle (if available)
- [ ] Language switching (en/hi/gu/ta)

**PWA Features:**
- [ ] Install prompt appears (after visiting site)
- [ ] Works offline (disconnect network and refresh)
- [ ] Service worker registered (check Chrome DevTools → Application)

**Accessibility:**
- [ ] Tab navigation works
- [ ] Screen reader compatible
- [ ] High contrast mode
- [ ] Large button targets (60px+ for emergency mode)

---

## 5. API Testing Guide

### 5.1 Base URL Configuration
```
Development: http://localhost:3001/v1
Production: https://api.gruha.gov.in/v1
```

### 5.2 Required Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>",
  "X-Request-ID": "<UUID>"
}
```

### 5.3 Core API Endpoints

**Health Check:**
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/v1/health"

# cURL
curl http://localhost:3001/v1/health
```

**Authentication (OTP Flow):**
```powershell
# Step 1: Send OTP
$body = '{"mobile_number": "+919876543210", "user_type": "MSME"}'
Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/send" -Method POST -ContentType "application/json" -Body $body

# Step 2: Verify OTP (use 123456 in dev/lite mode)
$body = '{"mobile_number": "+919876543210", "otp": "123456"}'
$response = Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/otp/verify" -Method POST -ContentType "application/json" -Body $body

# Store token for authenticated requests
$token = $response.data.accessToken
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
```

**Wallet Balance:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/v1/msme/wallet" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
```

**Search Warehouses:**
```powershell
$body = '{"pickup_location": {"latitude": 21.17, "longitude": 72.83}, "duration_days": 7}'
Invoke-RestMethod -Uri "http://localhost:3001/v1/warehouses/search" -Method POST -Headers $headers -Body $body | ConvertTo-Json -Depth 5
```

### 5.4 Available API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/auth/otp/send` | Send OTP | No |
| POST | `/auth/otp/verify` | Verify OTP | No |
| POST | `/auth/refresh` | Refresh token | Yes |
| POST | `/auth/logout` | Logout | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/msme/register` | Register MSME | Yes |
| GET | `/msme/profile` | Get MSME profile | Yes (MSME) |
| PATCH | `/msme/profile` | Update profile | Yes (MSME) |
| GET | `/msme/wallet` | Get wallet | Yes (MSME) |
| GET | `/msme/bookings` | Get bookings | Yes (MSME) |
| GET | `/msme/alerts` | Get alerts | Yes (MSME) |
| POST | `/warehouses/search` | Search warehouses | Yes |
| POST | `/bookings` | Create booking | Yes (MSME) |
| GET | `/bookings/:id` | Get booking | Yes |
| POST | `/vendor/register` | Register vendor | Yes |
| GET | `/vendor/profile` | Get vendor profile | Yes (Vendor) |
| GET | `/vendor/bookings` | Get vendor bookings | Yes (Vendor) |
| POST | `/vendor/bookings/:id/accept` | Accept booking | Yes (Vendor) |
| POST | `/authority/disaster/declare` | Declare disaster | Yes (Authority) |
| POST | `/authority/tokens/allocate` | Allocate tokens | Yes (Authority) |
| GET | `/public/transparency` | Public stats | No |

**MSME Registration:**
```powershell
$body = @{
  businessName = "Test Business"
  ownerName = "Test Owner"
  mobileNumber = "+919876543210"
  businessCategory = "MANUFACTURING"
  udyamAadhaar = "UDYAM-XX-00-0000001"
  address = "123 Test Street"
  district = "Mumbai"
  state = "Maharashtra"
  pincode = "400001"
  latitude = 19.076
  longitude = 72.877
  annualTurnover = 2500000
  employeeCount = 15
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/msme/register" -Method POST -Headers $headers -Body $body | ConvertTo-Json -Depth 5
```

**Vendor Registration:**
```powershell
$body = @{
  businessName = "Test Warehouse"
  ownerName = "Vendor Owner"
  mobileNumber = "+919876543211"
  vendorCategory = "WAREHOUSE"
  address = "456 Industrial Area"
  district = "Surat"
  state = "Gujarat"
  pincode = "395003"
  latitude = 21.17
  longitude = 72.83
  gstNumber = "22AAAAA0000A1Z5"
  panNumber = "AAAAA1234A"
  bankAccountNumber = "1234567890"
  bankIfsc = "SBIN0001234"
  bankAccountHolder = "Vendor Owner"
  serviceCategories = @("storage", "climate_control")
  emergencyPricing = @{ perSqftPerDay = 35 }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3001/v1/vendor/register" -Method POST -Headers $headers -Body $body | ConvertTo-Json -Depth 5
```
  "startDate": "2024-01-20",
  "endDate": "2024-02-20"
}
```

**Create Booking:**
```bash
POST http://localhost:3001/v1/bookings
Content-Type: application/json
Authorization: Bearer <token>

{
  "warehouseId": "wh_123",
  "startDate": "2024-01-20",
  "endDate": "2024-02-20",
  "capacity": 100,
  "paymentMethod": "RESILIENCE_CREDIT"
}
```

### 4.4 Using Postman/Insomnia

1. Import the API collection (create one from endpoints above)
2. Set environment variable `base_url = http://localhost:3001/v1`
3. Set environment variable `token` after login

---

## 5. Portal-Specific Testing

### 5.1 MSME Portal Testing

**Route:** `http://localhost:3000/msme`

**Test Flow:**
1. **Registration:**
   - Navigate to `/register`
   - Enter phone number, receive OTP
   - Complete business details
   - Verify KYC status shows as "Pending"

2. **Dashboard:**
   - View wallet balance (Resilience Credits + Relief Tokens)
   - Check recent transactions
   - View active bookings

3. **Warehouse Booking (Pre-Disaster):**
   - Go to `/msme/warehouses`
   - Search by location
   - Filter by capacity, safety zone
   - Book warehouse
   - Confirm payment with Resilience Credits

4. **Transport Booking:**
   - Go to `/msme/transport`
   - Select pickup & delivery locations
   - Choose vehicle type
   - Confirm booking

5. **Recovery Marketplace (Post-Disaster):**
   - Go to `/recovery`
   - Browse services: Repairs, Equipment, Materials
   - Book service with Relief Tokens
   - Track service status

### 5.2 Vendor Portal Testing

**Route:** `http://localhost:3000/vendor`

**Test Flow:**
1. **Vendor Registration:**
   - Navigate to `/register?type=vendor`
   - Enter business details
   - Upload verification documents
   - Set emergency pricing

2. **Dashboard:**
   - View pending bookings
   - Check today's schedule
   - View earnings summary

3. **Booking Management:**
   - Accept/reject incoming bookings
   - Update booking status
   - Upload service completion proof (photos)

4. **Settlements:**
   - View settlement history
   - Track INR payments
   - Download invoices

### 5.3 Authority Dashboard Testing

**Route:** `http://localhost:3000/authority`

**Test Flow:**
1. **Disaster Declaration:**
   - Create new disaster event
   - Set affected areas (geofencing)
   - Set disaster severity level

2. **Token Allocation:**
   - Select affected MSMEs
   - Set token amounts
   - Configure spending rules (categories)
   - Confirm allocation

3. **Analytics:**
   - View real-time spending dashboard
   - Track vendor utilization
   - Monitor fraud alerts
   - Export reports

4. **Vendor Management:**
   - Approve/reject vendor applications
   - Set emergency cap pricing
   - Blacklist/whitelist vendors

### 5.4 Public Transparency Portal

**Route:** `http://localhost:3000/public`

**Test Flow:**
1. **Dashboard:**
   - View aggregate statistics
   - Check fund utilization by category
   - View disaster response timeline

2. **Transparency Reports:**
   - Download PDF reports
   - View blockchain transaction hashes
   - Check audit logs

---

## 6. Feature Testing Checklist

### 6.1 Pre-Disaster Features (PRD Stage 3)

- [ ] MSME receives early warning alerts
- [ ] Push notification received
- [ ] SMS fallback works
- [ ] Resilience Credits allocation visible in wallet
- [ ] Warehouse search shows only safe zones
- [ ] Booking flow completes successfully
- [ ] Transport bundle booking works
- [ ] Transaction recorded on blockchain

### 6.2 During-Disaster Features (PRD Stage 4)

- [ ] App enters Emergency Mode automatically
- [ ] UI switches to high-contrast mode
- [ ] Large buttons (60px+) visible
- [ ] Offline mode works
- [ ] Cached balance shows correctly
- [ ] SMS transactions work (simulate with API)
- [ ] QR code generation for offline payments

### 6.3 Post-Disaster Features (PRD Stage 5)

- [ ] Relief Token allocation from Authority
- [ ] Recovery Marketplace visible
- [ ] Service categories match PRD:
  - [ ] Warehouse extension
  - [ ] Return transport
  - [ ] Shop repairs
  - [ ] Electrical fixes
  - [ ] Machinery service
  - [ ] Wage support
  - [ ] Utility payments
- [ ] Vendor receives INR (T+0 settlement)
- [ ] Spending rules enforced (no cash withdrawal)

### 6.4 Fraud Detection (PRD §11)

- [ ] Round amount transactions flagged
- [ ] Rapid-fire transactions blocked
- [ ] GPS proximity verification works
- [ ] Photo proof required for services
- [ ] Vendor collusion detection active

### 6.5 Accessibility (PRD §14)

- [ ] WCAG AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Multiple languages (Hindi, Gujarati, Tamil, English)
- [ ] Voice input support

### 6.6 Performance Metrics (PRD §15)

- [ ] Registration completes in < 2 minutes
- [ ] API p95 response < 500ms
- [ ] Page load < 3s on 3G
- [ ] Warehouse search returns in < 3s

---

## 7. Test Data & Credentials

### 7.1 Test Users

| Role | Phone | OTP (Dev) | Description |
|------|-------|-----------|-------------|
| MSME | +919876543210 | 123456 | Test MSME user |
| Vendor | +919876543211 | 123456 | Warehouse vendor |
| Authority | +919876543212 | 123456 | District authority |

### 7.2 Database Credentials (Docker)

| Service | Host | Port | User | Password | Database |
|---------|------|------|------|----------|----------|
| PostgreSQL | localhost | 5432 | gruha_user | gruha_pass | gruha_db |
| MongoDB | localhost | 27017 | gruha_admin | gruha_pass | gruha_logs |
| Redis | localhost | 6379 | - | - | - |

### 7.3 Sample Test Data

**Sample MSME:**
```json
{
  "id": "msme_test_001",
  "businessName": "Sharma Textiles",
  "udyamNumber": "UDYAM-MH-01-0001234",
  "category": "MANUFACTURING",
  "location": {
    "city": "Surat",
    "state": "Gujarat",
    "lat": 21.1702,
    "lng": 72.8311
  },
  "walletBalance": {
    "resilienceCredits": 50000,
    "reliefTokens": 0
  }
}
```

**Sample Warehouse:**
```json
{
  "id": "wh_test_001",
  "name": "SafeStore Warehouse A",
  "location": {
    "address": "Industrial Area Phase 2",
    "city": "Surat",
    "lat": 21.1850,
    "lng": 72.8456
  },
  "totalCapacity": 5000,
  "availableCapacity": 3500,
  "floodZone": "GREEN",
  "pricePerUnit": 25,
  "emergencyPrice": 30,
  "amenities": ["climate_control", "cctv", "loading_dock"]
}
```

**Sample Disaster:**
```json
{
  "id": "disaster_test_001",
  "type": "FLOOD",
  "severity": "HIGH",
  "name": "Gujarat Floods 2024",
  "affectedDistricts": ["Surat", "Vadodara", "Bharuch"],
  "declaredAt": "2024-01-15T10:00:00Z",
  "status": "ACTIVE",
  "allocatedFunds": 50000000
}
```

---

## 8. Troubleshooting

### Common Issues

**Docker not starting:**
```powershell
# Restart Docker service
Restart-Service docker
```

**Port already in use:**
```powershell
# Find and kill process on port
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

**Database connection failed:**
```powershell
# Check if PostgreSQL is running
docker logs gruha_postgres
```

**Redis connection failed:**
```powershell
# Check if Redis is running
docker logs gruha_redis
```

**Frontend not loading:**
```powershell
# Clear Next.js cache
cd apps/web
rm -rf .next
npm run dev
```

---

## 9. Quick Start Summary

```powershell
# 1. Install Docker Desktop (one-time)
# 2. Start infrastructure
npm run docker:up

# 3. Start all services
npm run dev

# 4. Open browser
# Frontend: http://localhost:3000
# API: http://localhost:3001/v1/health

# 5. Stop everything
npm run docker:down
```

---

**Last Updated:** January 2024  
**PRD Version:** 1.0  
**Platform Version:** 1.0.0
