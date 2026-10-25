/**
 * INTEGRATION TEST SUITE — SignUpPageComponent
 *
 * NOTE: This file is an Integration Test rather than an isolated shallow unit test.
 * It renders and verifies the complete vertical slice of the Sign-Up feature together:
 *   - Smart Container (`SignUpPageComponent`)
 *   - Component-scoped State & Signal Forms (`SignUpStore`, `createSignUpForm`, `signUpValidationSchema`)
 *   - Presentational Feature Components (`SignUpFormComponent`, `SignUpSuccessComponent`)
 *   - Shared Design System Primitives (`TextInputComponent`, `FormFieldComponent`, `FieldErrorComponent`, `ButtonComponent`, `SpinnerComponent`)
 *   - HTTP Layer (`SignUpApiService` + `mockApiInterceptor` configured via `MOCK_API_CONFIG`)
 *   - Automated WCAG 2.1 AA accessibility checks via `axe-core` across idle, error, and success states.
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MOCK_API_CONFIG, mockApiInterceptor } from '@core/api/mock-api.interceptor';
import { ButtonHarness } from '@shared/ui/button/button.harness';
import { TextInputHarness } from '@shared/ui/text-input/text-input.harness';
import { render, screen } from '@testing-library/angular';
import axe from 'axe-core';
import { SignUpPageComponent } from './sign-up-page.component';

async function expectZeroAxeViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
    rules: {
      'color-contrast': { enabled: false },
    },
  });
  expect(results.violations).toEqual([]);
}

describe('SignUpPageComponent (Integration Test)', () => {
  async function setup(delayMs = 0) {
    const view = await render(SignUpPageComponent, {
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        {
          provide: MOCK_API_CONFIG,
          useValue: { enabled: true, delayMs },
        },
      ],
    });

    const loader = TestbedHarnessEnvironment.loader(view.fixture);
    return { ...view, loader };
  }

  it('renders all schema-driven fields, GDPR transparency notice, and passes AXE checks in idle state', async () => {
    const { container, loader } = await setup();

    expect(
      screen.getByRole('heading', { name: /stay connected/i }),
    ).toBeTruthy();

    const firstNameInput = await loader.getHarness(
      TextInputHarness.with({ label: 'First name' }),
    );
    const lastNameInput = await loader.getHarness(
      TextInputHarness.with({ label: 'Last name' }),
    );
    const emailInput = await loader.getHarness(
      TextInputHarness.with({ label: 'Email address' }),
    );

    expect(await firstNameInput.isRequired()).toBe(true);
    expect(await lastNameInput.isRequired()).toBe(true);
    expect(await emailInput.isRequired()).toBe(true);
    expect(await emailInput.getHelperText()).toBe(
      'We will only use your email to share product updates.',
    );

    expect(
      screen.getByText(/by submitting this form, you agree that we may use your contact details/i),
    ).toBeTruthy();

    await expectZeroAxeViolations(container);
  });

  it('displays accessible validation alerts, focuses the first invalid field, and passes AXE checks in error state', async () => {
    const { container, loader } = await setup();

    const submitButton = await loader.getHarness(
      ButtonHarness.with({ text: 'Sign up for updates' }),
    );
    await submitButton.click();

    const firstNameInput = await loader.getHarness(
      TextInputHarness.with({ label: 'First name' }),
    );
    const lastNameInput = await loader.getHarness(
      TextInputHarness.with({ label: 'Last name' }),
    );
    const emailInput = await loader.getHarness(
      TextInputHarness.with({ label: 'Email address' }),
    );

    expect(await firstNameInput.getErrorText()).toBe('First name is required.');
    expect(await lastNameInput.getErrorText()).toBe('Last name is required.');
    expect(await emailInput.getErrorText()).toBe('Email address is required.');

    // First invalid input receives programmatic focus
    expect(await firstNameInput.isFocused()).toBe(true);

    // Accessible role="alert" live regions are rendered
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBe(3);

    await expectZeroAxeViolations(container);
  });

  it('completes a valid sign-up journey, renders the accessible confirmation view, and passes AXE checks in success state', async () => {
    const { container, loader } = await setup(0);

    const firstNameInput = await loader.getHarness(
      TextInputHarness.with({ label: 'First name' }),
    );
    const lastNameInput = await loader.getHarness(
      TextInputHarness.with({ label: 'Last name' }),
    );
    const emailInput = await loader.getHarness(
      TextInputHarness.with({ label: 'Email address' }),
    );

    await firstNameInput.setValue('Jane');
    await lastNameInput.setValue('Doe');
    await emailInput.setValue('jane.doe@example.com');

    const submitButton = await loader.getHarness(
      ButtonHarness.with({ text: 'Sign up for updates' }),
    );
    await submitButton.click();

    const statusRegion = await screen.findByRole('status');
    expect(statusRegion.textContent).toContain('Registration complete');
    expect(statusRegion.textContent).toContain('Jane Doe');
    expect(statusRegion.textContent).toContain('jane.doe@example.com');

    await expectZeroAxeViolations(container);

    // Clicking "Register another person" resets back to the empty form
    const resetButton = await loader.getHarness(
      ButtonHarness.with({ text: 'Register another person' }),
    );
    await resetButton.click();

    expect(
      screen.getByRole('heading', { name: /stay connected/i }),
    ).toBeTruthy();
  });
});
