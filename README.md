# HarvestRoute
> **Know your best market before your produce leaves the farm.**

HarvestRoute is a precision agricultural supply-chain and decision-support web application that empowers farmers to make financially optimal selling decisions. Instead of relying on advertised sticker prices, HarvestRoute computes true **estimated net return** by factoring in multi-trip transit costs, physical deterioration across perishability classes, mandatory market deductions (APMC commissions, cess, hamali charges), and market purchase ceilings.

---

## 🌾 The Problem HarvestRoute Solves

Farmers frequently select agricultural markets based on advertised headline prices without accounting for:
- **Transportation & Fuel Costs:** Multi-trip fuel, maintenance, driver batta, and toll expenses.
- **Physical Deterioration & Spoilage:** Losses during transit caused by heat, rough roads, delayed unloading, and crop perishability.
- **Market Deductions:** Regulated commission fees (1–3%), state agricultural cess (0.5–1.5%), handling/unloading charges, and gate fees.
- **Purchase Limits & Quotas:** A distant market may advertise a higher price but only purchase a fraction of the harvest (e.g. 12 quintals out of 25), making single-market consignment infeasible.

**HarvestRoute Principle:**
Recommend the destination producing the highest estimated in-pocket net return for the farmer, subject to market purchase limits and logistics feasibility.

---

## 🚀 Key Features

### 1. Multi-Produce Profiles (28+ Crops across 4 Perishability Classes)
- **Vegetables:** Tomato, Onion, Potato, Brinjal, Spinach, Coriander, Cabbage, Cauliflower, Green Beans, Carrot, Cucumber, Pumpkin.
- **Fruits:** Mango, Banana, Apple, Orange, Grapes, Guava, Papaya, Watermelon, Pomegranate.
- **Grains & Cereals:** Rice, Wheat, Maize.
- **Pulses & Legumes:** Chickpea, Pigeon Pea, Green Gram, Dry Beans.
- **Spices & Other:** Chilli, Turmeric, Ginger, Configurable Regional Model.

### 2. Four Perishability Classes
- **Class 1 (Highly Perishable):** Spinach, Coriander, Leafy greens, Ripe berries (high sensitivity to temperature and delay).
- **Class 2 (Moderately Perishable):** Tomato, Brinjal, Banana, Mango (moderate transit resilience).
- **Class 3 (Semi-Perishable):** Onion, Potato, Garlic, Carrot, Pumpkin (durable skin, long ambient stability).
- **Class 4 (Non-Perishable / Dry Produce):** Rice, Wheat, Maize, Pulses (low physical transit loss).

### 3. Dual Spoilage Modes
- **Mode A (Manual):** Direct farmer-specified percentage (0–100%) applied consistently without double-counting.
- **Mode B (Automatic Environmental Model):** Rule-based estimation considering ambient weather (Mild, Warm, Hot), vehicle protection (Open, Covered, Refrigerated), handling/crating quality (Gentle, Standard, Rough), and transit/wait hours.

### 4. Logistics & Fleet Economics
- **Farmer-Owned Vehicle:** Vehicle capacity, fuel mileage, diesel rate, maintenance/km, driver batta, tolls, round-trip calculation, and automatic multi-trip estimation.
- **Commercial Hired Vehicle:** Base trip quotation, capacity, and ancillary loading/permit surcharges.

### 5. Signature Twist: Highest Price vs. Highest Net Return
- Side-by-side comparison of the market advertising the highest sticker price vs. the market yielding the highest in-pocket net return.
- Plain-language dynamic explanation generated from real calculation results.
- Distinguishes between highest price available for any quantity and highest price among feasible single-market destinations.

### 6. Purchase Capacity Constraints & Infeasible Market Segregation
- Markets exceeding capacity or failing minimum purchase limits are strictly identified as infeasible for single-market consignment and moved to a dedicated section with explicit reasoning.

### 7. Sensitivity & Break-Even Analysis
- Computes the exact price increase needed at a competing market to beat the top recommendation.
- Interactive diesel price slider to stress-test transport costs across regional vs metro markets.

### 8. Split-Harvest Optimization (P1 Feature)
- Dual-market allocator for large harvests exceeding quota limits at high-price boutique hubs (e.g., 12 Qtl quota at Sahyadri + remainder at Central APMC).

### 9. Transparent Financial Ledger & Waterfall Visualizations
- Complete itemized breakdown of Gross Proceeds, Spoilage Loss, Logistics Deductions, Mandi Fees, and Net In-Pocket Earnings.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Build Tool:** Vite 5.
- **Architecture:** Pure decoupled TypeScript calculation engine (`src/engine/`) separated from presentation UI (`src/components/`).
- **Data:** Simulated demonstration datasets (`src/data/crops.ts`, `src/data/markets.ts`).

---

## 🧪 Verification & Automated Tests

HarvestRoute includes an automated verification test suite covering all 12 core requirements:
1. Nearby market beats distant market when transport outweighs price gap.
2. Distant market wins when high price premium justifies extra transit.
3. Market with insufficient capacity is excluded from single-market recommendations.
4. Changing from own to rented transport updates costs appropriately.
5. Manual spoilage mode respects entered percentage.
6. Automatic spoilage estimates differ appropriately between Class 1 and Class 4.
7. Grade-wise prices reflect higher revenue for premium grade sort.
8. Legitimate negative net return supported cleanly.
9. Grade percentages that do not total 100% are rejected.
10. Missing market price is rejected rather than assumed zero free produce.
11. Zero vehicle capacity identified as logistics infeasibility.
12. Environmental assumptions update transit loss dynamically.

### Running Verification Tests
```bash
npm test
# or
node scripts/verify.mjs
```

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Run Development Server
```bash
npm run dev
# or
pnpm run dev
```

This starts both the Vite frontend and the Node API server used by `/api/search/prices`.
The backend reads `TAVILY_API_KEY` and `SEARCH_PROVIDER` from the project-root `.env`
file (`codeblooded/.env`); set `TAVILY_API_KEY` to your own key and
`SEARCH_PROVIDER=tavily`. Do not put backend credentials in `VITE_` variables or
commit `.env`. The `.env.example` file contains blank credential placeholders.

### 3. Build for Production
```bash
npm run build
# or
pnpm run build
```

---

## ⚖️ Simulation Disclaimer
All market prices, distances, and capacities in this initial prototype are generated from realistic, configurable demonstration models and are clearly identified as simulated data. No fictional prices are represented as live government APMC quotations.
