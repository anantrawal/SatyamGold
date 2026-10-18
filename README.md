# SatyamGold — Housing Management Web App

## 🚀 Quick Setup Guide

---

### Step 1 — Install Dependencies
```bash
cd satyamgold
npm install
```

---

### Step 2 — Configure Firebase
Open `src/firebase/config.js` and replace with your Firebase config:
```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

---

### Step 3 — Configure Tailwind
Open `src/index.css` — already configured.
Make sure `tailwind.config.js` exists in root (already included).

Add this to your `package.json` scripts if missing:
```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build"
}
```

---

### Step 4 — Create Owner Account

1. Go to **Firebase Console → Authentication → Add User**
2. Enter owner email & password
3. Copy the generated **UID**
4. Go to **Firestore → users collection → Add document**
   - Document ID = the UID you copied
   - Fields:
     ```
     name:      "Your Name"
     email:     "your@email.com"
     role:      "owner"
     createdAt: (current timestamp)
     ```

---

### Step 5 — Seed 150 Plots

Temporarily add this to `App.js` (remove after running once):
```js
import { seedPlots } from './firebase/seedPlots';
// Inside useEffect or a button:
seedPlots();
```

Or open browser console and run it manually.

---

### Step 6 — Run the App
```bash
npm start
```
Opens at: `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── firebase/
│   ├── config.js       ← 🔥 PUT YOUR FIREBASE CONFIG HERE
│   ├── services.js     ← All Firestore/Storage operations
│   └── seedPlots.js    ← Run once to create 150 plots
├── hooks/
│   ├── useAuth.js      ← Authentication & user roles
│   └── usePlots.js     ← Real-time plots data
├── pages/
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   ├── PlotMapPage.js      ← SVG interactive map
│   ├── PlotDetailPage.js   ← Plot info + customer + elevations
│   ├── ElevationsPage.js   ← Upload/manage house designs
│   ├── ReportsPage.js      ← Owner reports
│   ├── UsersPage.js        ← Manage office staff
│   └── NotFoundPage.js
├── components/
│   └── layout/
│       └── MainLayout.js   ← Sidebar + navigation
└── utils/
    └── constants.js        ← Status configs, plot sizes, helpers
```

---

## 🗺️ Adding Your Real SVG Map

When your SVG site plan is ready:

1. Place it in `src/assets/site_map.svg`
2. Open `src/pages/PlotMapPage.js`
3. Find the `PLOT_SHAPES` array at the top
4. Replace the placeholder shapes with your SVG shapes:

```js
// For rectangular plots:
{ id: 'plot_001', type: 'rect', x: 50, y: 50, width: 120, height: 80, label: 'P1' }

// For irregular/polygon plots:
{ id: 'plot_002', type: 'polygon', points: '200,50 350,50 350,180 200,180', label: 'P2' }
```

**Important:** The `id` must match the Firestore document ID (e.g., `plot_001`)

---

## 👥 User Roles

| Role   | Access |
|--------|--------|
| Owner  | Everything — reports, elevations, staff management, all plots |
| Office | Plot map, update plot status, add/edit customer details |

---

## 🔄 Plot Statuses

| Status    | Color  | Meaning |
|-----------|--------|---------|
| Available | 🟢 Green  | No customer, open for sale |
| Booked    | 🟡 Yellow | Customer has paid token |
| Sold      | 🔴 Red    | Fully sold |
| On Hold   | 🔵 Blue   | Temporarily reserved |

---

## 📐 Updating Plot Sizes

Open `src/utils/constants.js` and update:
```js
export const PLOT_SIZES = ['3 Marla', '5 Marla', '7 Marla', '10 Marla', '1 Kanal'];
```
Change to match your actual available sizes.

---

## 🏠 Adding Elevation Designs

1. Login as **Owner**
2. Go to **Elevations** in sidebar
3. Click **Add Design**
4. Select plot size, upload front view & floor plan images
5. Designs automatically appear when customers view that plot size

---

## 📦 Build for Production
```bash
npm run build
```
Upload the `build/` folder to any hosting (Firebase Hosting, Vercel, Netlify).

### Firebase Hosting (Recommended):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```
