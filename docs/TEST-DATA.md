# GRUHA Platform - Test Data

This document contains sample test data for testing the GRUHA platform in LITE mode.

## 📱 OTP Testing

In LITE mode, any 6-digit OTP will work (e.g., `123456`).

---

## 🏭 MSME Test Data

### Sample MSME 1 - Manufacturing (Gujarat - Coastal)
```json
{
  "businessName": "Raju Textiles Pvt Ltd",
  "ownerName": "Rajesh Kumar Patel",
  "phone": "9876543210",
  "udyamNumber": "UDYAM-GJ-01-1234567",
  "businessCategory": "MANUFACTURING",
  "gstNumber": "24AAACP1234M1ZD",
  "state": "Gujarat",
  "district": "Ahmedabad",
  "address": "123, Industrial Estate, Naroda",
  "pincode": "382330",
  "latitude": 23.0225,
  "longitude": 72.5714
}
```

### Sample MSME 2 - Food Processing (Maharashtra - Coastal)
```json
{
  "businessName": "Sharma Food Industries",
  "ownerName": "Vikram Sharma",
  "phone": "9123456780",
  "udyamNumber": "UDYAM-MH-02-9876543",
  "businessCategory": "FOOD_PROCESSING",
  "gstNumber": "27AADCS4321P2ZE",
  "state": "Maharashtra",
  "district": "Mumbai",
  "address": "45, Andheri Industrial Area",
  "pincode": "400053",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Sample MSME 3 - Trading (Madhya Pradesh - Inland)
```json
{
  "businessName": "Gupta Trading Co",
  "ownerName": "Anil Gupta",
  "phone": "9988776655",
  "udyamNumber": "UDYAM-MP-03-5555555",
  "businessCategory": "TRADING",
  "gstNumber": "23AABCG5678Q3ZF",
  "state": "Madhya Pradesh",
  "district": "Bhopal",
  "address": "78, MP Nagar Zone-1",
  "pincode": "462011",
  "latitude": 23.2599,
  "longitude": 77.4126
}
```

### Sample MSME 4 - Handicrafts (Rajasthan)
```json
{
  "businessName": "Jaipur Handicrafts",
  "ownerName": "Sunita Devi",
  "phone": "9555666777",
  "udyamNumber": "UDYAM-RJ-04-7777777",
  "businessCategory": "HANDICRAFTS",
  "gstNumber": "08AABCH9999R4ZG",
  "state": "Rajasthan",
  "district": "Jaipur",
  "address": "12, Johari Bazaar",
  "pincode": "302003",
  "latitude": 26.9124,
  "longitude": 75.7873
}
```

---

## 🚛 Vendor Test Data

### Warehouse Vendor
```json
{
  "businessName": "SafeStore Warehousing",
  "contactName": "Mohammed Khan",
  "phone": "9444333222",
  "vendorCategory": "WAREHOUSE",
  "registrationNumber": "WH-GJ-2024-001",
  "state": "Gujarat",
  "district": "Ahmedabad",
  "address": "Plot 45, GIDC Industrial Estate",
  "pincode": "382330",
  "latitude": 23.0500,
  "longitude": 72.5500,
  "emergencyAvailable": true,
  "operatingHours": "24/7"
}
```

### Transport Vendor
```json
{
  "businessName": "Quick Logistics Services",
  "contactName": "Suresh Yadav",
  "phone": "9333222111",
  "vendorCategory": "TRANSPORT",
  "registrationNumber": "TRN-MH-2024-002",
  "state": "Maharashtra",
  "district": "Mumbai",
  "address": "Logistics Hub, Navi Mumbai",
  "pincode": "400701",
  "latitude": 19.0330,
  "longitude": 73.0297,
  "emergencyAvailable": true,
  "operatingHours": "06:00-22:00"
}
```

### Repair Services Vendor
```json
{
  "businessName": "Expert Repairs & Services",
  "contactName": "Ramesh Electricals",
  "phone": "9222111000",
  "vendorCategory": "REPAIR",
  "registrationNumber": "REP-GJ-2024-003",
  "state": "Gujarat",
  "district": "Surat",
  "address": "Shop 12, Service Center Road",
  "pincode": "395003",
  "latitude": 21.1702,
  "longitude": 72.8311,
  "emergencyAvailable": true,
  "operatingHours": "09:00-21:00"
}
```

---

## 🧪 API Testing with cURL

### 1. Send OTP
```bash
curl -X POST http://localhost:3001/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210"}'
```

### 2. Verify OTP (use any 6-digit code in LITE mode)
```bash
curl -X POST http://localhost:3001/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "123456"}'
```

### 3. Register MSME (with token from OTP verify)
```bash
curl -X POST http://localhost:3001/v1/msme/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "ownerName": "Test Owner",
    "phone": "+919876543210",
    "businessCategory": "MANUFACTURING",
    "state": "Gujarat",
    "district": "Ahmedabad",
    "address": "Test Address 123",
    "pincode": "382330"
  }'
```

### 4. Search Warehouses
```bash
curl -X POST http://localhost:3001/v1/warehouses/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "latitude": 23.0225,
    "longitude": 72.5714,
    "radiusKm": 50
  }'
```

---

## 📍 Test Locations (Coordinates)

| City | State | Latitude | Longitude | Risk Level |
|------|-------|----------|-----------|------------|
| Ahmedabad | Gujarat | 23.0225 | 72.5714 | MEDIUM (Coastal) |
| Mumbai | Maharashtra | 19.0760 | 72.8777 | MEDIUM (Coastal) |
| Chennai | Tamil Nadu | 13.0827 | 80.2707 | MEDIUM (Coastal) |
| Kolkata | West Bengal | 22.5726 | 88.3639 | MEDIUM (Coastal) |
| Bhopal | Madhya Pradesh | 23.2599 | 77.4126 | LOW (Inland) |
| Jaipur | Rajasthan | 26.9124 | 75.7873 | LOW (Inland) |
| Lucknow | Uttar Pradesh | 26.8467 | 80.9462 | LOW (Inland) |
| Puri | Odisha | 19.8135 | 85.8312 | HIGH (Cyclone Prone) |

---

## 🎫 Test Token Allocation

### Pre-Disaster Resilience Credits
```json
{
  "msmeId": "test-msme-id",
  "tokenType": "RESILIENCE_CREDIT",
  "amount": 50000,
  "validityDays": 30,
  "categories": ["WAREHOUSE_STORAGE", "TRANSPORT"],
  "reason": "Cyclone Warning - Pre-emptive Protection"
}
```

### Post-Disaster Relief Tokens
```json
{
  "msmeId": "test-msme-id",
  "tokenType": "RELIEF_TOKEN",
  "amount": 100000,
  "validityDays": 90,
  "categories": ["REPAIR", "EQUIPMENT", "MATERIALS", "WAGES"],
  "wageLimit": 30,
  "reason": "Flood Damage Recovery"
}
```

---

## 🌪️ Test Disaster Declaration

```json
{
  "name": "Cyclone Biparjoy",
  "type": "CYCLONE",
  "severity": "HIGH",
  "state": "Gujarat",
  "affectedDistricts": ["Kutch", "Jamnagar", "Porbandar", "Devbhumi Dwarka"],
  "declaredDate": "2024-01-15",
  "estimatedImpact": {
    "msmesAffected": 5000,
    "estimatedLoss": 500000000
  },
  "reliefBudget": 100000000
}
```

---

## ✅ Quick Test Checklist

1. **OTP Flow:**
   - [ ] Send OTP to `+919876543210`
   - [ ] Verify with `123456`
   - [ ] Receive JWT token

2. **MSME Registration:**
   - [ ] Fill all required fields
   - [ ] Submit registration
   - [ ] Check for success message

3. **Vendor Registration:**
   - [ ] Choose vendor category
   - [ ] Fill business details
   - [ ] Submit and wait for verification

4. **Wallet Operations:**
   - [ ] Check wallet balance
   - [ ] View transaction history

5. **Booking Flow:**
   - [ ] Search warehouses
   - [ ] Create booking
   - [ ] Confirm payment

---

## 📞 Test Phone Numbers

| Purpose | Phone Number | OTP (LITE Mode) |
|---------|-------------|-----------------|
| MSME Test 1 | 9876543210 | 123456 |
| MSME Test 2 | 9123456780 | 123456 |
| Vendor Test 1 | 9444333222 | 123456 |
| Vendor Test 2 | 9333222111 | 123456 |
| Authority Test | 9000000001 | 123456 |

> **Note:** In LITE mode, any 6-digit OTP code works for all phone numbers.
