# Clash Royale Challenge Widget Setup Guide

## 🚀 Quick Start

### 1. Run Database Migration
```bash
psql $DATABASE_URL -f migrations/002_create_clash_royale_challenges.sql
```

### 2. Access Dashboard
Navigate to: `/dashboard/clash-royale`

### 3. Create a Challenge
- Click "Create Challenge"
- Set win goal (e.g., 20) and max losses (e.g., 3)
- Start tracking!

### 4. Add to OBS
- Copy widget URL from dashboard
- Add as Browser Source in OBS
- Dimensions: 800x600 (adjustable)

## 📦 What Was Created

### Database
- `clash_royale_challenges` table with full challenge tracking

### API Routes (Unprotected for OBS)
- `GET /api/clash-royale/[id]` - Get challenge data
- `POST /api/clash-royale/[id]/win` - Record win
- `POST /api/clash-royale/[id]/lose` - Record loss
- `POST /api/clash-royale/[id]/reset` - Reset attempt

### Pages
- **Dashboard**: `/dashboard/clash-royale` - Full control panel
- **Widget**: `/widget/clashRoyale?id={id}` - OBS overlay

## 🎮 Features

✅ Real-time win/loss tracking
✅ Auto-updates every 2 seconds in OBS
✅ Best run tracking
✅ Total attempts counter
✅ Beautiful gradient UI
✅ Mobile-friendly dashboard
✅ Automatic attempt reset on max losses

## 📱 Usage

**Record a Win**: Click "Win" button or call API
**Record a Loss**: Click "Loss" button or call API
**Reset Attempt**: Click "Reset" to start fresh
**View Stats**: Best run and total attempts tracked automatically

Widget updates in OBS automatically - no manual refresh needed!


