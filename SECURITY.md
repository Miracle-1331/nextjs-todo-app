# Security Policy

## Supported Versions

This project follows a rolling release from `main`. Only the latest released
image digest (as promoted through the dev → qa → prod pipeline) is supported
with security fixes.

| Version       | Supported          |
| ------------- | ------------------ |
| Latest `main` | :white_check_mark: |
| Older commits | :x:                |

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately through GitHub's
[Private vulnerability reporting](https://github.com/Miracle-1331/nextjs-todo-app/security/advisories/new)
(Security tab → "Report a vulnerability"). This creates a confidential
advisory visible only to maintainers.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept if possible)
- Affected component / endpoint / dependency
- Any suggested remediation

### What to expect

- **Acknowledgement** within 3 business days.
- An initial assessment and severity rating within 7 business days.
- Coordinated disclosure: we will agree on a timeline before any public
  disclosure and credit you in the advisory unless you prefer to remain
  anonymous.

## Security tooling in this repository

This project runs an automated security pipeline. Findings from these tools
feed the **Security** tab (code scanning) and block merges/releases:

- **CodeQL** — static analysis (SAST) for JavaScript/TypeScript.
- **Trivy** — dependency, secret, IaC, and container image scanning.
- **OWASP ZAP** — dynamic analysis (DAST) against deployed environments.
- **Dependabot** — dependency and GitHub Actions update PRs + security alerts.
- **Cosign** — container images are signed and shipped with a signed SBOM
  attestation.
- **OpenSSF Scorecard** — supply-chain posture monitoring.
