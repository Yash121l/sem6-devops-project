# Architecture

## Overview

This repository is split into two deployable applications:

- `client/`: React + Vite storefront UI.
- `server/`: NestJS backend with modular domain layers.

## Frontend

- `src/components/`: reusable UI and domain components.
- `src/pages/`: route-level screens.
- `src/context/`: cart, wishlist, and auth state.
- `src/hooks/`: API-backed data hooks with demo fallback behavior.
- `src/lib/`: shared utilities, storefront adapters, and safe storage helpers.

The storefront now loads catalog data through an API adapter layer in `client/src/lib/storefront.js`. If the backend is unavailable, the UI falls back to curated demo data instead of breaking.

## Backend

- `src/modules/`: feature modules such as categories, products, auth, cart, and orders.
- `src/common/`: shared guards, decorators, interceptors, entities, and utilities.
- `src/config/`: centralized application configuration.
- `test/`: server unit, integration, and e2e tests.

The server follows NestJS module boundaries: controller -> service -> repository/entity.

## DevOps

See [DevOps guide](./devops.md) for CI/CD, AWS, Kubernetes, and how the client reaches the API in each environment.

## Quality gates

- ESLint on both client and server.
- Vitest for frontend unit/integration tests.
- MSW for frontend API mocking in both Vitest and browser E2E runs.
- Jest for backend unit/integration tests.
- Playwright for frontend E2E coverage.
- GitHub Actions for push and pull request validation.
