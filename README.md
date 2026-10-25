# TomWhiteUieSignupForm

A responsive customer sign-up form web application built with Angular 22, featuring an extensible schema-driven architecture, accessible UI primitives, signal-based state management, and an in-memory mock API.

## Quickstart

```bash
npm install
npm start        # Launches dev server at http://localhost:4200
npm test         # Runs Vitest unit tests
```

## Architectural Decisions

### Framework & Runtime

- **Angular 22 (Client-Side SPA)**: Built with standalone components and fine-grained Signals reactivity.
- **Tailwind CSS v4**: Utility-first styling with modern design tokens, fluid typography, and consistent focus-visible treatments.
- **TypeScript Path Aliasing (`@shared/*`)**: Configured path mapping targeting `src/app/shared/*` to eliminate brittle relative imports and treat UI primitives as decoupled shared modules.
- **Lazy-Loaded Feature Routing**: Feature view loaded via dynamic `loadComponent` import alongside a `**` wildcard redirect, demonstrating modular code-splitting and performance best practices.

### Component Architecture & Design System

- **Atomic UI Primitives**: Reusable presentational components (`<app-form-field>`, `<app-button>`) separated from business logic, structured for design system or micro-frontend reusability.
- **Design System Tokens & Base Typography**: Tailwind v4 theme proxies built-in palette variables to semantic brand tokens (`--color-brand-primary`, `--color-surface-*`), paired with `@layer base` typography defaults and reusable utility classes (`.ds-card`, `.ds-input`, `.ds-focus-ring`) to avoid class duplication.
- **Externalized Templates & Styles**: Component HTML templates are separated into dedicated companion files (`*.component.html`), alongside scoped style sheets when styling is required, for clean separation of concerns.
- **Accessibility by Default (WCAG 2.1 AA)**: Explicit label-to-input associations, dynamic `aria-invalid` / `aria-describedby` wiring, live regions (`role="alert"`, `aria-live="polite"`), and automated focus management to the first invalid field on error.

### Form Architecture & Extensibility

- **Schema-Driven Form Structure**: Form controls configured via modular field definitions (`FieldConfig[]`), allowing future questions to be added without modifying page templates or core layout code.
- **Typed Reactive Validation**: Strongly typed controls enforcing validation rules (trimmed name lengths, RFC-compliant email formatting) alongside real-time error feedback.

### State Management

- **NgRx SignalStore (`@ngrx/signals`)**: Lightweight, signal-first store encapsulating submission lifecycle (`idle`, `submitting`, `success`, `error`) and derived selectors.
- **Double-Submit Prevention**: Submission stream handled via `rxMethod` with `exhaustMap` to strictly ignore duplicate clicks while an HTTP request is in-flight.

### Mock API Strategy

- **Zero-Dependency `HttpInterceptorFn`**: Client-side interceptor routing `POST /api/signup` to a simulated 200 OK response with artificial network latency (600ms), eliminating port collisions and external server prerequisites.

### Quality & Testing

- **CDK Component Test Harnesses (`@angular/cdk/testing`)**: Custom test harnesses (`ComponentHarness`) built for UI primitives, decoupling test suites from DOM structure and providing robust, reusable testing APIs across unit and integration tests.
- **Role-Based Testing**: Unit tests queried via accessible roles (`getByRole`, `getByLabelText`) rather than fragile CSS classes or component internals.
- **Automated Accessibility Auditing**: Automated `axe-core` checks to verify zero WCAG AA violations across idle, error, and success states.
- **Continuous Integration (GitHub Actions)**: Automated pipeline executing linting, Vitest unit suites, and Playwright end-to-end test journeys on every push to main and on every pull request push.

## Development & Build Commands

- `npm start`: Start local development server on `http://localhost:4200/`
- `npm run build`: Compile production artifacts to `dist/`
- `npm test`: Execute unit test suite via Vitest
