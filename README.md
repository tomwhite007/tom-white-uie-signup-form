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
- **TypeScript Path Aliasing (`@shared/*`, `@core/*`)**: Configured path mapping targeting `src/app/shared/*` and `src/app/core/*` to eliminate brittle relative imports and treat UI primitives and core services as decoupled modules.
- **Lazy-Loaded Feature Routing**: Feature view loaded via dynamic `loadComponent` import alongside a `**` wildcard redirect, demonstrating modular code-splitting and performance best practices.

### Component Architecture & Design System

- **Atomic UI Primitives**: Reusable presentational components (`<app-text-input>`, `<app-form-field>`, `<app-field-error>`, `<app-button>`, `<app-spinner>`) separated from business logic, structured for design system or micro-frontend reusability.
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

## Documentation & Implementation Notes

### 1. Angular 22 Idioms & Signal Forms (`FormValueControl`) vs. Reactive Forms (`ControlValueAccessor`)

This project is built on **Angular 22**, taking advantage of several modern framework defaults and APIs:
- **Implicit Standalone & `OnPush`**: In Angular 20+, `standalone: true` is the default, and in Angular 22+, `ChangeDetectionStrategy.OnPush` is the default. Decorators intentionally omit both properties to stay idiomatic.
- **`@Service()` Decorator**: Singleton services (such as [`SignUpApiService`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/core/api/sign-up-api.service.ts)) use Angular 22's `@Service()` decorator from `@angular/core` in place of `@Injectable({ providedIn: 'root' })`.
- **Signal Forms (`@angular/forms/signals`)**: New forms in Angular 22 use Signal Forms, which provide fine-grained signal state, type-safe `FieldTree` access, and schema-based validation (`schema()`, `required()`, `email()`, `validate()`).

#### Custom Design System Controls: `FormValueControl<T>` vs. `ControlValueAccessor`

In Angular 22 Signal Forms, [`TextInputComponent`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/shared/ui/text-input/text-input.component.ts) implements the **`FormValueControl<string>`** interface from `@angular/forms/signals`. When `[formField]` is applied directly to `<app-text-input>`, Signal Forms automatically binds the component's `value = model<string>('')` and synchronizes `disabled`, `required`, `touched`, `invalid`, `errors`, `name`, `touch`, and `focus()`.

In a wider enterprise Design System that also supports legacy or `ReactiveFormsModule` (`FormControl` / `FormGroup`) consumers, a shared input primitive would additionally (or alternatively) implement Angular's classic **`ControlValueAccessor`** interface (`NG_VALUE_ACCESSOR`):

```typescript
import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-legacy-text-input',
  templateUrl: './legacy-text-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LegacyTextInputComponent),
      multi: true,
    },
  ],
})
export class LegacyTextInputComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly label = input.required<string>();

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value;
    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
```

### 2. Signal Forms Encapsulation in `SignUpStore` & Component-Scoped Lifecycle

Rather than scattering form state across component classes, the Signal Form instance and its validation schema are created in [`sign-up.form.ts`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/features/sign-up/store/sign-up.form.ts) (`createSignUpForm()`) and composed directly into [`SignUpStore`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/features/sign-up/store/sign-up.store.ts) via `withProps(() => ({ ...createSignUpForm() }))`:
- **Component-Scoped Store**: `SignUpStore` is provided in [`SignUpPageComponent`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/features/sign-up/sign-up-page.component.ts)'s `providers: [SignUpStore]` array rather than `providedIn: 'root'`, tying the store's lifecycle strictly to the sign-up page.
- **Encapsulated Submission Pipeline**: The internal `rxMethod<SignUpPayload>` stream is kept private inside `withMethods`, exposing only `submitForm()` and `reset()`. Calling `submitForm()` marks all fields touched, checks form validity, focuses the first invalid control via `focusBoundControl()` if invalid, and automatically resets the form upon receiving a `200 OK` response.
- **Direct Business Logic Unit Testing**: Because the store owns the form and validation rules, all validation and submission rules are unit-tested directly against `SignUpStore` in [`sign-up.store.spec.ts`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/features/sign-up/store/sign-up.store.spec.ts) without needing to mount a DOM template.

### 3. Extending the Sign-Up Form with Additional Questions

To support adding future marketing or customer profile questions without modifying page or form templates, all field definitions and validation rules are centralized in [`sign-up.schema.ts`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/features/sign-up/store/sign-up.schema.ts):
1. Add the new property key (for example, `companyName` or `phoneNumber`) to `SignUpFormModel` and `INITIAL_SIGN_UP_MODEL` (plus `SignUpPayload` in [`sign-up.models.ts`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/core/api/sign-up.models.ts)).
2. Append a new `FieldConfig` entry to `SIGN_UP_FIELD_CONFIGS`—for example, a telephone question with `key: 'phoneNumber'`, `id: 'sign-up-phone'`, `label: 'Phone number'`, `type: 'tel'`, `autocomplete: 'tel'`, `placeholder: 'e.g. +44 7700 900077'`, `required: false`, and `helperText: 'Optional — for SMS service alerts.'`.
3. Register any validation rules on `path.phoneNumber` inside `signUpValidationSchema`. [`SignUpFormComponent`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/features/sign-up/components/sign-up-form/sign-up-form.component.ts) automatically renders the new `<app-text-input>` via its `@for (fieldConfig of fields(); track fieldConfig.key)` loop, and `focusFirstInvalidField()` automatically includes it in keyboard focus order.

### 4. Atomic UI Decomposition & 3-Tier Error Resolution Utility

The `@shared/ui` layer is decomposed into focused, single-responsibility primitives:
- [`<app-text-input>`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/shared/ui/text-input/text-input.component.ts): Signal Forms custom control (`FormValueControl<string>`) encapsulating the `<input>`, `aria-invalid`, `aria-required`, `aria-describedby`, and programmatic `focus()` delegation.
- [`<app-form-field>`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/shared/ui/form-field/form-field.component.ts): Pure layout wrapper rendering the `<label>`, required asterisk, optional helper text, projected control slot, and `<app-field-error>`.
- [`<app-field-error>`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/shared/ui/field-error/field-error.component.ts): Accessible inline alert (`role="alert"`, `aria-live="polite"`) with an inline SVG error icon.
- [`<app-button>`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/shared/ui/button/button.component.ts) & [`<app-spinner>`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/shared/ui/spinner/spinner.component.ts): Accessible button primitive supporting `primary` and `secondary` variants, `[loading]` state (`aria-busy="true"`), and full-width responsive sizing.
- **3-Tier Error Resolution ([`resolveFieldErrorMessage`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/shared/utils/form-error.util.ts))**: Resolves validation errors in priority order:
  1. Explicit `error.message` provided on the Signal Forms validator rule.
  2. Field-level custom message overrides (`FieldConfig.errorMessages[kind]`).
  3. Shared Design System default fallback messages by error `kind` (`required`, `email`, `minLength`, `maxLength`, `pattern`).

### 5. GDPR & Marketing Data-Privacy Transparency

Because the sign-up form collects personal contact details (`firstName`, `lastName`, `email`) to share marketing content and product updates, [`sign-up-form.component.html`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/features/sign-up/components/sign-up-form/sign-up-form.component.html) includes an explicit GDPR transparency notice directly above the submit action informing users how their data will be used and that they can unsubscribe at any time.

### 6. Configurable `MOCK_API_CONFIG` Token for Unit & Playwright E2E Testing

[`mockApiInterceptor`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/app/core/api/mock-api.interceptor.ts) is controlled via the `MOCK_API_CONFIG` `InjectionToken` (`{ enabled: boolean; delayMs: number }`):
- **Default Development / Production Demo**: Enabled by default (`enabled: true`, `delayMs: 600`), returning a simulated `200 OK` response without requiring a backend process.
- **Unit & Integration Tests**: Tests can override `MOCK_API_CONFIG` with `{ enabled: true, delayMs: 0 }` for instant responses or `{ enabled: false, delayMs: 0 }` to let requests pass through to Angular's `HttpTestingController`.
- **Playwright E2E Network Interception**: When `window.__DISABLE_MOCK_API__ = true` (via `page.addInitScript`) or `?disableMockApi` is present in the URL, `MOCK_API_CONFIG` automatically sets `enabled: false`. This allows [`e2e/signup.spec.ts`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/e2e/signup.spec.ts) to intercept real browser `POST /api/signup` network requests using Playwright's `page.route()`, assert on the outgoing JSON payload, and test both `200 OK` and `500 Internal Server Error` responses.

### 7. Tailwind CSS v4 Semantic Token Proxying & Category-Prefixed Naming

In [`src/styles.css`](file:///Users/tomwhite/Development/MyProjects/tom-white-uie-signup-form/src/styles.css), the `@theme` block proxies Tailwind v4's built-in palette CSS variables (e.g., `var(--color-sky-700)`, `var(--color-slate-900)`, `var(--color-rose-600)`) into semantic design tokens (`--color-brand-primary`, `--color-text-heading`, `--color-border-default`, `--color-status-error`).

Tokens are intentionally prefixed by their semantic category (`text-*`, `surface-*`, `border-*`, `status-*`). This produces utility classes such as `text-text-heading`, `border-border-default`, and `bg-surface-card`. While slightly verbose, this naming is deliberate: it makes cross-category token misuse (such as applying a text token to a border, like `border-text-heading`, or a surface token to text) immediately visible during code review.

## Future Considerations

- **Web Server XSS & Security Headers**: While Angular sanitizes template interpolations by default, production deployment would enforce a strict `Content-Security-Policy` (CSP), `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` at the web server / edge layer to mitigate cross-site scripting (XSS) and injection vectors.
- **Server-Side Rendering (SSR)**: Enable `@angular/ssr` with incremental hydration to improve First Contentful Paint (FCP), Largest Contentful Paint (LCP), and SEO indexability for public-facing landing pages.
- **Contract-Driven API Integration (OpenAPI / Zod)**: When replacing the mock endpoint with a live backend, request/response types and client services would be auto-generated from an **OpenAPI** specification. If the backend cannot auto-generate an OpenAPI spec, runtime boundary validation would be enforced using **Zod** schemas at the HTTP service boundary to guarantee type safety against unexpected payload changes.

## Development & Build Commands

- `npm start`: Start local development server on `http://localhost:4200/`
- `npm run build`: Compile production artifacts to `dist/`
- `npm run lint`: Run ESLint across `src/`
- `npm test`: Execute unit and integration test suite via Vitest
- `npm run test:e2e`: Execute Playwright end-to-end and `@axe-core/playwright` accessibility suite
