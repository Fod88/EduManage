# EduManage — frontend

React 18 + Vite client for the EduManage school-management backend (Node, Express, MongoDB, JWT).

## Features
- **Admin:** dashboard KPIs and today's attendance breakdown; full CRUD for students, teachers, classes, subjects, teaching assignments; user management (name, email, role, status); attendance review and correction.
- **Teacher:** dashboard for their classes; student directory; own assignments; **Take attendance** (class → subject → students → present/late/absent → save); records limited to their assignments.
- **Student:** dashboard with student ID, class, status, attendance summary and history; profile.
- **Everyone:** profile page (name, email, password change with current-password check).
- Details dialogs for students and teachers, confirmation dialogs for every delete (backend refusals are shown in the dialog), toasts, skeleton/empty/error states, responsive layout (sidebar drawer and card-style tables on small screens).

## Run locally
**1. Backend** (`backend/`)
- `.env`: `MONGO_URL` (required), `JWT_SECRET` (required), `PORT` (optional, default 3000).
- MongoDB must run as a **replica set** (Atlas, or a local `--replSet` instance) — creating/deleting students and teachers uses transactions.
- `npm install && npm start`
- There is no registration. Create the first admin user directly in MongoDB (`role: "admin"`, bcrypt-hashed password); admins then create everyone else in the app.

**2. Frontend**
```
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `BACKEND_URL` | shell, dev only | Target of the `/api` dev proxy. Default `http://localhost:3000`. |
| `VITE_API_URL` | `.env`, build time | API base URL. Empty (default) = same-origin `/api`. |

## API connection
The client calls `/api/*`. In development Vite proxies `/api` to the backend and strips the prefix, so no CORS configuration is needed (the backend has no CORS middleware).
**Production:** serve `dist/` and reverse-proxy `/api` to the backend on the same origin (e.g. nginx `location /api/ { proxy_pass http://backend:3000/; }`). If you host the API on another origin instead, set `VITE_API_URL` and add CORS to the backend.

## Authentication and roles
- `POST /users/login` returns `{ user, token }`. The JWT is stored in `localStorage` (`edumanage_token`) and sent as `Authorization: Bearer`. A rejected token (401) signs the user out; network or server errors show a retry screen instead.
- Session restore: students → `GET /students/me`, teachers → `GET /teachers/me`, admins → `GET /users/:id` (id from the token).
- Route access mirrors the backend: students and teachers list/view students; teachers, classes, subjects and users are admin-only; assignments and attendance are admin + teacher. The backend remains the source of authorization.

## Project structure
`src/services/api.js` axios client, error mapping, helpers · `context/` auth and toasts · `components/ResourcePage.jsx` config-driven table/form/details/delete · `pages/resources.jsx` per-resource configuration · `pages/Attendance.jsx`, `Dashboard.jsx`, `Profile.jsx`, `Login.jsx` · `hooks/useMyAssignments.js` · `layouts/AppLayout.jsx`.

## Backend limitations (not changed; the UI works around them)
- `PATCH /classes/:id` accepts only `name` and `grade`, so class status is displayed but cannot be edited. Allowing `status` in `classController.updateClass` would enable it.
- `GET /attendance` and `GET /teachingAssignments` are not scoped by role. The UI requests only a student's own records and shows teachers only their own assignments and records, but the API itself does not enforce this.
- Deleting a class, subject, assignment or user is not blocked by related data (students/teachers and attendance are protected, see the delete dialogs).
- `GET /classes` and `GET /subjects` are admin-only, so teachers have no pages for them; their attendance dropdowns are built from their assignments.
- No pagination; JWTs do not expire.
