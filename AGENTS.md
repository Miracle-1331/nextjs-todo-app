# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Next.js 16 (React 19) full-stack todo application. It is the reference workload for the extreme-lab platform, deployed to dev/qa/prod via ArgoCD using the `centralized-helm-chart/nextjs-todo-app` Helm chart and GitOps pipelines.

## Development

```bash
npm install
npm run dev        # http://localhost:3000 — uses in-memory store (no DB needed)

# With Postgres:
docker compose up  # starts postgres, runs flyway migrations, then the app
```

No `DATABASE_URL` → in-memory Map store. Set `DATABASE_URL=postgresql://...` → Postgres via `pg` pool.

## Testing

```bash
npm test                          # Jest unit tests (node env)
npm run test:coverage             # with lcov coverage report
npm run test:watch                # watch mode

# Integration tests (requires docker compose):
docker compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit

# E2E (Playwright, Chromium only):
npm run test:e2e                  # starts dev server automatically
SKIP_DEV_SERVER=1 npm run test:e2e  # when server already running (e.g. against QA)
npm run test:e2e:ui               # interactive Playwright UI
```

E2E tests call `DELETE /api/e2e-reset` in `beforeEach`. This endpoint only responds when `ALLOW_E2E_RESET=true` is set — never expose this in production.

## Dual-store architecture

All API routes select storage at runtime:

```
DATABASE_URL set → src/lib/todos-repo.ts (Postgres via pg Pool)
                 → src/lib/store.ts     (in-memory Map, fallback)
```

`src/lib/db.ts` holds the singleton Pool and `initDb()` (called on cold start). `src/app/api/health/route.ts` reports `db: "postgres" | "memory"`.

## Database schema

Single migration: `migrations/V1__create_todos.sql`

```sql
CREATE TABLE todos (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX todos_completed_idx ON todos(completed);
```

Flyway manages migrations in CI/CD via the `db-migrate-job` Helm hook. For local dev, `docker compose up` runs flyway automatically.

## Docker / build

```bash
docker build -t todo-app .
# 3-stage build: deps (npm ci) → builder (next build) → runner (node:24-slim, standalone)
# Output: .next/standalone/server.js, runs as node user (UID 1000)
```

The `next.config.ts` sets `output: "standalone"`. The image is deployed by digest in production — `image.tag` is for reference only.

## CI/CD pipeline overview

Four GitHub Actions workflows form a sequential promotion gate:

| Workflow | Trigger | Key steps |
|---|---|---|
| `pr-validation.yml` | `workflow_dispatch` (push to main branches, cost-saving) | Jest + lint + SonarQube scan + Trivy FS + docker build check |
| `main-release.yml` | push to `main` | ECR push (sha + latest) → Trivy image scan → SBOM (CycloneDX) → DependencyTrack → Cosign sign+attest → GitOps release metadata → update dev values → ArgoCD sync dev → ZAP DAST |
| `promote-qa.yml` | `workflow_dispatch` (input: `image_digest`) | Validates dev deployed+validated → update QA values PR → ArgoCD sync QA → Playwright E2E → ZAP full scan |
| `promote-prod.yml` | `workflow_dispatch` (input: `image_digest`) | GitHub Environment `prod` reviewers → validates QA deployed+validated → CODEOWNERS PR → ArgoCD sync prod → Slack notification |

All workflows authenticate to Vault via JWT (`github-actions` path, role `gha-agent-ci`) through Cloudflare Access (`CF_ACCESS_CLIENT_ID` + `CF_ACCESS_CLIENT_SECRET` secrets). AWS ECR access uses GitHub Actions OIDC (role in `terraform/aws-identity/`).

Release metadata is tracked in the platform repo at `releases/nextjs-todo-app/<safe-digest>.yaml` with `dev/qa/prod.deployed` and `dev/qa/prod.validated` flags. Promotion workflows validate these flags before proceeding.

## Linting

```bash
npm run lint   # ESLint (eslint.config.mjs, Next.js rules)
```

## SonarQube

`sonar-project.properties`: `projectKey=nextjs-todo-app`, sources `src/`, excludes `__tests__/`, coverage from `coverage/lcov.info`. Quality Gate is blocking in CI.

## Image registry

ECR: `637423223528.dkr.ecr.ap-southeast-1.amazonaws.com/extreme-lab/todo-app`

Always deployed by digest. Cosign signing key: `awskms:///alias/extreme-lab-dev-cosign`.
