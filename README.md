# WAGI - STATIONARIES

This repository contains the WAGI - STATIONARIES e-commerce platform. Work is being delivered incrementally on the branch `feature/complete-wagi-backend`.

This commit adds the initial backend design, database schema, API endpoints, and image upload flow so you can upload official product photos later through the Admin Dashboard without providing external credentials.

What's included in this update
- Database schema (sql/wagi_store_schema.sql)
- Backend .env.example (backend/.env.example) and setup guide (backend/README.md)
- Laravel-style API route stubs (backend/routes/api.php)
- Eloquent model stubs for Product and ProductImage
- ProductController with an image upload endpoint that stores images locally (storage/app/public) when Cloudinary is not configured
- Admin React component (frontend/admin/src/components/ProductImageUpload.tsx) to upload images via multipart/form-data
- OpenAPI spec (openapi/openapi.yaml) describing key endpoints

Important
- No secrets or API keys are included. The image upload endpoint uses local storage by default. Later you can configure Cloudinary or another provider in .env and the code will be straightforward to extend.

Next steps
- Run backend/README.md to scaffold the Laravel app locally (composer create-project or composer install if you already initialized Laravel), add these files to the Laravel app, run migrations, and create the storage symlink.
- Start implementing the remaining controllers and admin dashboard pages; I will continue implementing full features next.
