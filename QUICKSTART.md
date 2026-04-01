# FarmBid - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running on localhost:27017 (or Docker)

## Option 1: Local Development (Recommended for Testing)

### Step 1: Start MongoDB
```bash
# If you have MongoDB installed:
mongod

# OR using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Seed the Backend Database
```bash
cd backend
npm run seed
```
Expected output: ✅ Database seeding completed with counts for farmers, buyers, listings, etc.

### Step 3: Start Backend Server
```bash
# In backend/ directory
npm run dev
```
Backend runs on http://localhost:3001
You should see: "🚀 FarmBid Backend Server" and "MongoDB Connected"

### Step 4: Start Frontend (in new terminal)
```bash
cd frontend
npm install  # if not already done
npm run dev
```
Frontend runs on http://localhost:3000

### Step 5: Open Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Health Check: http://localhost:3001/api/health

---

## Option 2: Docker (One Command)

```bash
# Make sure Docker and Docker Compose are installed

# Start all services (MongoDB + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

---

## Testing the Integration

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Fetch Listings (from frontend terminal)
```bash
cd frontend
# The frontend automatically fetches from backend on page load
```

### 3. Run Backend Test Suite
```bash
cd backend
npm test
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongod` or Docker container active
- Check connection string in `backend/.env` (should be `mongodb://localhost:27017`)

### "Backend not responding"
- Verify backend is running on port 3001
- Check `frontend/.env` has `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Look at backend console for errors

### "Frontend shows no data"
- Ensure backend is seeded: `cd backend && npm run seed`
- Check browser console for CORS errors (should not occur)
- Verify API URL in frontend .env file

### Port already in use
- Backend default: 3001 (change in `backend/.env` PORT variable)
- Frontend default: 3000 (change in `frontend/package.json` dev script)

---

## Project Structure

```
FarmBid/
├── frontend/          # Next.js 16 + React 18 + Tailwind
│   └── app/
│       └── page.js   # Main application component
│
├── backend/           # Node.js + Express + MongoDB
│   ├── server.js     # API server
│   ├── models/       # 10 database models
│   ├── routes/       # 12 API modules
│   └── seed.js       # Sample data
│
├── docker-compose.yml # Full stack orchestration
├── README.md         # Full documentation
└── .env.example      # Environment template
```

---

## What's Working

✅ Full CRUD operations for listings
✅ Real-time bidding with validation
✅ Farmer and buyer profiles
✅ Auction countdown timers
✅ Blockchain event tracking (simulated)
✅ Quality analysis (simulated AI)
✅ Wallet management
✅ Dispute filing and resolution
✅ Delivery tracking with photos
✅ Admin dashboard with KPIs
✅ Fraud detection alerts
✅ Multi-language support (UI ready)

---

## Next Steps

1. **Production MongoDB**: Update `backend/.env` with production MongoDB URI
2. **Real Blockchain**: Integrate Web3.js/Ethers.js for actual Polygon transactions
3. **Authentication**: Add JWT or OAuth for user login
4. **File Uploads**: Implement AWS S3 or Cloudinary for image storage
5. **Real-time Updates**: Add WebSocket for live auction updates
6. **Payment Gateway**: Integrate Razorpay/Stripe for wallet top-ups

---

Enjoy your fully segregated FarmBid platform! 🎉
