# ToDoApp Backend — Express, TypeScript & MongoDB REST API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

Production-ready REST API powering **ToDoApp**, built with **Node.js**, **Express**, **TypeScript**, and **Mongoose**. Configured for reverse-proxy hosting on **Render** and cross-origin requests from both web clients and **Capacitor** mobile WebViews.

---

## Production Hardening

* **Reverse-Proxy Awareness:** Configures `app.set('trust proxy', 1)` so `express-rate-limit` accurately identifies client IPs behind Render's load balancer.
* **Tiered Rate Limiting:** Applies a 200-request/15-min limiter across `/api` and a stricter 25-request/15-min limiter on `/api/auth` to mitigate credential stuffing.
* **Capacitor-Ready CORS:** Parses comma-separated origins from `CLIENT_URL` while whitelisting `https://localhost`, `capacitor://localhost`, and `http://localhost` for native mobile builds.
* **Graceful Shutdown:** Listens for `SIGTERM`, `SIGINT`, and `unhandledRejection` to drain active HTTP connections and close the Mongoose connection cleanly during container redeploys.

---

## Environment Variables

Create `backend/.env` using the template below:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/todoapp
JWT_ACCESS_SECRET=replace_with_strong_random_secret
CLIENT_URL=http://localhost:5173
```

In production on Render, pass comma-separated domains to `CLIENT_URL` if serving multiple web origins (e.g., `https://your-app.vercel.app,https://custom-domain.com`).

---

## API Endpoints

### Health Check
* `GET /api/health` — Returns server uptime status, active environment, and ISO timestamp.

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Creates a new user account and returns a signed JWT.
* `POST /api/auth/login` — Authenticates credentials and issues a session token.
* `GET /api/auth/me` — Returns the authenticated user's profile.
* `PATCH /api/auth/change-password` — Updates the user's password after verifying current credentials.
* `POST /api/auth/logout` — Clears active session cookies.

### Tasks (`/api/todos`) — *Requires `Authorization: Bearer <token>`*
* `GET /api/todos` — Lists user tasks with optional `?completed=true|false` and `?search=<query>` filters.
* `POST /api/todos` — Creates a task with `title`, `description`, `priority` (`low` | `medium` | `high`), and optional ISO `dueDate`.
* `PATCH /api/todos/:id` — Updates task fields or completion status.
* `DELETE /api/todos/:id` — Permanently deletes a task owned by the authenticated user.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Runs the TypeScript server with live reload |
| `pnpm build` | Compiles `src/` into production JavaScript inside `dist/` |
| `pnpm start` | Runs the compiled production server (`node dist/server.js`) |
| `pnpm lint` | Checks code quality with ESLint |
| `pnpm typecheck` | Runs `tsc --noEmit` to validate TypeScript types |
| `pnpm format` | Formats source files using Prettier |
