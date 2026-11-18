# EcoPulse AI — Campus Plastic & Economic Impact Analyzer 🌿💰

> **An AI-powered behavioral economics initiative helping university students track single-use plastic expenses and transition to zero-waste campus habits in Uzbekistan.**  
> *Developed as a Wayfinder Society Student Mini-Grant Initiative | Economics × AI × Sustainability*

---

## 📌 Executive Summary

Single-use plastic bottles (PET) and disposable paper cups with polyethylene linings represent both an **ecological hazard** in Central Asian urban centers and a **hidden financial drain** on university student budgets.

In Tashkent, an average university student purchasing two 0.5L water bottles (4,000 UZS each) and one cafeteria coffee (15,000 UZS) every class day dissipates over **2,070,000 UZS (~$162 USD)** during a 9-month academic year while generating over **810 disposable containers (~17.3 kg of plastic waste)**.

**EcoPulse AI** introduces a dual-lever behavioral economics solution:
1. **Interactive Economic Micro-Accounting:** Quantifies personal and institutional capital loss, illustrating how a **150,000 UZS (~$11.72 USD) reusable thermos pays for itself in just 7 to 14 days**.
2. **AI Proof-of-Reuse Vision Verification:** A lightweight computer vision system (deployable via web or Telegram bot `@EcoPulseUzBot`) verifying reusable containers in under 50ms, rewarding students with instant **EcoPoints** convertible into university printing quotas, cafeteria perks, and academic rewards.
3. **Institutional Campus Policy Proposal:** Empowers university administrations (e.g., WIUT, Inha, New Uzbekistan University, TUIT) to model the CapEx and payback timeline of installing touchless, multi-stage filtered **Smart Water Refill Stations** across campus buildings.

---

## 🚀 Key Features

### 1. Hero Impact Dashboard & Real-Time Campus Pilot Telemetry
- **Full Multi-Language Support (i18n):** Seamless instant toggling between **English (EN)**, **Uzbek (UZ)**, and **Russian (RU)** directly from the navbar with zero page reloads and state preservation.
- **Live Counter Simulation:** Dynamically updates campus pilot benchmarks (e.g., *4,280+ plastic bottles prevented*, *$1,450+ student funds preserved*, *128+ active student participants*).
- **Exchange Rate Integration:** Synchronized at **1 USD = 12,800 UZS** (Central Bank of Uzbekistan benchmark).

### 2. Interactive Plastic Cost & Impact Calculator
- **Smooth Sliders & Presets:** Adjust daily plastic water bottles (0–10), disposable coffee cups (0–10), and unit prices (default: 4,000 UZS water, 15,000 UZS coffee).
- **Flexible Time Horizons:** Toggle between **Monthly (30 days)**, **Semester (4 months)**, or **Academic Year (9 months)**.
- **Dynamic Instant Output Cards:**
  - **Total Financial Loss:** Formatted in UZS and USD.
  - **Plastic Footprint:** Total disposable items, weight in kilograms, and life-cycle $\text{CO}_2\text{e}$ emissions.
  - **Thermos ROI Metric:** Exact break-even timeline and net savings.
- **Visual Trajectory Chart (Chart.js):** 9-month compounding trajectory comparing **Status Quo (Single-Use Spend)** vs. **Zero-Waste Switch (Thermos + Free Refills)** with interactive view toggles (Spend vs. Items).

### 3. AI Verification Simulator ("Proof-of-Reuse" Demo)
- **Computer Vision Viewfinder:** Animated scanning laser line and optical recognition simulation.
- **3 Quick Preset Demo Triggers:**
  - `Test with Reusable Thermos Photo`
  - `Test with Glass Water Bottle`
  - `Test with Single-Use Plastic Bottle`
- **Custom Image Upload:** Drag-and-drop or upload any container photo with instant client-side preview.
- **Instant Verdict & Confidence Score:**
  - *Reusable:* `✅ Verified Reusable Container (98.4% confidence) — +15 EcoPoints & 4,000 UZS saved added to your profile!`
  - *Single-Use:* `⚠️ Single-Use PET Plastic Detected (96.1% confidence) — Tip: Switch to a refillable bottle to save ~120,000 UZS/month.`
- **Auditory Feedback:** Native synthesized Web Audio API chimes (pleasant ascending chime for verified containers, gentle amber warning tone for disposable packaging).
- **Raw Telemetry Inspector:** Expandable JSON output displaying model metadata, edge hardware simulation, inference latency (38ms), and bounding box coordinates.

### 4. Campus Policy & Water Refill Station Proposal
- **Macro-Economic Slider:** Model campus student population from 500 to 10,000 students.
- **Aggregated Metrics:** Annual plastic tonnage generated, student capital outflow, recommended refill station count (1 per ~300 students), and university CapEx payback.
- **Behavioral Economics 4-Pillar Framework ("Nudge Theory"):**
  1. *Default Choice Architecture:* Placing refill stations at high-traffic auditorium nodes.
  2. *Loss Aversion Framing:* Itemizing single-use cup fees on canteen receipts.
  3. *Social Proof Leaderboard:* Inter-faculty gamification and live progress boards.
  4. *Immediate Micro-Incentives:* EcoPoints redeemable for campus perks.

### 5. Gamified Student Eco-Leaderboard
- Live rankings highlighting real university students in Tashkent, tracking check-in streaks, EcoPoints, and cumulative money saved.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Clean, responsive, self-contained HTML5 & modern vanilla ES6+ JavaScript.
- **Styling:** [Tailwind CSS](https://tailwindcss.com) (via CDN) with custom micro-animations, glassmorphism, and responsive grid layouts.
- **Data Visualization:** [Chart.js](https://www.chartjs.org/) for responsive line/bar trajectories.
- **Sound Design:** Web Audio API (zero external `.mp3` or `.wav` dependencies, instant low-latency synthesis).
- **Typography:** Google Fonts (`Inter` & `Outfit`).
- **Zero Build Dependencies:** No npm or node build step required. Runs directly in any modern browser!

---

## 💻 How to Run Locally

### Option 1: Direct File Open
Simply double-click `index.html` in your file explorer to open it in Chrome, Edge, Safari, or Firefox.

### Option 2: Python HTTP Server (Recommended)
From the project folder, run:
```bash
py -m http.server 8000
```
Then navigate to: `http://localhost:8000`

---

## 🌐 Deploy to Vercel or Netlify

### Deploying to Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Drag and drop this folder (`ecopulse-ai`) into the Netlify Sites dashboard.
3. Your web app goes live immediately!

### Deploying to Vercel
1. Install Vercel CLI or connect your GitHub repository to Vercel.
2. The included `vercel.json` ensures instant static serving with optimal cache headers.

---

## 📜 Grant Acknowledgment
Developed for the **Wayfinder Society Student Mini-Grant** competition.  
*Theme: Economics × Artificial Intelligence × Sustainable Development Goals (SDG 12: Responsible Consumption and Production).*
