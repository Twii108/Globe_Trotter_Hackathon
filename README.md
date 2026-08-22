# GlobeTrotter

A full-stack travel planning application.

## Packaging and Sharing Note
When sharing or zipping this project for submission, **DO NOT** include the following generated files and folders:
- `node_modules/` (in both `frontend/` and `backend/`)
- `dist/` or `build/` (in `frontend/`)
- `.env` files (keep your secrets safe!)

These are excluded in `.gitignore` by default. Anyone running the project should run `npm install` inside both the `frontend` and `backend` directories to regenerate them.

## Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment Risk Check
The backend currently uses `sqlite3`. SQLite stores data in a local file (`globetrotter.db`).
- **Render.com / Railway**: You MUST configure a **Persistent Disk** (volume) and point the database file there; otherwise, your data will reset on every deploy.
- **Vercel**: Vercel Serverless Functions have an ephemeral filesystem. SQLite will **NOT** persist data across requests. It is highly recommended to migrate to a managed database (like Supabase PostgreSQL or Turso SQLite) if you are deploying to Vercel. 
Additionally, `sqlite3` (and `better-sqlite3`) relies on native node-gyp bindings which can sometimes fail to compile on serverless platforms. For a hackathon, deploying to Render with a persistent disk or a VPS is the safest path.
