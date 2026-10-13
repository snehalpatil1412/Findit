<<<<<<< HEAD
# FindIt – Digital Lost and Found for Public Spaces

**FindIt** is a modern, responsive web application built with **React.js, Vite, Tailwind CSS, and Firebase** to report, search for, and recover lost belongings across public spaces and university campuses.

---

## 🌟 Key Features

1. **Item Reporting with Zero-Cost Base64 Compression**:
   - Report Lost or Found items with categories, campus zones, specific location, and dates.
   - Built-in HTML5 Canvas image compressor automatically resizes and compresses photos to $\le 100\text{KB}$ Base64 JPEG, stored directly in Firebase Realtime Database without requiring paid cloud storage buckets!
2. **Anti-Fraud Verification Challenges**:
   - For found valuables, finders can set a secret verification question (e.g. *"What custom sticker is on the trackpad?"*).
   - Claimants must answer this challenge when submitting their claim.
3. **Multi-Factor Smart Matching Engine**:
   - Computes weighted similarity scores between opposing Lost and Found reports:
     - 35% Category Match
     - 35% Title & Description Tokenized Dice Similarity
     - 20% Campus Zone Proximity
     - 10% Date Proximity
   - Items scoring $\ge 40\%$ automatically trigger high-visibility **Smart Match Radar** suggestions on "My Reports".
4. **Claim Management & Review**:
   - Claimants provide proof descriptions, answers to challenges, and optional photo attachments.
   - Item finders review proofs side-by-side with item details and can approve or reject with custom notes.
5. **Email Coordination (Live EmailJS + In-App Simulator)**:
   - Upon claim approval, automatically triggers notification emails with return meeting instructions.
   - Includes an in-app Simulation Event Bus with live logs so developers can test and inspect coordination emails without setting up third-party API keys!
6. **Dual-Confirmation Handover Process**:
   - Finder marks: **"Submitted / Handed Over"**.
   - Claimant marks: **"Received"**.
   - Live synchronization: Once **both** parties confirm the in-person exchange:
     - Item status automatically moves to `returned` (removed from active listings).
     - Confetti celebration fires.
     - Immutable transaction record is archived into both users' personal **History** sections.
7. **Personal Transaction History**:
   - Displays completed returns and counterparty contact info.
   - **"Delete from My History"** removes the record strictly from the user's view without modifying or deleting the counterparty's historical record.
8. **Dual-Mode Backend Architecture**:
   - **Out-of-the-Box Demo Mode**: Pre-seeded with realistic campus test data and 1-click persona switching (Alex Chen, Jordan Lee, Officer Miller).
   - **Live Firebase Support**: Connect your live Firebase Realtime Database and Auth either via `.env` or dynamically using the in-app settings modal.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**

### 2. Installation
Open your terminal in the project directory:
```bash
cd findit-app
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. FindIt will immediately launch in **Campus Demo Mode** with pre-seeded items and demo accounts.

---

## ⚙️ Connecting to Live Firebase (Optional)

To connect FindIt to your live Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** (Email/Password provider).
3. Enable **Realtime Database** in test mode or with the rules below.
4. Copy your project configuration to `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
*(Alternatively, click the **Settings (gear)** icon inside the app to paste your credentials directly in the UI!)*

### Firebase Realtime Database Rules (`database.rules.json`)
```json
{
  "rules": {
    ".read": "auth != null || true",
    ".write": "auth != null || true",
    "items": {
      ".indexOn": ["status", "type", "category", "reporterId", "campusZone"]
    },
    "claims": {
      ".indexOn": ["itemId", "claimantId", "ownerId", "status"]
    },
    "user_history": {
      "$userId": {
        ".indexOn": ["completedAt", "itemId"]
      }
    }
  }
}
```

---

## 📧 EmailJS Configuration (Optional)

FindIt includes an **In-App Email Simulator** that logs and previews all claim emails without any external setup. If you'd like real emails dispatched to claimant inboxes:

1. Create a free account at [EmailJS](https://www.emailjs.com/).
2. Add an Email Service and create an Email Template with variables `{{to_name}}`, `{{from_name}}`, `{{item_title}}`, `{{handover_location}}`, `{{instructions}}`.
3. Add your keys to `.env`:
```env
VITE_EMAILJS_SERVICE_ID=service_findit
VITE_EMAILJS_TEMPLATE_ID=template_claim_approved
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 🧪 Testing the Dual Handover Flow

1. Open FindIt at `http://localhost:5173`.
2. Notice the top-right persona profile is **Alex Chen (Student)**.
3. In **Active Listings**, find item **"Black HP Pavilion 15-inch Laptop"** (found by Jordan Lee).
4. Click **"Claim"**, enter your explanation & challenge answer, and submit.
5. In the top-right profile dropdown, switch persona to **Jordan Lee (Library Assistant)**.
6. Click the **Review Claims** tab (badge will show `1` pending claim).
7. Click **"Review Proof & Decide"**, inspect Alex's proof, and click **"Confirm Approval & Send Email"**.
8. Notice both Jordan and Alex now see the **Dual-Confirmation Return Tracker**:
   - Jordan clicks **"Mark as Handed Over"**.
   - Switch back to Alex Chen; Alex clicks **"Mark as Received"**.
9. **Confetti fires!** The item is marked as Returned, vanishes from active listings, and appears in both users' **History** tabs!
=======
# Findit
Findit is a digital lost and found public platform.
>>>>>>> 1c6e2a7f5b8f0755e32a07a133733e9a208697ad
