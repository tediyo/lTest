# Production-Ready Authentication System

A full-stack authentication system built with **Next.js**, **NestJS**, and **Supabase Authentication**, demonstrating modern software engineering practices including clean architecture, unit testing, GitHub Actions CI, and Vercel deployment.

---

## Architecture

```
User → Next.js Login Page → NestJS API → Supabase Auth → JWT/Session → Frontend
```

The frontend **never** communicates directly with Supabase. All authentication logic is encapsulated in the NestJS backend.

---

## Project Structure

```
root/
├── apps/
│   ├── frontend/          # Next.js (App Router) application
│   │   ├── src/
│   │   │   ├── app/       # Next.js App Router pages
│   │   │   ├── components/# Reusable React components
│   │   │   ├── hooks/     # Custom React hooks
│   │   │   ├── services/  # API service layer
│   │   │   ├── types/     # TypeScript type definitions
│   │   │   ├── utils/     # Validation schemas
│   │   │   └── tests/     # Unit tests
│   │   └── ...
│   └── backend/           # NestJS application
│       ├── src/
│       │   ├── auth/
│       │   │   ├── controllers/
│       │   │   ├── dto/
│       │   │   ├── guards/
│       │   │   ├── interfaces/
│       │   │   ├── services/
│       │   │   └── tests/
│       │   ├── common/
│       │   │   ├── filters/
│       │   │   ├── interfaces/
│       │   │   ├── tests/
│       │   │   └── utils/
│       │   └── config/
│       └── ...
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI pipeline
└── README.md
```

---

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS   |
| Forms       | React Hook Form, Zod                   |
| HTTP        | Axios                                  |
| Backend     | NestJS, TypeScript                     |
| Auth        | Supabase Authentication                |
| Validation  | class-validator, class-transformer     |
| Testing FE  | Jest, React Testing Library            |
| Testing BE  | Jest, Supertest                        |
| CI/CD       | GitHub Actions                         |
| Deployment  | Vercel (frontend)                      |

---

## Setup & Installation

### Prerequisites

- Node.js >= 18
- npm >= 9
- A Supabase project (free tier works)

### 1. Clone the repository

```bash
git clone <repository-url>
cd auth-system
```

### 2. Install dependencies

```bash
# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

**Backend** — copy and fill in `apps/backend/.env.example`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=3001
```

**Frontend** — copy and fill in `apps/frontend/.env.example`:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Running Locally

### Backend

```bash
cd apps/backend
npm run start:dev
# Runs on http://localhost:3001
```

### Frontend

```bash
cd apps/frontend
npm run dev
# Runs on http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint       | Auth Required | Description              |
|--------|---------------|---------------|--------------------------|
| POST   | /auth/login   | No            | Login with email/password|
| POST   | /auth/logout  | Yes (Bearer)  | Logout user              |
| GET    | /auth/profile | Yes (Bearer)  | Get authenticated profile|

### Request/Response format

**POST /auth/login**

```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "user@example.com" },
    "tokens": { "accessToken": "..." }
  }
}

// Response 401
{ "success": false, "message": "Invalid email or password", "errors": [] }
```

---

## Running Tests

### Backend tests

```bash
cd apps/backend
npm run test           # Run tests
npm run test:cov       # Run tests with coverage report
```

### Frontend tests

```bash
cd apps/frontend
npm run test           # Run tests
npm run test:coverage  # Run tests with coverage report
```

### Coverage threshold

Both frontend and backend enforce **80% minimum coverage** on branches, functions, lines, and statements. Tests will fail if coverage drops below this threshold.

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request:

1. **Install dependencies** — `npm ci`
2. **Lint** — ESLint
3. **Type-check** — `tsc --noEmit`
4. **Build** — production build
5. **Test with coverage** — Jest with 80% threshold

**Branch protection rules** (configure in GitHub → Settings → Branches):

- Protect the `master` branch
- Require the `All Checks Passed` status check to pass before merging
- Require pull request reviews
- Disallow direct pushes to `master`

---

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the **Root Directory** to `apps/frontend`
3. Add the environment variable `NEXT_PUBLIC_API_URL` pointing to your backend
4. Vercel will automatically deploy on every push to `master`

Alternatively, use the Vercel CLI:

```bash
cd apps/frontend
npx vercel --prod
```

### Backend

Deploy to any Node.js hosting provider (Railway, Render, Fly.io, etc.):

```bash
cd apps/backend
npm run build
npm run start:prod
```

Set all required environment variables on the hosting platform.

---

## Environment Variables Reference

### Backend (`apps/backend/.env`)

| Variable                  | Description                        | Required |
|---------------------------|------------------------------------|----------|
| `SUPABASE_URL`            | Your Supabase project URL          | Yes      |
| `SUPABASE_ANON_KEY`       | Supabase public anon key           | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key        | Yes      |
| `JWT_SECRET`              | Secret for JWT signing (32+ chars) | Yes      |
| `PORT`                    | Server port (default: 3001)        | No       |

### Frontend (`apps/frontend/.env.local`)

| Variable               | Description                    | Required |
|------------------------|--------------------------------|----------|
| `NEXT_PUBLIC_API_URL`  | Backend API base URL           | Yes      |

---

## Security Notes

- Passwords are never logged
- All input is validated with `class-validator` (backend) and Zod (frontend)
- Supabase service role key is only used server-side, never exposed to the frontend
- Authentication tokens are stored in `sessionStorage` (cleared on tab close)
- CORS is configured to only allow the frontend origin
