# Intentional LoginForm Test Failures

This file lists simple changes to make the `LoginForm` tests fail for demonstration, CI testing, or report verification.

Apply one change at a time, then run:

```bash
npx jest --testPathPattern=LoginForm --no-coverage --verbose
```

---

## 1. Rendering test fails

File: `apps/frontend/src/tests/LoginForm.test.tsx`

Change the expected accessible name to a non-existent label.

```diff
    it('renders the login form', () => {
      renderLoginForm();
-      expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
+      expect(screen.getByRole('form', { name: /sign in form/i })).toBeInTheDocument();
    });
```

Expected failure: `Unable to find role="form" with name "sign in form"`

---

## 2. Loading state test fails

Change the expected loading text.

```diff
    it('shows "Signing in..." text when loading', () => {
      renderLoginForm({ isLoading: true });
-      expect(screen.getByRole('button')).toHaveTextContent('Signing in...');
+      expect(screen.getByRole('button')).toHaveTextContent('Loading...');
    });
```

Expected failure: `received value does not match "Loading..."`

---

## 3. Validation test fails

Change the minimum password length requirement in the assertion.

```diff
    it('shows validation error when password is too short', async () => {
      renderLoginForm();
      await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), '123');
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
-        expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
+        expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
      });
    });
```

Expected failure: `Unable to find text "at least 10 characters"`

---

## 4. Submission test fails

Provide a valid-length password in a test that expects `onSubmit` not to be called.

```diff
    it('does not call onSubmit with correct email but short password', async () => {
      const user = userEvent.setup({ delay: null });
      renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
-      await user.type(screen.getByLabelText(/password/i), '123');
+      await user.type(screen.getByLabelText(/password/i), 'validpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
      });
    });
```

Expected failure: `expect(jest.fn()).not.toHaveBeenCalled()` — because the valid password lets `onSubmit` fire.

---

## 5. API error test fails

Change the expected error message.

```diff
    it('displays API error when onSubmit prop receives an error string', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      const { rerender } = renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'validpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(
        { email: 'user@example.com', password: 'validpassword' },
        expect.anything(),
      ));

      rerender(
-        <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Service unavailable" />,
+        <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Database error" />,
      );

-      expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
+      expect(screen.getByRole('alert')).toHaveTextContent('Database error');
    });
```

Expected failure: `received value does not match "Database error"` (because the alert still shows "Service unavailable")

---

## 6. Wrong credentials test fails

Change the expected email credential in the assertion.

```diff
    it('shows error message when wrong password is provided', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      const { rerender } = renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(
-        { email: 'admin@example.com', password: 'wrongpassword' },
+        { email: 'admin@example.com', password: 'correctpassword' },
        expect.anything(),
      ));

      rerender(
        <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Invalid email or password" />,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });
```

Expected failure: `expected email: admin@example.com, password: correctpassword` — received password was `wrongpassword`.

---

## How to verify the HTML report still generates

After applying any failure, run the same command:

```bash
npx jest --testPathPattern=LoginForm --no-coverage
```

The report will still be created at:

```
apps/frontend/reports/test-report.html
```

Open it in a browser to see the failed test highlighted.

---

## Revert all intentional failures

If you want to restore the passing test suite, revert any of the above changes back to their original values.
