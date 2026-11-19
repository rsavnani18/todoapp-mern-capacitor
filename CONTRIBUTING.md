# Contributing to ToDoApp

Thanks for taking the time to improve **ToDoApp**. Whether you are fixing an Android WebView layout quirk, tightening API validation, or adding a native Capacitor capability, follow the workflow below so changes merge cleanly.

---

## Local Development Setup

1. **Fork & Clone**
   ```bash
   git clone [https://github.com/rsavnani18/todoapp-mern-capacitor.git](https://github.com/rsavnani18/todoapp-mern-capacitor.git)
   cd todoapp-mern-capacitor
   ```

2. **Install Dependencies**
   This repository uses `pnpm` in separate `backend/` and `frontend/` workspaces:
   ```bash
   cd backend && pnpm install
   cd ../frontend && pnpm install
   ```

3. **Configure Environment Files**
   Copy `.env.example` to `.env` inside both `backend/` and `frontend/`. Never commit real credentials or `.env` files.

---

## Code Standards & Pre-Commit Checks

Before opening a pull request, verify that formatting, linting, TypeScript compilation, and production builds pass without errors:

### Backend Checks (`cd backend`)
```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm build
```

### Frontend Checks (`cd frontend`)
```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm build
```

### UI & Native Rules
* **No External UI Frameworks:** Keep components built with clean TypeScript and Vanilla CSS variables (`--bg-app`, `--accent`, `--text-primary`) so both Dark and Light themes stay consistent.
* **Web Compatibility:** Wrap any new `@capacitor/*` plugin calls in `Capacitor.isNativePlatform()` checks inside `frontend/src/lib/native.ts` so browser deployments never break.
* **Mobile Zoom Lock:** Keep form inputs at `font-size: 16px` or higher to avoid mobile WebView auto-zoom on focus.

---

## Commit & Pull Request Guidelines

* Create a focused branch from `main` (e.g., `fix/notification-timezone` or `feat/task-due-filter`).
* Write clear, imperative commit messages:
  * `feat: add swipe-to-delete gesture on task cards`
  * `fix: cancel scheduled notification when due date is cleared`
  * `docs: update render environment variable instructions`
* Open a Pull Request describing **what changed**, **why it was needed**, and include screenshots or screen recordings if your change touches mobile UI or themes.
