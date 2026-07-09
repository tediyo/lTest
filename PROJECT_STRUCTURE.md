# Project Folder Structure

Full-stack authentication monorepo with a Next.js frontend and NestJS backend.

```
New Login Test/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI pipeline
├── apps/
│   ├── backend/                            # NestJS API
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── controllers/
│   │   │   │   │   └── auth.controller.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── register.dto.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt.guard.ts
│   │   │   │   ├── interfaces/
│   │   │   │   │   └── auth.interface.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── supabase.service.ts
│   │   │   │   └── tests/
│   │   │   │       ├── auth.controller.spec.ts
│   │   │   │       ├── auth.service.spec.ts
│   │   │   │       └── login.dto.spec.ts
│   │   │   ├── common/
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── interfaces/
│   │   │   │   │   └── response.interface.ts
│   │   │   │   ├── tests/
│   │   │   │   │   └── response.util.spec.ts
│   │   │   │   └── utils/
│   │   │   │       └── response.util.ts
│   │   │   ├── config/
│   │   │   │   └── app.config.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── jest.config.js
│   │
│   └── frontend/                           # Next.js 14 application
│       ├── src/
│       │   ├── __mocks__/
│       │   │   └── styleMock.js
│       │   ├── app/
│       │   │   ├── dashboard/
│       │   │   │   └── page.tsx
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── register/
│       │   │   │   └── page.tsx
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   ├── hooks/
│       │   │   └── useAuth.ts
│       │   ├── services/
│       │   │   └── auth.service.ts
│       │   ├── tests/
│       │   │   ├── LoginForm.test.tsx
│       │   │   └── RegisterForm.test.tsx
│       │   ├── types/
│       │   │   └── auth.types.ts
│       │   ├── utils/
│       │   │   └── validation.ts
│       │   └── globals.css
│       ├── package.json
│       ├── jest.config.js
│       ├── jest.setup.ts
│       └── INTENTIONAL_FAILURE.md
│
├── .gitignore
├── .gitattributes
├── package.json                            # Root workspace manifest
├── package-lock.json
├── README.md
└── sonar-project.properties
```

## Generated / Ignored Folders

These are created automatically during builds, tests, or CI and are usually excluded from version control:

- `apps/backend/dist/` — compiled NestJS output
- `apps/backend/coverage/` — Jest coverage reports
- `apps/frontend/coverage/` — Jest coverage reports
- `apps/frontend/reports/` — HTML test reports
- `node_modules/` — dependency folders (root + apps)

## Key Entry Points

| Layer | File | Purpose |
|---|---|---|
| Frontend app | `apps/frontend/src/app/login/page.tsx` | Login page |
| Frontend app | `apps/frontend/src/app/register/page.tsx` | Register page |
| Frontend app | `apps/frontend/src/app/dashboard/page.tsx` | Protected dashboard |
| Frontend logic | `apps/frontend/src/hooks/useAuth.ts` | Auth state + API calls |
| Frontend UI | `apps/frontend/src/components/LoginForm.tsx` | Reusable login form |
| Backend API | `apps/backend/src/auth/controllers/auth.controller.ts` | HTTP routes |
| Backend logic | `apps/backend/src/auth/services/auth.service.ts` | Login / register logic |
| Backend config | `apps/backend/src/auth/services/supabase.service.ts` | Supabase client wrapper |
