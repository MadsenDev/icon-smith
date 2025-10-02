# Contributing to IconSmith

Thanks for your interest in improving IconSmith! This project is intended to stay lightweight but polished. The following notes keep contributions focused and smooth.

## Getting Started

1. Fork the repo and create a feature branch:
   ```bash
   git checkout -b feature/short-description
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs on Vite (default port `5173`). The UI updates instantly as you edit files under `src/`.

## Development Guidelines

- Use TypeScript (`.ts` / `.tsx`) and Tailwind utility classes. Keep components small and composable.
- Run `npm run dev` while working so eslint/vite errors surface early.
- Prefer client-only solutions—avoid adding backend dependencies unless absolutely required.
- If a change affects the UI, include a short summary and (ideally) a screenshot in the PR description.

## Submitting Changes

1. Ensure the app builds without type or eslint errors.
2. Update docs when behaviour changes (README, CHANGELOG once it exists).
3. Commit with clear messages (`feat:`, `fix:`, etc. are welcome but not enforced).
4. Push your branch and open a pull request against `main`.
5. Be ready to iterate. Reviews aim to keep the UX polished and the bundle lean.

## Reporting Issues

- Use GitHub Issues with a concise summary, reproduction steps, and browser version.
- For security or privacy concerns, follow the instructions in `SECURITY.md`.

Thanks again for helping keep IconSmith sharp!

