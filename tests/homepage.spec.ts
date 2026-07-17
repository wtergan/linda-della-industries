import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage-should-present-one-priced-founding-offer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Turn one recurring workflow');
  await expect(page.getByText('$1,000 flat')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The 7-Day AI Workflow Sprint' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Request a founding sprint' })).toHaveAttribute('href', '#contact');
});

test('keyboard-user-should-reach-primary-content-and-contact-form', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send the workflow' })).toBeVisible();
});

test('homepage-should-have-no-detectable-serious-accessibility-violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''));
  expect(serious).toEqual([]);
});

test('mobile-layout-should-not-overflow-horizontally', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('legal-pages-should-be-reachable', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy, in plain language.');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Website terms.');
});

test('contact-form-should-send-structured-data-and-confirm-receipt', async ({ page }) => {
  let postedBody = '';
  await page.route('https://formsubmit.co/ajax/**', async (route) => {
    postedBody = route.request().postData() ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/');
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('action', 'https://formsubmit.co/willdoraniv@gmail.com');
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-ajax-action', 'https://formsubmit.co/ajax/willdoraniv@gmail.com');
  await page.locator('input[name="name"]').fill('Baltimore Test Owner');
  await page.locator('input[name="email"]').fill('owner@example.com');
  await page.locator('textarea[name="workflow"]').fill('Every inquiry is copied into a spreadsheet and answered by hand.');
  await page.locator('input[name="consent"]').check();
  await page.getByRole('button', { name: /send the workflow/i }).click();

  await expect(page.getByRole('status')).toContainText('Submitted');
  expect(postedBody).toContain('Baltimore Test Owner');
  expect(postedBody).toContain('Every inquiry');
});
