# GRUHA Free Tier Tech Stack

## Overview
Complete tech stack that requires NO Docker, NO credit card, and works entirely free for development and demo purposes.

---

## 🗄️ Database Layer

### Primary: SQLite with better-sqlite3
```
Package: better-sqlite3
Cost: FREE
Setup: Zero configuration
Persistence: Local file (./data/gruha.db)
Features:
  - Full SQL support
  - ACID compliant
  - 2GB+ database support
  - Synchronous API (no async issues)
  - Indexes, foreign keys
```

**Why better-sqlite3 over lowdb:**
- Real SQL queries (not just key-value)
- Better performance
- Proper relational data
- Easy migration to PostgreSQL later

---

## 🔴 Cache Layer

### In-Memory Cache with node-cache
```
Package: node-cache
Cost: FREE
Setup: Zero configuration
Features:
  - TTL support
  - Automatic expiration
  - LRU eviction
  - Event listeners
```

**Implementation:**
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60,
  useClones: false,
});

// Redis-like interface
export const cacheAdapter = {
  get: (key: string) => cache.get(key),
  set: (key: string, value: any, ttl?: number) => cache.set(key, value, ttl),
  del: (key: string) => cache.del(key),
  flush: () => cache.flushAll(),
};
```

---

## ⛓️ Blockchain Layer

### Local File-Based Blockchain (Already Implemented!)
```
Location: services/blockchain-service/
Cost: FREE
Persistence: ./data/blockchain.json
Features:
  - SHA-256 hash chains
  - Merkle tree roots
  - Proof of work (low difficulty)
  - Cryptographic signatures
  - Full audit trail
```

**Production Path:** Replace with Hyperledger Fabric when ready.

---

## 📱 SMS Gateway

### Option 1: Development Mode (Recommended)
```typescript
// Console logging + store in DB
const sendSMS = async (mobile: string, message: string) => {
  console.log(`📱 SMS to ${mobile}: ${message}`);
  await db.run(`INSERT INTO sms_log (mobile, message, sent_at) VALUES (?, ?, ?)`,
    [mobile, message, new Date().toISOString()]);
  return { success: true, mode: 'development' };
};
```

### Option 2: Textbelt (1 Free SMS/day)
```
API: https://textbelt.com/text
Cost: 1 FREE SMS per day (for testing)
Production: $0.05 per SMS
```

### Option 3: Email-to-SMS (Carrier Specific)
```
Format: {number}@carrier-gateway.com
Example: 9876543210@sms.airtel.com
Cost: FREE (if you have email sending)
Limitation: Carrier-specific
```

---

## 🔊 Voice Alerts

### Web Speech API (Browser-based TTS)
```typescript
// Free, works offline, no API key
const speak = (text: string, lang = 'hi-IN') => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
};

// Emergency alert
speak('आपके क्षेत्र में आपातकालीन स्थिति। कृपया सुरक्षित स्थान पर जाएं।');
```

**Supported Languages:**
- Hindi (hi-IN)
- English (en-IN)
- Gujarati (gu-IN)
- Marathi (mr-IN)
- Tamil (ta-IN)
- Telugu (te-IN)

---

## 💳 Payment Settlement

### Simulation Mode (Development)
```typescript
interface Settlement {
  vendorId: string;
  amount: number;
  inrAmount: number;
  bankReference: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

const processSettlement = async (settlement: Settlement) => {
  // Simulate bank transfer delay
  await sleep(2000);
  
  // Update vendor balance
  await db.run(`
    UPDATE vendors 
    SET total_earnings = total_earnings + ?,
        pending_settlement = pending_settlement - ?
    WHERE id = ?
  `, [settlement.inrAmount, settlement.inrAmount, settlement.vendorId]);
  
  // Log settlement
  await db.run(`
    UPDATE settlements SET status = 'COMPLETED', settled_at = ? WHERE id = ?
  `, [new Date().toISOString(), settlement.id]);
  
  return { success: true, reference: `SIM-${Date.now()}` };
};
```

**Production Path:** Integrate Razorpay/PayU when ready.

---

## 🌦️ Weather/Disaster Alerts

### Open-Meteo API (Completely Free)
```
API: https://api.open-meteo.com/v1/forecast
Cost: FREE (no API key needed)
Rate Limit: Generous for development
```

```typescript
const getWeatherAlert = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&daily=weather_code,precipitation_sum&timezone=Asia/Kolkata`
  );
  const data = await response.json();
  
  // Weather codes: 95, 96, 99 = Thunderstorm
  // 61-67 = Rain, 71-77 = Snow
  const severeWeatherCodes = [95, 96, 99, 65, 67, 77];
  const isSevere = severeWeatherCodes.includes(data.current.weather_code);
  
  return {
    current: data.current,
    isSevere,
    shouldAlert: isSevere || data.current.precipitation > 50,
  };
};
```

### Manual Disaster Declaration (Primary Method)
```
Authority Dashboard → Declare Disaster → Affects all MSMEs in region
No external API needed for core functionality
```

---

## 🖼️ Image Storage

### Option 1: Local File System (Development)
```typescript
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const saveImage = async (file: Buffer, filename: string) => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, file);
  return `/uploads/${filename}`;
};
```

### Option 2: Cloudinary (25GB Free)
```
Free Tier: 25GB storage, 25GB bandwidth/month
API: https://cloudinary.com/
Great for: Production proofs, thumbnails
```

### Option 3: ImgBB (Unlimited Free)
```
API: https://api.imgbb.com/1/upload
Cost: FREE
Get Key: https://api.imgbb.com/
```

---

## 🗺️ Maps

### Mapbox GL JS
```
Free Tier: 50,000 map loads/month
Get Token: https://account.mapbox.com/
```

### Alternative: Leaflet + OpenStreetMap
```
Cost: Completely FREE
No API key needed
```

```typescript
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

<MapContainer center={[21.17, 72.83]} zoom={10}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap'
  />
</MapContainer>
```

---

## 📧 Email (for Notifications)

### Resend (100 emails/day free)
```
Free Tier: 100 emails/day, 3000/month
API: https://resend.com/
```

### Alternative: Nodemailer + Gmail
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App password, not regular
  },
});
```

---

## 🔔 Push Notifications

### Web Push (Browser Notifications)
```
Cost: FREE
Package: web-push
No external service needed
```

```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@gruha.gov.in',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Generate VAPID keys (once)
// npx web-push generate-vapid-keys
```

---

## 🌐 Hosting

### Frontend: Vercel (Free)
```
Cost: FREE for personal/hobby
Features:
  - Automatic HTTPS
  - Edge CDN
  - Preview deployments
  - Next.js optimized
```

### Backend: Render.com (Free)
```
Cost: FREE tier available
Features:
  - 750 hours/month
  - Auto-sleep after inactivity
  - PostgreSQL free tier (90 days)
```

### Alternative: Railway.app
```
Cost: $5 free credits/month
Better uptime than Render free tier
```

### Self-Hosted: Local Development
```
Frontend: localhost:3000
Backend: localhost:3001
All services: pnpm run dev:lite
```

---

## 📊 Analytics (Optional)

### Plausible Analytics (Self-hosted free)
```
Self-hosted: FREE
Cloud: $9/month
Privacy-focused, lightweight
```

### Alternative: PostHog (Free tier)
```
Free Tier: 1M events/month
Features: Session recording, feature flags
```

---

## 🔐 Authentication

### JWT + bcrypt (Built-in)
```
Packages: jsonwebtoken, bcryptjs
Cost: FREE
Features:
  - Access/refresh tokens
  - Password hashing
  - Session management
```

---

## 📦 Complete Package List

```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0",
    "node-cache": "^5.1.2",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "crypto-js": "^4.2.0",
    "uuid": "^9.0.0",
    "web-push": "^3.6.0",
    "nodemailer": "^6.9.0",
    "qrcode": "^1.5.3"
  }
}
```

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo>
cd GRUHA-IITKGP
pnpm install

# Create .env file
cat > .env.local << EOF
USE_LITE_MODE=true
NO_DOCKER=true
JWT_SECRET=your-secret-key
DATABASE_PATH=./data/gruha.db
EOF

# Start all services
pnpm run dev:lite

# Or start individually
pnpm --filter web dev
pnpm --filter api-gateway dev
```

---

## 💰 Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| Database | FREE | SQLite |
| Cache | FREE | node-cache |
| Blockchain | FREE | Local file |
| SMS | FREE* | Dev mode / 1/day |
| Voice | FREE | Web Speech API |
| Weather | FREE | Open-Meteo |
| Images | FREE | Local/Cloudinary |
| Maps | FREE | OpenStreetMap |
| Email | FREE | Resend 100/day |
| Push | FREE | web-push |
| Hosting | FREE | Vercel + Render |
| **TOTAL** | **$0** | Production-ready demo |

---

## 🔄 Production Migration Path

When ready for production:

1. **Database:** SQLite → PostgreSQL (Supabase free tier)
2. **Cache:** node-cache → Upstash Redis (free tier)
3. **Blockchain:** Local → Hyperledger Fabric
4. **SMS:** Dev mode → Kaleyra/MSG91
5. **Payments:** Simulation → Razorpay
6. **Hosting:** Render → AWS/Azure

All code is designed for easy migration - just swap adapters!
