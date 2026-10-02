# Contributing to the School Website

Thank you for helping improve the school website and CMS. Keep changes focused, tested, and safe for school data.

## Development workflow

1. Follow the local setup steps in [README.md](README.md).
2. Create a focused branch from `main`, such as `fix/admissions-validation` or `docs/setup-guide`.
3. Keep frontend and backend changes aligned when an API contract changes.

## Before opening a pull request

Run the checks relevant to your change:

```bash
npm run lint
npm test
npm run build
```

For PHP changes, ensure the edited files pass PHP syntax validation in the target hosting environment.

## Pull requests

- Explain the change and the problem it solves.
- Include test steps and screenshots for visual changes when appropriate.
- Document any database migration, configuration, or deployment requirement.
- Keep migrations additive and review access-control changes carefully.

## Security and privacy

Never commit `.env` files, credentials, recovery keys, student records, uploaded documents, or production database exports. Report security issues privately to the project maintainer instead of opening a public issue.
