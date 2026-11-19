# 🌾 AgroHarvest — Agricultural Marketplace Web App

A full-stack wholesale agricultural commodity marketplace built with **React (Vite)**, **Node.js + Express**, and **MongoDB (Mongoose)** for trading **Paddy**, **Corn**, and **Peanuts**.

AgroHarvest features JSON Web Token (JWT) authentication, granular role-based access control (RBAC), standardized quality grading, moisture laboratory tracking, and an escrow-protected fulfillment pipeline.

---

## 🌟 Key Features by Persona

### 🌾 1. Buyer (`buyer`)
- **Produce Market**: Browse active harvest consignments with multi-attribute filtering:
  - **Commodity tabs**: All, Paddy Rice (🌾), Yellow Corn (🌽), Peanuts (🥜)
  - **Quality Grades**: Grade A (Export / Top Quality), Grade B (Commercial Mill), Grade C (Feed)
  - **Moisture Ceiling Filter**: Filter lots below custom moisture percentage (e.g. $\le 12\%$)
  - **Price Range & Location**: Sift by minimum/maximum price per ton and state/district
  - **Sorting**: Lowest price, lowest moisture %, highest stock volume, or newest listings
- **Bulk Order Placement**:
  - Validates minimum order quantity (MOQ) and available warehouse stock
  - Calculates total order price and places funds in escrow hold
  - Destination warehouse delivery address and custom unloading instructions
- **Order Tracking & Audit**:
  - Live fulfillment pipeline visualizer: `Placed` ➔ `Accepted` ➔ `Processing` ➔ `In Transit` ➔ `Delivered`
  - Escrow status badges (`escrow_hold`, `paid`, `refunded`)
  - Order cancellation (allowed while order is in `pending` review)
  - Detailed audit timeline history showing all fulfillment events

### 🚜 2. Seller (`seller`)
- **Harvest Inventory Management**:
  - Dashboard KPIs: Active market lots, total available volume (Tons), and active inventory valuation
  - Create new produce listings with: commodity, variety, grade, moisture %, quantity, MOQ, unit price, storage type, origin district & state, and description
  - Edit produce specifications, update wholesale prices, and toggle lot availability (Active / Sold Out)
  - Delete or archive listings
- **Fulfillment Desk**:
  - Review incoming buyer purchase requests with destination address and contact info
  - Multi-stage order progression: Accept Order ➔ Mark Bagging & Processing ➔ Dispatch & In Transit ➔ Confirm Delivery
  - Attach fulfillment & dispatch notes (e.g. weighbridge receipts, freight bill of lading)
  - Escrow automatically clears to `paid` upon delivery confirmation

### 🛡️ 3. Platform Admin (`admin`)
- **Platform Analytics**:
  - Real-time Gross Merchandise Value (GMV) across settled and active trades
  - Platform participant metrics (total users, registered sellers, verified cooperatives, buyers)
  - Commodity breakdown cards: available supply (Tons) and average price per ton for Paddy, Corn, and Peanuts
- **Seller Verification & User Directory**:
  - 1-click **Verify / Revoke Verification** for sellers (displays verified producer badge on listings)
  - 1-click **Suspend / Reactivate** user accounts (suspended accounts are blocked at auth middleware)
- **Listing Moderation Desk**:
  - Audit all produce lots including active, delisted, and sold out
  - 1-click **Delist / Relist** with administrative moderation notices (e.g. moisture exceeding safety limits)
- **Global Orders Registry**:
  - Complete marketplace order ledger overseeing all transacted contracts, volume, buyers, sellers, and escrow states

---

## 📁 Project Structure

```text
agri/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Badges, Modals, Footer
│   │   │   ├── Navbar.jsx      # Top navigation with role switcher & user menu
│   │   │   ├── CommodityBadge.jsx
│   │   │   ├── GradeBadge.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── OrderModal.jsx  # Bulk order creation modal
│   │   │   ├── CreateListingModal.jsx # Produce listing modal for sellers
│   │   │   └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # JWT state & 1-click demo role switcher
│   │   ├── pages/              # Role-specific dashboard views
│   │   │   ├── MarketplaceView.jsx    # Buyer marketplace with filters
│   │   │   ├── BuyerOrdersView.jsx    # Buyer order pipeline tracker
│   │   │   ├── SellerInventoryView.jsx# Seller inventory management
│   │   │   ├── SellerOrdersView.jsx   # Seller order fulfillment desk
│   │   │   ├── AdminOverviewView.jsx  # Admin analytics & KPI charts
│   │   │   ├── AdminUsersView.jsx     # Admin user/seller verification
│   │   │   ├── AdminListingsView.jsx  # Admin produce moderation
│   │   │   ├── AdminOrdersView.jsx    # Admin platform orders ledger
│   │   │   └── AuthView.jsx           # Sign in & registration
│   │   ├── services/
│   │   │   └── api.js          # REST API client with JWT bearer tokens
│   │   ├── App.jsx             # Main layout & view router
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── vite.config.js          # Dev proxy to http://127.0.0.1:5000
│   └── package.json
│
├── server/                     # Backend API (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose connector with MongoDB Memory fallback
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT auth & RBAC authorization middleware
│   │   ├── models/
│   │   │   ├── User.js         # User schema (roles: buyer, seller, admin)
│   │   │   ├── Listing.js      # Produce schema (Paddy, Corn, Peanuts)
│   │   │   └── Order.js        # Bulk order schema with timeline events
│   │   ├── routes/
│   │   │   ├── auth.routes.js   # /api/auth (register, login, me, profile)
│   │   │   ├── listing.routes.js# /api/listings (CRUD + multi-filter)
│   │   │   ├── order.routes.js  # /api/orders (place, track, status, cancel)
│   │   │   └── admin.routes.js  # /api/admin (stats, users, moderate, orders)
│   │   ├── seed.js             # Sample data & demo accounts generator
│   │   ├── test-api.js         # Automated end-to-end integration test suite
│   │   └── server.js           # Express app, security headers, SPA static server
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🔑 Demo Accounts & Test Credentials

The database comes pre-seeded with sample users for all three roles:

| Role | Email | Password | Organization / Description |
| :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@agroharvest.com` | `Buyer@123` | Sterling Food Mills (Procuring grains) |
| **Seller** | `seller@agroharvest.com` | `Seller@123` | Green Valley Organic Farmers Co-op |
| **Admin** | `admin@agroharvest.com` | `Admin@123` | AgroHarvest Platform Compliance Desk |

> 💡 **Tip**: In the web UI, click the **"⚡ Test Roles"** button in the header or use the demo buttons on the Sign In page to instantly switch between Buyer, Seller, and Admin with zero typing!

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Quick Setup

1. **Install Dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure Environment Variables**:
   In `server/.env`:
   ```ini
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/agroharvest
   JWT_SECRET=agroharvest_secure_jwt_secret_key_2026_xyz
   JWT_EXPIRES_IN=7d
   ```
   *(If a local standalone MongoDB daemon is not running, the server automatically starts an embedded memory instance)*

3. **Seed Database**:
   ```bash
   cd server
   npm run seed
   ```

4. **Run Integration Tests**:
   ```bash
   cd server
   npm test
   ```

5. **Start Development Servers**:
   - Backend API:
     ```bash
     cd server && npm run dev
     ```
     Server runs at `http://127.0.0.1:5000`
   - Frontend Client:
     ```bash
     cd client && npm run dev
     ```
     Client runs at `http://127.0.0.1:5173`

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new buyer or seller account
- `POST /api/auth/login` — Sign in and obtain JWT bearer token
- `GET /api/auth/me` — Retrieve authenticated user profile *(Requires JWT)*
- `PUT /api/auth/profile` — Update address, company, or bio *(Requires JWT)*

### Produce Listings (`/api/listings`)
- `GET /api/listings` — Filter active produce by commodity, price, grade, moisture %, and location
- `GET /api/listings/:id` — View full details of a specific produce lot
- `GET /api/listings/seller/my-listings` — View all listings owned by logged-in seller *(Seller)*
- `POST /api/listings` — Post new produce lot *(Seller)*
- `PUT /api/listings/:id` — Update produce details or stock *(Seller/Admin)*
- `DELETE /api/listings/:id` — Remove produce listing *(Seller/Admin)*

### Orders & Fulfillment (`/api/orders`)
- `POST /api/orders` — Place a bulk purchase order with stock reservation *(Buyer)*
- `GET /api/orders/buyer/my-orders` — View buyer's order history & status *(Buyer)*
- `GET /api/orders/seller/my-orders` — View seller's incoming purchase orders *(Seller)*
- `GET /api/orders/:id` — Get single order details with audit timeline *(Buyer/Seller/Admin)*
- `PUT /api/orders/:id/status` — Advance fulfillment status *(Seller/Admin)*
- `PUT /api/orders/:id/cancel` — Cancel pending order & restore inventory *(Buyer)*

### Administrative Oversight (`/api/admin`)
- `GET /api/admin/stats` — Platform GMV, user counts, commodity metrics *(Admin)*
- `GET /api/admin/users` — Directory of all platform participants *(Admin)*
- `PUT /api/admin/users/:id/verify-seller` — Toggle verified seller status *(Admin)*
- `PUT /api/admin/users/:id/status` — Suspend or reactivate user account *(Admin)*
- `GET /api/admin/listings` — View all listings including moderated lots *(Admin)*
- `PUT /api/admin/listings/:id/moderate` — Delist/relist produce with admin notice *(Admin)*
- `GET /api/admin/orders` — Comprehensive ledger of all contracts & escrow states *(Admin)*
