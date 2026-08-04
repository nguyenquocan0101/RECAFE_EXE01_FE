# Agent Instructions: RE:CAFE Frontend

## Scope

This repository is the RE:CAFE React storefront and Admin UI. It owns product browsing, product details, customization, cart, checkout, payment initiation, order history, profile, reviews, localization, and administrative screens.

The companion backend is at `W:\DevPool\EXE02_Backend_RE-CAFE`. Treat the backend API and `latest_swagger.json` as the contract source. Coordinate any breaking request or response change with the backend project.

## Read First

- `README.md` for routes, API behavior, local setup, and verification.
- `DESIGN.md` before changing any visual surface.
- `src/App.tsx` before changing routes or protected boundaries.
- The relevant context, service, component, page, and locale files before introducing a new abstraction.
- `latest_swagger.json` or `swagger.json` when changing API calls.

## Stack and Structure

- React 18, TypeScript, Vite, Tailwind CSS v4, React Router, Framer Motion, and React Three Fiber.
- `src/services/` contains API clients and service helpers.
- `src/components/` contains shared and feature UI.
- `src/context/` contains auth, cart, language, and toast state.
- `src/layouts/` contains storefront and Admin shells.
- `src/pages/` contains routed screens.
- `src/locales/` contains Vietnamese and English copy.
- `src/styles/` contains shared visual tokens and global styles.

## Implementation Rules

- Follow the existing TypeScript and component patterns. Avoid adding a second API client, state layer, modal, button, or toast primitive when a shared one exists.
- Keep API calls in the existing service layer and handle loading, empty, error, success, and disabled states explicitly.
- Preserve authentication, role guards, cart behavior, checkout semantics, and review eligibility rules.
- Keep Vietnamese and English locale files in sync. Do not hardcode user-facing copy in only one locale.
- Preserve responsive behavior at 390px and desktop widths. Keep keyboard focus visible and interactive targets at least 44px where practical.
- Use the design tokens and shared components described in `DESIGN.md`; do not introduce unrelated colors, gradients, or visual systems.
- Keep 3D work bounded and performant. Handle loading, missing model, render failure, and reduced-motion cases.
- Do not commit `.env.local`, tokens, API keys, payment credentials, or generated build output.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

The Vite `/api` proxy targets the configured backend in `vite.config.ts`. Use the existing environment convention when overriding the API host.

## Verification Checklist

- Run `npm run build` after frontend changes.
- Test the affected route in both authenticated and unauthenticated states when relevant.
- Check loading, empty, error, success, disabled, and permission-denied states.
- Check 390px mobile and desktop layouts, keyboard navigation, modal focus, and text expansion in both locales.
- For API changes, verify request payloads, response mapping, HTTP error handling, and compatibility with the backend contract.
- Review `git diff` and `git diff --check` before finishing. Keep unrelated working-tree changes intact.
