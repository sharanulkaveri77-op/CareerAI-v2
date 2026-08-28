# CareerAI — Career Intelligence Platform (Frontend)

CareerAI is an AI-powered **career-intelligence web app** built as a final-year
B.E. Computer Science project. This repository contains the **frontend only**,
designed to connect to a separate Node/Express/MongoDB backend (built by a
teammate). It deliberately contains **no backend logic or database code** — only
`fetch`/axios calls to the REST endpoints described below.

## Tech Stack

- **React 18 + Vite** — fast dev server & build
- **React Router v6** — routing & route guarding
- **Tailwind CSS** — dark purple "AI SaaS" design system
- **lucide-react** — icons
- **recharts** — dashboard charts
- **axios** — API client (single configured instance in `src/api/client.js`)
- **react-hook-form** — all form handling & validation
- **Context API** (`AuthContext`) — logged-in user + JWT in `localStorage`

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure the backend URL (optional — defaults to http://localhost:5000/api)
cp .env.example .env
# edit .env and set VITE_API_URL if your backend runs elsewhere

# 3. Run the dev server
npm run dev
```

The app runs on http://localhost:5173 by default.

## Connecting to the Backend

All network calls go through `src/api/client.js`, which:

- sets `baseURL` from `import.meta.env.VITE_API_URL` (default
  `http://localhost:5000/api`),
- attaches the JWT from `localStorage["careerai_token"]` to every request via an
  axios interceptor,
- normalizes error messages from `error.response.data.message`.

Per-feature service modules live in `src/api/*` (e.g. `auth.js`, `dashboard.js`,
`skills.js`). They call the following endpoints (all under the base URL):

| Area        | Method & Path                                            |
| ----------- | ------------------------------------------------------- |
| Auth        | `POST /auth/student/signup`, `/auth/student/login`      |
|             | `POST /auth/admin/signup`, `/auth/admin/login`          |
| Dashboard   | `GET /dashboard/summary`, `GET /dashboard/trends`        |
| Advisor     | `POST /advisor/chat`                                     |
| Skills      | `GET /skills`, `POST /skills`, `POST /skills/analyze`    |
| Roles       | `GET /roles/search?q=`, `GET/POST/DELETE /roles/saved`  |
| Resume      | `POST /resume/analyze` (multipart/form-data)            |
| AI Interview| `POST /interview/ai/start`, `/answer`, `GET /summary`   |
| Live Rooms  | `POST /rooms/create`, `POST /rooms/join` (WebRTC via backend signaling) |
| Learning    | `GET /learning`                                          |
| Roadmap     | `POST /roadmap/generate`                                 |
| Admin       | `GET /admin/summary`, `/students`, `/interviews`,        |
|             | `/materials`, `/quizzes`, `/assignments`, `/performance` |

> Until the backend is running, every page degrades gracefully: it shows
> loading skeletons / empty states instead of hard-coded fake data.

## Project Structure

```
src/
  api/            # client.js (axios instance) + per-feature services
  components/     # Sidebar, TopBar, IconChip, StatCard, ProgressBar,
                  # Modal, MarketTrends, CareerHealth, Feedback, AppShell, guards
  context/        # AuthContext.jsx (token + user in localStorage)
  pages/          # Login, Dashboard, Advisor, Skills, Roles, Resume,
                  # Interview*, Learning, Roadmap, Admin
  App.jsx         # routes + guards
  main.jsx        # entry
  index.css       # Tailwind + design tokens
```

## Notes

- **Auth/guards:** `ProtectedRoute` (student pages) and `AdminRoute` (admin
  pages) check `AuthContext` and redirect to `/login` when no token is present.
- **Interview Live:** the client sets up `getUserMedia` for local camera/mic and
  renders the video tiles, in-call chat, and AI-coach panel. The actual WebRTC
  signaling is the backend's responsibility (`socket.io` / `simple-peer`).
- **No external images** are used — every illustration is a lucide icon or a
  Tailwind gradient blob, so the project has zero broken image links.
