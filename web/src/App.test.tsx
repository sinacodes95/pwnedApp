import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import App from './App';

beforeEach(() => window.history.replaceState(null, '', '/'));

it('lets keyboard users switch checks and clears password input when leaving the tab', async () => {
  const user = userEvent.setup();
  render(<App />);

  const emailTab = screen.getByRole('tab', { name: 'Email', selected: true });
  const passwordTab = screen.getByRole('tab', { name: 'Password' });
  emailTab.focus();
  await user.keyboard('{ArrowRight}');

  expect(passwordTab).toHaveFocus();
  expect(passwordTab).toHaveAttribute('aria-selected', 'true');
  expect(window.location.hash).toBe('#password');
  await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'example secret');

  passwordTab.focus();
  await user.keyboard('{Home}');
  expect(emailTab).toHaveFocus();
  expect(screen.queryByLabelText('Password', { selector: 'input' })).toBeNull();
  await user.keyboard('{End}');
  expect(screen.getByLabelText('Password', { selector: 'input' })).toHaveValue('');
});

it.each(['/Password', '/pwnedApp/#password'])('opens the password check from %s', (url) => {
  window.history.replaceState(null, '', url);
  render(<App />);

  expect(screen.getByRole('tab', { name: 'Password', selected: true })).toBeVisible();
  expect(screen.getByRole('tabpanel', { name: 'Password' })).toBeVisible();
});

it('restores the active checker when returning to a section anchor', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('tab', { name: 'Password' }));
  await user.click(screen.getByRole('link', { name: 'Privacy' }));
  await waitFor(() => expect(window.location.hash).toBe('#how-it-works'));
  expect(screen.getByRole('tab', { name: 'Password', selected: true })).toBeVisible();
  await user.click(screen.getByRole('tab', { name: 'Email' }));

  window.history.back();
  await waitFor(() => expect(screen.getByRole('tab', { name: 'Password', selected: true })).toBeVisible());
});
