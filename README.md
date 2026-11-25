# ToDoApp v2 — Full-Stack MERN & Capacitor Tasks + Keep-Style Notes Manager

[![Live Web App](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://todoapp-mern-capacitor.vercel.app)
[![Download Android APK](https://img.shields.io/badge/Download-Android_APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/rsavnani18/todoapp-mern-capacitor/releases/latest)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express 5](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Capacitor 8](https://img.shields.io/badge/Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

Most web-based productivity tools feel like shrunk-down desktop websites when packaged for mobile. **ToDoApp v2** bridges that gap—combining a strict TypeScript **MERN** API with a mobile-native **React 19 + Tailwind CSS v4** client wrapped in **Capacitor 8**, unifying **Priority Task Management** and **Google Keep-style Notes & Checklists** in a single workspace.

* **Live Web App:** [https://todoapp-mern-capacitor.vercel.app](https://todoapp-mern-capacitor.vercel.app)
* **Latest Android APK:** [Download from GitHub Releases](https://github.com/rsavnani18/todoapp-mern-capacitor/releases/latest)

---

## What's New in v2.0.0

* **Keep-Style Notes & Interactive Checklists:** Create rich text notes or live tickable checklists with instant single-tap checkbox toggling directly from the masonry card grid.
* **Theme-Adaptive Note Colors, Pinning & Labels:** Organize notes with 7 dual-theme surface colors, top pinning, `#label` filtering, Archive, and a recoverable Trash bin.
* **Two-Way Task ↔ Note Conversion:** Convert any actionable note or unchecked checklist items directly into ToDo tasks—or archive a detailed task into a Keep note with one tap.
* **Redesigned Tailwind CSS v4 UI:** Rebuilt from scratch with `Tailwind CSS v4`, `clsx`, and `tailwind-merge`, featuring a default clean Light theme, Dark mode toggle, and a unified Royal Purple accent.

---

## Architecture & Tech Stack

### Frontend & Native Mobile Layer
* **Core UI:** ![React](https://img.shields.io/badge/-React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
* **Styling:** ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) with `clsx` + `tailwind-merge` utility composition and CSS custom properties for seamless Light/Dark mode parity.
* **Native Bridge:** ![Capacitor](https://img.shields.io/badge/-Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white) `@capacitor/local-notifications`, `@capacitor/haptics`, `@capacitor/status-bar`, and `@capacitor/app`.

### Backend & Security Layer
* **API Runtime:** ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/-Express_5-000000?style=flat-square&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) ![Zod](https://img.shields.io/badge/-Zod_v4-3E67B1?style=flat-square&logo=zod&logoColor=white)
* **Hardening:** `helmet` security headers, `express-rate-limit` (separate API and brute-force auth buckets), escaped regex search queries, `trust proxy` support, and multi-origin CORS for web domains and `capacitor://localhost` / `https://localhost`.
* **Authentication:** JWT session handling (HTTP-only cookies + Bearer token fallback), `bcryptjs` password hashing, and a client-side mathematical CAPTCHA challenge on sign-in and registration.

### Deployment & CI/CD
* **Cloud Hosting:** ![Render](https://img.shields.io/badge/-Render-46E3B7?style=flat-square&logo=render&logoColor=black) (Backend REST API) & ![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white) (Web PWA).
* **Automated APK Releases:** ![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) generates adaptive launcher icons and notification drawables via `@capacitor/assets`, compiles the Vite bundle, runs `cap sync android`, builds the Gradle APK, and attaches it directly to GitHub Releases on every `v*` tag push.

---

## Key Engineering Highlights

1. **True Edge-to-Edge Mobile Layout:** Uses `viewport-fit=cover`, `StatusBar.setOverlaysWebView({ overlay: true })`, dynamic status bar icon contrast syncing, and `env(safe-area-inset-*)` utilities so the UI sits cleanly behind transparent Android/iOS system bars.
2. **Layout-Level Zoom Lock:** Prevents accidental pinch-zoom, double-tap zoom, and mobile keyboard auto-zoom via `touch-action: pan-x pan-y`, `16px` input font enforcement, and multi-touch gesture guards.
3. **Smart Offline OS Reminders:** Setting a due date on a task or reminder on a note schedules a high-importance Android notification channel alert 15 minutes ahead (with automatic short-window fallback) via positive 32-bit ObjectId hashing. Completing, deleting, or trashing an item cancels its alarm automatically.
4. **Hardware Back-Button Stack:** Intercepts the Android hardware/gesture back button to dismiss active bottom-sheet modals first, step back from Profile to Home, and exit cleanly only at the root screen.

---

## Repository Structure

```text
todoapp-mern-capacitor/
├── .github/
│   └── workflows/
│       └── release-apk.yml    # Automated Android APK build & GitHub Release pipeline
├── backend/                   # Express 5 + TypeScript + Mongoose REST API (Tasks, Notes, Auth)
├── frontend/                  # React 19 + Tailwind CSS v4 + Vite + Capacitor 8 client
├── CONTRIBUTING.md            # Development & pull request workflow
├── LICENSE                    # MIT License
└── README.md                  # Project overview & setup guide
```

---

## Quick Start

### Prerequisites
* **Node.js** `22+` and **pnpm** `10+`
* **MongoDB** Atlas URI or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/rsavnani18/todoapp-mern-capacitor.git
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
To build web assets and sync into the native Android project:
```bash
pnpm build && pnpm exec cap sync android
```
Native plugin details and WebView rules are documented in [`frontend/README.md`](./frontend/README.md).

---

## Automated Android APK Builds

Push a version tag to trigger the GitHub Actions release pipeline:

```bash
git tag v2.0.0
git push origin v2.0.0
```

Once the workflow finishes, `ToDoApp-v2.0.0.apk` is published automatically under the [Releases](https://github.com/rsavnani18/todoapp-mern-capacitor/releases) tab.

---

## Author & License

Built by **Rahul Savnani** ([@rsavnani18](https://github.com/rsavnani18)).  
Licensed under the [MIT License](./LICENSE).
