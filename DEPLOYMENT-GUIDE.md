# 🚀 GRUHA Platform - Complete Deployment Guide

This guide covers deploying GRUHA on **free hosting services** step-by-step.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option 1: Vercel + Railway (Recommended)](#option-1-vercel--railway-recommended)
3. [Option 2: Render (All-in-One)](#option-2-render-all-in-one)
4. [Option 3: Netlify + Cyclic](#option-3-netlify--cyclic)
5. [GitHub Setup](#github-setup)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Custom Domain Setup](#custom-domain-setup)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] **GitHub Account** - [Sign up free](https://github.com/signup)
- [x] **Node.js 18+** - For local testing
- [x] **Git** - For pushing code
- [x] All services tested locally

---

## GitHub Setup

### Step 1: Create Repository

1. Go to [github.com](https://github.com) → Click "+" → "New repository"
2. Configure:
   - **Name:** `gruha-platform`
   - **Description:** `Climate Resilience Infrastructure for MSMEs - Blockchain Powered Relief Finance`
   - **Visibility:** Public (for free deployments) or Private
   - **Initialize:** Do NOT add README, .gitignore, or license

3. Click **"Create repository"**

### Step 2: Initialize Local Git

Open terminal in your project folder:

```powershell
# Navigate to project
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)"

# Initialize git (if not already)
git init

# Configure git user (if first time)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 3: Create .gitignore (if not exists)

```powershell
# Create .gitignore file
@"
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
.next/
out/
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Turbo
.turbo/

# Blockchain
contracts/cache/
contracts/artifacts/
contracts/typechain-types/

# Misc
*.tgz
.npm
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
```

### Step 4: Add and Commit

```powershell
# Add all files
git add .

# Create commit
git commit -m "feat: Complete GRUHA platform implementation

Features:
- MSME Portal with digital wallet, warehouse/transport booking
- Vendor Portal with service management
- Authority Dashboard with token allocation
- Public Transparency Dashboard
- Blockchain integration (Polygon testnet)
- Real-time API integration
- Offline support with service workers
- Multi-language support foundation
- Emergency mode UI"
```

### Step 5: Push to GitHub

```powershell
# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/gruha-platform.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

If prompted for authentication, use GitHub personal access token (not password).

---

## Option 1: Vercel + Railway (Recommended)

**Best for:** Production-ready deployment with separate frontend/backend
**Cost:** Free tier sufficient for hackathon

### Part A: Deploy Frontend to Vercel

#### Step 1: Sign Up on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

#### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your `gruha-platform` repository
3. Click **"Import"**

#### Step 3: Configure Build Settings

```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_GATEWAY_URL` | `https://gruha-api.up.railway.app` |
| `NEXT_PUBLIC_USER_SERVICE_URL` | `https://gruha-user.up.railway.app` |
| `NEXT_PUBLIC_WALLET_SERVICE_URL` | `https://gruha-wallet.up.railway.app` |
| `NEXT_PUBLIC_BOOKING_SERVICE_URL` | `https://gruha-booking.up.railway.app` |

*Note: Update these URLs after deploying backend to Railway*

#### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Get your URL: `https://gruha-platform.vercel.app`

### Part B: Deploy Backend to Railway

#### Step 1: Sign Up on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"GitHub"**
3. Authorize Railway

#### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find `gruha-platform` repository

#### Step 3: Deploy API Gateway

1. After importing, click **"Add a Service"** → **"GitHub Repo"**
2. Select same repository
3. In service settings:

```
Service Name: gruha-api-gateway
Root Directory: services/api-gateway
Build Command: npm install
Start Command: npx ts-node src/index.ts
```

4. Add environment variable:
   - `PORT` = `3000`

5. Click **"Deploy"**
6. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
7. Note the URL: `https://gruha-api-gateway-xxx.up.railway.app`

#### Step 4: Deploy User Service

Repeat for User Service:

```
Service Name: gruha-user-service
Root Directory: services/user-service
Start Command: npx ts-node src/index.ts
PORT: 3001
```

#### Step 5: Deploy Wallet Service

```
Service Name: gruha-wallet-service
Root Directory: services/wallet-service
Start Command: npx ts-node src/index.ts
PORT: 3002
```

#### Step 6: Deploy Booking Service

```
Service Name: gruha-booking-service
Root Directory: services/booking-service
Start Command: npx ts-node src/index.ts
PORT: 3003
```

#### Step 7: Update Vercel Environment Variables

Go back to Vercel → Project Settings → Environment Variables

Update with actual Railway URLs:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_GATEWAY_URL` | `https://gruha-api-gateway-xxx.up.railway.app` |
| `NEXT_PUBLIC_USER_SERVICE_URL` | `https://gruha-user-service-xxx.up.railway.app` |
| `NEXT_PUBLIC_WALLET_SERVICE_URL` | `https://gruha-wallet-service-xxx.up.railway.app` |
| `NEXT_PUBLIC_BOOKING_SERVICE_URL` | `https://gruha-booking-service-xxx.up.railway.app` |

Then redeploy: **Deployments** → **...** → **Redeploy**

---

## Option 2: Render (All-in-One)

**Best for:** Simple single-platform deployment
**Cost:** Free tier with 750 hours/month

### Step 1: Sign Up on Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub

### Step 2: Create Blueprint (Optional - Advanced)

Create `render.yaml` in project root:

```yaml
services:
  # Frontend
  - type: web
    name: gruha-frontend
    env: node
    rootDir: apps/web
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_GATEWAY_URL
        value: https://gruha-api-gateway.onrender.com
      - key: NEXT_PUBLIC_USER_SERVICE_URL
        value: https://gruha-user-service.onrender.com
      - key: NEXT_PUBLIC_WALLET_SERVICE_URL
        value: https://gruha-wallet-service.onrender.com
      - key: NEXT_PUBLIC_BOOKING_SERVICE_URL
        value: https://gruha-booking-service.onrender.com

  # API Gateway
  - type: web
    name: gruha-api-gateway
    env: node
    rootDir: services/api-gateway
    buildCommand: npm install
    startCommand: npx ts-node src/index.ts
    envVars:
      - key: PORT
        value: 3000

  # User Service
  - type: web
    name: gruha-user-service
    env: node
    rootDir: services/user-service
    buildCommand: npm install
    startCommand: npx ts-node src/index.ts
    envVars:
      - key: PORT
        value: 3001

  # Wallet Service
  - type: web
    name: gruha-wallet-service
    env: node
    rootDir: services/wallet-service
    buildCommand: npm install
    startCommand: npx ts-node src/index.ts
    envVars:
      - key: PORT
        value: 3002

  # Booking Service
  - type: web
    name: gruha-booking-service
    env: node
    rootDir: services/booking-service
    buildCommand: npm install
    startCommand: npx ts-node src/index.ts
    envVars:
      - key: PORT
        value: 3003
```

### Step 3: Deploy via Dashboard

For each service:

1. Go to Render Dashboard → **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Configure:

**Frontend:**
```
Name: gruha-frontend
Root Directory: apps/web
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**Backend Services:**
```
Name: gruha-api-gateway
Root Directory: services/api-gateway
Build Command: npm install
Start Command: npx ts-node src/index.ts
```

4. Add environment variables
5. Click **"Create Web Service"**

### Step 4: Note Service URLs

After deployment, each service gets a URL like:
- `https://gruha-frontend.onrender.com`
- `https://gruha-api-gateway.onrender.com`
- etc.

---

## Option 3: Netlify + Cyclic

**Best for:** Static hosting with serverless backend

### Deploy Frontend to Netlify

1. Go to [netlify.com](https://netlify.com) → Sign up with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select GitHub → Find repository
4. Configure:

```
Base directory: apps/web
Build command: npm run build
Publish directory: apps/web/.next
```

5. Add environment variables
6. Deploy

### Deploy Backend to Cyclic

1. Go to [cyclic.sh](https://cyclic.sh) → Sign up
2. For each service, create new app from GitHub
3. Set root directory for each service

---

## Environment Variables

### Frontend (.env.local)

```env
# API Endpoints
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_WALLET_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_BOOKING_SERVICE_URL=http://localhost:3003

# Features
NEXT_PUBLIC_OFFLINE_MODE_ENABLED=true
NEXT_PUBLIC_EMERGENCY_MODE_AUTO=true
```

### API Gateway (.env)

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3010,https://your-frontend.vercel.app
NODE_ENV=production
```

### User Service (.env)

```env
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/gruha
NODE_ENV=production
```

### Wallet Service (.env)

```env
PORT=3002
BLOCKCHAIN_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/your-api-key
BLOCKCHAIN_PRIVATE_KEY=your-deployer-private-key
NODE_ENV=production
```

### Booking Service (.env)

```env
PORT=3003
NODE_ENV=production
```

---

## Post-Deployment Testing

### 1. Health Checks

Test each service endpoint:

```bash
# Frontend
curl https://your-frontend.vercel.app/

# API Gateway
curl https://your-api.railway.app/health

# User Service
curl https://your-user.railway.app/health

# Wallet Service
curl https://your-wallet.railway.app/health

# Booking Service
curl https://your-booking.railway.app/health
```

### 2. API Tests

```bash
# Test MSME Registration
curl -X POST https://your-user.railway.app/api/users/msme/register \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Business","ownerName":"Test Owner","phone":"9876543210","businessType":"Retail","address":{"city":"Mumbai","state":"Maharashtra","pincode":"400001"}}'

# Test Vendor List
curl https://your-user.railway.app/api/users/vendor/list

# Test Wallet
curl https://your-wallet.railway.app/api/wallet/msme_xxx
```

### 3. Frontend Tests

Visit these URLs:
- Homepage: `https://your-frontend.vercel.app/`
- MSME Portal: `https://your-frontend.vercel.app/msme`
- Vendor Portal: `https://your-frontend.vercel.app/vendor`
- Debug Page: `https://your-frontend.vercel.app/debug`

---

## Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain: `gruha.yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: gruha
   Value: cname.vercel-dns.com
   ```

### Railway

1. Go to Service Settings → Custom Domain
2. Add domain: `api.gruha.yourdomain.com`
3. Configure DNS as shown

### SSL Certificates

Both Vercel and Railway provide **free automatic SSL certificates**.

---

## Troubleshooting

### Common Issues

#### 1. Build Fails on Vercel

**Error:** `Cannot find module 'xyz'`

**Solution:** Ensure all dependencies are in `package.json`, not just devDependencies for production.

```bash
cd apps/web
npm install --save missing-package
```

#### 2. Railway Service Keeps Restarting

**Error:** `Error: Cannot find module`

**Solution:** Check start command uses correct path:
```
Start Command: npx ts-node src/index.ts
```

Not:
```
Start Command: node src/index.ts  # Wrong! TS files need ts-node
```

#### 3. CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:** Add frontend URL to backend CORS:

```typescript
// In each service's index.ts
app.use(cors({
  origin: [
    'http://localhost:3010',
    'https://your-frontend.vercel.app'
  ]
}));
```

#### 4. Environment Variables Not Loading

**Solution:** 
- Vercel: Must prefix with `NEXT_PUBLIC_` for client-side
- Railway: Check "Variables" tab, redeploy after adding
- Render: Variables in service settings

#### 5. Services Can't Communicate

**Solution:** Use full URLs, not localhost:

```typescript
// Wrong
const API_URL = 'http://localhost:3001';

// Correct
const API_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
```

---

## Free Tier Limits

| Platform | Limit | Notes |
|----------|-------|-------|
| **Vercel** | 100GB bandwidth, 100 deployments | Excellent for frontend |
| **Railway** | $5/month credit, 500 hours | Good for hackathons |
| **Render** | 750 hours/month | Services sleep after 15min inactivity |
| **Cyclic** | 100k requests/month | Good for low traffic |

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] CORS origins updated
- [ ] JWT secret changed from default
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Health check endpoints working
- [ ] SSL certificates active
- [ ] Database backups configured (if using DB)
- [ ] Monitoring set up (optional)

---

## Need Help?

- 📖 [Full README](./README.md)
- 🐛 [Report Issues](https://github.com/YOUR_USERNAME/gruha-platform/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/gruha-platform/discussions)

---

**Happy Deploying! 🚀**
