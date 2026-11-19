# ToDoApp Frontend — React 19, TypeScript & Capacitor 8

![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Capacitor 8](https://img.shields.io/badge/Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white)

Mobile-first client for **ToDoApp**, engineered with **React 19**, **TypeScript**, **Vanilla CSS**, and **Capacitor 8**. Designed to run identically as a responsive web app on Vercel and a native edge-to-edge Android/iOS binary.

---

## Native Capacitor Integrations (`src/lib/native.ts`)

All native calls are guarded by `Capacitor.isNativePlatform()`, keeping desktop and mobile web browsers free of runtime errors while enabling native capabilities on Android and iOS:

* **Local Notifications (`@capacitor/local-notifications`):** Hashes each MongoDB `_id` into a deterministic 32-bit integer notification ID and schedules an OS-level reminder 15 minutes prior to `dueDate`. Toggling completion or deleting a task cancels the pending notification immediately.
* **Haptic Feedback (`@capacitor/haptics`):** Triggers subtle impact feedback on tab switches and theme toggles, success notifications on task creation/updates, and warning vibrations on deletion.
* **Status Bar Sync (`@capacitor/status-bar`):** Enables `setOverlaysWebView({ overlay: true })` and dynamically switches status bar icon contrast between Dark (`#0c121c`) and Light (`#f8f7fc`) themes.
* **Hardware Back Button (`@capacitor/app`):** Routes Android back gestures from `ProfileScreen` back to `HomeScreen` instead of abruptly terminating the app.

---

## Mobile UX & WebView Hardening

* **Zero-Zoom Viewport:** Combines `user-scalable=no`, `touch-action: pan-x pan-y`, a `16px` minimum font size on `input`/`textarea` elements, and global `touchmove` multi-touch prevention so the layout never shifts or zooms when typing.
* **Dual Theme Architecture:** CSS custom properties switch between **Dark + Cyan** (`#06b6d4`) and **Light + Purple** (`#7c3aed`) with instant persistence in `localStorage`.
* **Live Urgency Indicators:** Tasks due within 15 minutes automatically highlight in alert red, polling every 30 seconds without unnecessary component re-mounts.

---

## Environment Variables

Create `frontend/.env` before running or building:

```env
VITE_API_URL=http://localhost:5000/api
```

For production (Vercel & GitHub Actions Secrets), point `VITE_API_URL` to your deployed Render API URL.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Vite development server on port `5173` |
| `pnpm build` | Runs `tsc -b` typechecking and builds production assets into `dist/` |
| `pnpm lint` | Runs ESLint with React 19 hooks and refresh rules |
| `pnpm typecheck` | Verifies strict TypeScript types without emitting files |
| `pnpm format` | Formats `src/` files with Prettier (ignores `android/` & `dist/`) |
| `pnpm cap:android` | Builds `dist/` and syncs assets + native plugins into `android/` |
