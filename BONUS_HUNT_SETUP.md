# Bonus Hunt Widget - Setup Guide

## Overview

A complete Slots Bonus Hunt tracking system has been implemented with dashboard management and OBS widget display using a sleek black and amber color scheme.

## What Was Built

### 1. Database Schema
- **Location**: `migrations/003_create_bonus_hunts.sql`
- Two tables created:
  - `bonus_hunts`: Stores hunt information (name, start balance)
  - `bonus_hunt_slots`: Stores individual slot bonuses with bet size, payout, and position

### 2. API Routes
All CRUD operations for hunts and slots:
- `GET/POST /api/bonus-hunt` - List and create hunts
- `GET/PATCH/DELETE /api/bonus-hunt/[id]` - Get, update, delete hunt
- `POST /api/bonus-hunt/[id]/slots` - Add slot to hunt
- `PATCH/DELETE /api/bonus-hunt/[id]/slots/[slotId]` - Update/delete slot
- `POST /api/bonus-hunt/[id]/slots/reorder` - Reorder slots (up/down)

### 3. State Management
- **Location**: `store/useBonusHuntStore.ts`
- Zustand store managing all hunt and slot operations
- Handles loading states, errors, and form data

### 4. Dashboard Components
- **HuntStats**: Real-time statistics display with calculations
- **SlotList**: Slot management with inline editing and reordering
- **BonusHuntManager**: Main management interface for a single hunt
- **Dashboard Page**: Overview page listing all hunts

### 5. OBS Widget
- **Location**: `app/widget/bonus-hunt/[huntId]/page.tsx`
- Black background (#000000) with amber accents (#FFBF00)
- White text for maximum readability
- Auto-refreshes every 10 seconds
- Highlights best wins with glowing amber border

## Key Features

### Hunt Management
- ✅ Create hunt with starting balance (editable anytime)
- ✅ Count total hunts
- ✅ Add slots with name and bet size
- ✅ Edit payout after opening slots
- ✅ Reorder slots with up/down buttons
- ✅ Delete slots
- ✅ Delete entire hunts

### Statistics (Auto-calculated)
- **Hunt Cost**: Starting balance
- **Hunt Paid**: Sum of all opened slots' payouts
- **Running Avg X**: Average multiplier of opened slots
- **Required Avg X**: Multiplier needed on remaining slots to break even
- **Best Win (Dollar)**: Highest payout amount
- **Best Win (Multi)**: Highest multiplier

### OBS Widget Features
- Sleek black and amber design
- Stats displayed prominently at top
- Best wins highlighted with glow effect
- Slot list showing opened/unopened status
- Real-time updates
- Transparent background for OBS overlay

## Setup Instructions

### 1. Run Database Migration

You need to run the migration to create the database tables:

```bash
# Connect to your PostgreSQL database and run:
psql -U your_username -d your_database -f migrations/003_create_bonus_hunts.sql
```

Or if you have a migration tool, run migration `003_create_bonus_hunts.sql`.

### 2. Access the Dashboard

Navigate to: `http://localhost:3000/dashboard/bonus-hunt`

The "Bonus Hunt" link is now available in your dashboard navigation sidebar.

### 3. Create Your First Hunt

1. Click "Create Hunt"
2. Enter a name (e.g., "Saturday Night Hunt")
3. Set start balance (e.g., $500)
4. Click "Create Hunt"

### 4. Manage Hunt

1. Click "Manage" on any hunt card
2. Edit start balance using the edit button
3. Add slots with "Add Slot" button:
   - Enter slot name (e.g., "Gates of Olympus")
   - Enter bet size (e.g., $20)
4. After opening a bonus, click the edit icon to enter payout
5. Use up/down arrows to reorder slots
6. Stats update automatically

### 5. Use Widget in OBS

1. Click the "Copy URL" button on hunt card
2. In OBS, add "Browser Source"
3. Paste the URL (format: `http://localhost:3000/widget/bonus-hunt/{huntId}`)
4. Set width: 1920, height: 1080
5. Recommended: Check "Shutdown source when not visible"

## File Structure

```
migrations/
  └── 003_create_bonus_hunts.sql          # Database schema

lib/
  ├── models.ts                            # TypeScript interfaces
  └── db.ts                                # Database config

app/
  ├── api/bonus-hunt/                      # API routes
  │   ├── route.ts                         # GET/POST hunts
  │   └── [id]/
  │       ├── route.ts                     # GET/PATCH/DELETE hunt
  │       └── slots/
  │           ├── route.ts                 # POST slot
  │           ├── [slotId]/route.ts        # PATCH/DELETE slot
  │           └── reorder/route.ts         # POST reorder
  ├── dashboard/bonus-hunt/
  │   └── page.tsx                         # Dashboard page
  └── widget/bonus-hunt/[huntId]/
      └── page.tsx                         # OBS widget page

components/
  └── bonus-hunt/
      ├── BonusHuntManager.tsx             # Main manager component
      ├── HuntStats.tsx                    # Statistics display
      ├── SlotList.tsx                     # Slot list with editing
      └── BonusHuntWidget.tsx              # OBS widget component

store/
  └── useBonusHuntStore.ts                 # Zustand state management
```

## Calculations Explained

### Hunt Cost
```
Hunt Cost = Start Balance
```
The amount you started the hunt with.

### Hunt Paid
```
Hunt Paid = Sum of all opened slots' payouts
```

### Running Average X
```
Running Avg X = Average(payout / bet_size) for all opened slots
```

### Required Average X to Break Even
```
Remaining Bet Total = Sum of unopened slots' bet sizes
Required Avg X = (Start Balance - Hunt Paid) / Remaining Bet Total
```

**Example:**
- Started with $500
- Opened 3 slots, paid $200 total
- Have 2 unopened slots with $50 + $100 bets = $150 total
- Required Avg X = ($500 - $200) / $150 = 2.0x

You need an average 2.0x multiplier on the remaining slots to break even.

## Widget Color Scheme

- **Background**: Pure black (#000000)
- **Primary accent**: Amber (#FFBF00)
- **Text**: White (#FFFFFF)
- **Unopened slots**: Low opacity white
- **Opened slots**: Amber highlights
- **Best wins**: Glowing amber border with shadow

## Tips

1. **Edit Start Balance**: Click the edit icon next to start balance anytime to update it
2. **Reorder Anytime**: Use up/down arrows to organize slots by preference
3. **Best Win Tracking**: The widget automatically highlights your best wins
4. **Widget URL**: Each hunt has its own unique widget URL
5. **Auto-refresh**: Widget updates every 10 seconds automatically

## Next Steps

1. Run the database migration
2. Restart your development server
3. Navigate to the dashboard
4. Create your first bonus hunt
5. Add some slots and test the calculations
6. Copy the widget URL and test it in OBS

Enjoy tracking your bonus hunts! 🎰✨
