# Stay Connected – Backend

Node.js API for contact form (Supabase) and admin login.

## Setup

1. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In **SQL Editor**, run the contents of `supabase-schema.sql` to create the `contact_queries` table.
   - In **Settings → API** copy:
     - Project URL → `SUPABASE_URL`
     - anon public key → `SUPABASE_ANON_KEY`

2. **Env**
   - Copy `backend/.env.example` to `backend/.env`.
   - Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `JWT_SECRET` (use a long random string in production).

3. **Install and run**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs at `http://localhost:3000`. The frontend (Vite) proxies `/api` to this port.

## Admin login

- **Email:** `aqib@stay-connected.com`
- **Password:** `Admin@123`

Use these on the `/admin` page.
