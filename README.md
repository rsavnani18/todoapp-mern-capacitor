# ToDoApp — Full-Stack MERN & Capacitor Cross-Platform Task Manager

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

Most web-based task managers feel like shrunk-down desktop sites when wrapped into a mobile app. **ToDoApp** is built specifically to eliminate that gap—combining a strict TypeScript **MERN** backend with a custom **React 19 + Vanilla CSS** client wrapped in **Capacitor 8** for native Android and iOS builds.

---

## Architecture & Tech Stack

### Frontend & Native Mobile Layer
* **Core UI:** ![React](https://img.shields.io/badge/-React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
* **Styling:** Custom Vanilla CSS variables with zero UI framework overhead (`Dark + Cyan` and `Light + Purple` themes).
* **Native Bridge:** ![Capacitor](https://img.shields.io/badge/-Capacitor-119EFF?style=flat-square&logo=capacitor&logoColor=white) `@capacitor/local-notifications`, `@capacitor/haptics`, `@capacitor/status-bar`, and `@capacitor/app`.

### Backend & Security Layer
* **API Runtime:** ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
* **Hardening:** `helmet` security headers, `express-rate-limit` (separate API and brute-force auth buckets), `trust proxy` support for reverse proxies, and multi-origin CORS supporting both web domains and `capacitor://localhost` / `https://localhost`.
* **Authentication:** JWT session handling, password hashing, and a client-side mathematical CAPTCHA challenge on sign-in and registration.

### Deployment & CI/CD
* **Cloud Hosting:** ![Render](https://img.shields.io/badge/-Render-46E3B7?style=flat-square&logo=render&logoColor=black) (Backend API) & ![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white) (Web PWA).
* **Automated APK Releases:** ![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) compiles the Vite bundle, runs `cap sync android`, builds the Gradle APK, and attaches it directly to GitHub Releases on every `v*` tag push.

---

## Key Engineering Highlights

1. **True Edge-to-Edge Mobile Layout:** Uses `viewport-fit=cover`, `StatusBar.setOverlaysWebView({ overlay: true })`, and `env(safe-area-inset-*)` fallbacks so the UI sits cleanly behind transparent Android/iOS status and gesture bars.
2. **Layout-Level Zoom Lock:** Prevents accidental pinch-zoom, double-tap zoom, and mobile keyboard auto-zoom via `touch-action: pan-x pan-y`, `16px` input font enforcement, and multi-touch gesture guards.
3. **Offline-Capable OS Reminders:** Setting a due date schedules a native OS notification 15 minutes before the deadline via deterministic MongoDB ObjectId hashing. Completing or deleting a task automatically cancels the scheduled alarm.
4. **Hardware Back-Button Stack:** Intercepts the Android hardware/gesture back button to step backward through Profile and modal states before exiting the app.

---

## Repository Structure

```text
todoapp-mern-capacitor/
├── .github/
│   └── workflows/
│       └── release-apk.yml    # Automated Android APK build & GitHub Release pipeline
├── backend/                   # Express + TypeScript + MongoDB REST API
├── frontend/                  # React 19 + Vite + Capacitor Android/iOS client
├── CONTRIBUTING.md            # Development & pull request workflow
├── LICENSE                    # MIT License
└── README.md                  # Project overview & setup guide
```

---

## Quick Start

### Prerequisites
* **Node.js** `20+` and **pnpm** `10+`
* **MongoDB** Atlas URI or local MongoDB instance

### 1. Clone the Repository
```bash
git clone [https://github.com/rsavnani18/todoapp-mern-capacitor.git](https://github.com/rsavnani18/todoapp-mern-capacitor.git)
cd todoapp-mern-capacitor
```

### 2. Start the Backend API
```bash
cd backend
pnpm install
cp .env.example .env   # Configure MONGODB_URI, JWT_ACCESS_SECRET, CLIENT_URL
pnpm dev
```
Detailed API routes and production config are documented in [`backend/README.md`](./backend/README.md).

### 3. Start the Frontend & Sync Capacitor
```bash
cd ../frontend
pnpm install
cp .env.example .env   # Set VITE_API_URL=http://localhost:5000/api
pnpm dev
```
To sync web assets into the native Android project:
```bash
pnpm cap:android
```
Native plugin details and WebView rules are documented in [`frontend/README.md`](./frontend/README.md).

---

## Automated Android APK Builds

Push a version tag to trigger the GitHub Actions release pipeline:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Once the workflow finishes, `ToDoApp-v1.0.0.apk` is published automatically under the **Releases** tab.

---

## Author & License

Built by **Rahul Savnani** ([@rsavnani18](https://github.com/rsavnani18)).  
Licensed under the [MIT License](./LICENSE).
