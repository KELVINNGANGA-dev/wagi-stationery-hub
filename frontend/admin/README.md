# WAGI Admin Dashboard (Frontend)

This is the React + TypeScript + Vite + Tailwind based Admin Dashboard for WAGI - STATIONARIES. The dashboard connects to the Laravel backend via the API and authenticates using token-based Bearer auth returned by the existing /api/auth/login endpoint.

How to run
1. cd frontend/admin
2. npm install
3. Create a .env file (optional) and set VITE_API_BASE if your backend is not at http://127.0.0.1:8000
   VITE_API_BASE=http://127.0.0.1:8000
4. npm run dev

Notes
- The dashboard expects the backend auth endpoints and admin APIs to be available on the Laravel backend in the same database.
- Use the admin account seeded via the AdminUserSeeder (do not seed another admin).
- Product image uploads use the backend endpoint POST /api/admin/products/{id}/images and store images on the backend storage disk.
