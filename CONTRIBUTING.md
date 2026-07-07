# Contributing

Thanks for your interest in contributing! This document explains the workflow
and the automated gates your change will pass through.

## Development setup

```bash
npm ci                 # install exact locked dependencies
npm run dev            # start the dev server
npm run lint           # ESLint
npm run test           # unit tests (Jest)
npm run test:coverage  # unit tests + coverage report
npm run test:e2e       # Playwright end-to-end tests
```

Requires Node.js 24 (matches CI).

## Branching model

Branch off `main` using a typed prefix — these map to the CI/CD pipeline:

| Prefix     | Use for                 |
| ---------- | ----------------------- |
| `feature/` | New functionality       |
| `bugfix/`  | Non-urgent fixes        |
| `hotfix/`  | Urgent production fixes |

## Pull request flow

1. Open a PR targeting `main`.
2. **PR Validation** runs automatically: workflow lint, unit tests + coverage,
   ESLint, dependency review, Trivy filesystem scan, CodeQL, and a Docker
   build check. All must pass.
3. At least one approving review is required (see [CODEOWNERS](.github/CODEOWNERS)).
4. Once merged, **Main Release** builds, scans, signs, and deploys the image to
   the `dev` environment automatically. Promotion to `qa` and `prod` is manual
   and gated.

## Commit messages

Use clear, conventional-style messages where practical
(`feat:`, `fix:`, `chore:`, `docs:`, `ci:`). This keeps history readable and
release notes meaningful.

## Reporting bugs / requesting features

Use the issue templates under **Issues → New issue**. For security issues, see
[SECURITY.md](./SECURITY.md) — do **not** file a public issue.
