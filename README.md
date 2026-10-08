# Launchpad Internship Portal

A full-stack internship marketplace built with React, Vite, Express, MongoDB and Mongoose. The app includes JWT-authenticated candidate/employer accounts, internship search and management, applications, saved roles, resume upload, contact messages, and a protected admin workspace.

## Requirements

- Node.js 20 or newer
- MongoDB 6 or newer (local MongoDB or MongoDB Atlas)
- npm

## Local setup

1. Create a MongoDB Atlas database (or local MongoDB) and copy `backend/.env.example` to `backend/.env`. Replace every example placeholder. Set `MONGODB_URI`, a unique random `JWT_SECRET` of at least 32 characters, the frontend `CLIENT_URL`, and initial admin credentials. The API loads `backend/.env` from its own location, independent of the shell's current directory.
2. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.
3. Install and run the API:

   ```powershell
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

4. In a second terminal, install and run the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). API health check: `http://localhost:5000/api/health`.

`npm run seed` creates six sample internships and, when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the initial admin account. The sample employer identity is internal to seeded postings; register an employer account to manage your own listings. Never use the example admin password in a deployed environment.

For MongoDB Atlas, allow the deployment/server IP in Atlas Network Access and use a database user with access limited to this database. For resume storage, local development uses private authenticated downloads from `backend/uploads`. To use Cloudinary, set all three of `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`; uploads use authenticated raw assets and short-lived signed download URLs. Leave all three empty to use local storage. Do not commit `.env` or place real credentials in `.env.example`.

## Production builds

```powershell
cd frontend
npm run build
```

Set production values for `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `PORT`, and `VITE_API_URL`. For local resume uploads in production, mount persistent private storage at `backend/uploads`; alternatively configure Cloudinary as described above. The API only serves resumes through authenticated, authorized downloads.

## API outline

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/internships` (search, category, location, duration, type, sorting and pagination); `GET /api/internships/featured`
- `POST/PATCH/DELETE /api/internships` (employers manage their own listings)
- `POST /api/applications/:internshipId`, `GET /api/applications/mine`, employer applicant and status endpoints
- `GET/PUT /api/saved`, `PATCH /api/users/me`, `POST /api/users/me/resume`
- `POST /api/contact`
- `/api/admin/*` for protected dashboard statistics and administration

All protected API routes accept `Authorization: Bearer <JWT>`. Public registration permits candidate and employer roles; admin accounts are provisioned out of band with the seed script and environment variables.
