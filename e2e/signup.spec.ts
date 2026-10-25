import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

async function expectZeroWcagViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.describe('Customer Sign-Up Form E2E & Accessibility Suite', () => {
  test('renders form in idle state, validates empty submission, focuses first invalid field, and passes WCAG AA checks', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Stay connected', level: 1 }),
    ).toBeVisible();

    const firstNameInput = page.getByLabel(/first name/i);
    const lastNameInput = page.getByLabel(/last name/i);
    const emailInput = page.getByLabel(/email address/i);

    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    // Idle state accessibility scan (including color contrast in real browser)
    await expectZeroWcagViolations(page);

    // Submit empty form
    await page.getByRole('button', { name: 'Sign up for updates' }).click();

    await expect(page.getByText('First name is required.')).toBeVisible();
    await expect(page.getByText('Last name is required.')).toBeVisible();
    await expect(page.getByText('Email address is required.')).toBeVisible();

    // First invalid input receives programmatic focus
    await expect(firstNameInput).toBeFocused();

    // Error state accessibility scan
    await expectZeroWcagViolations(page);
  });

  test('intercepts POST /api/signup when mock API is disabled, verifies trimmed payload, and passes WCAG AA checks in success state', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as Window & { __DISABLE_MOCK_API__?: boolean }).__DISABLE_MOCK_API__ =
        true;
    });

    let capturedPayload: unknown;
    await page.route('**/api/signup', async (route) => {
      capturedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Thank you for signing up! Custom E2E confirmation.',
        }),
      });
    });

    await page.goto('/');

    await page.getByLabel(/first name/i).fill('  Jane  ');
    await page.getByLabel(/last name/i).fill('  Doe  ');
    await page.getByLabel(/email address/i).fill('jane.doe@example.com');

    await page.getByRole('button', { name: 'Sign up for updates' }).click();

    await expect(
      page.getByRole('heading', { name: 'Registration complete', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText('Thank you for signing up! Custom E2E confirmation.'),
    ).toBeVisible();
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await expect(page.getByText('(jane.doe@example.com)')).toBeVisible();

    expect(capturedPayload).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
    });

    // Success state accessibility scan
    await expectZeroWcagViolations(page);

    // Reset back to the sign-up form
    await page.getByRole('button', { name: 'Register another person' }).click();
    await expect(
      page.getByRole('heading', { name: 'Stay connected', level: 1 }),
    ).toBeVisible();
  });

  test('surfaces an accessible alert banner when POST /api/signup returns a 500 Server Error', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as Window & { __DISABLE_MOCK_API__?: boolean }).__DISABLE_MOCK_API__ =
        true;
    });

    await page.route('**/api/signup', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    await page.getByLabel(/first name/i).fill('Jane');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email address/i).fill('jane.doe@example.com');

    await page.getByRole('button', { name: 'Sign up for updates' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expectZeroWcagViolations(page);
  });
});
