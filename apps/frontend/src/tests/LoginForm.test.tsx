import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../components/LoginForm';

const mockOnSubmit = jest.fn();

function renderLoginForm(props: Partial<React.ComponentProps<typeof LoginForm>> = {}) {
  return render(
    <LoginForm
      onSubmit={props.onSubmit ?? mockOnSubmit}
      isLoading={props.isLoading ?? false}
      error={props.error ?? null}
    />,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the login form', () => {
      renderLoginForm();
      expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
    });

    it('renders an email input', () => {
      renderLoginForm();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders a password input', () => {
      renderLoginForm();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders a submit button', () => {
      renderLoginForm();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('does not show error alert when error is null', () => {
      renderLoginForm({ error: null });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows API error message when error prop is set', () => {
      renderLoginForm({ error: 'Invalid email or password' });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('disables submit button when isLoading is true', () => {
      renderLoginForm({ isLoading: true });
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows "Signing in..." text when loading', () => {
      renderLoginForm({ isLoading: true });
      expect(screen.getByRole('button')).toHaveTextContent('Signing in...');
    });

    it('shows "Sign in" text when not loading', () => {
      renderLoginForm({ isLoading: false });
      expect(screen.getByRole('button')).toHaveTextContent('Sign in');
    });
  });

  describe('validation', () => {
    it('shows validation error when email is empty on submit', async () => {
      renderLoginForm();
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when email format is invalid', async () => {
      renderLoginForm();
      await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email');
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when password is empty on submit', async () => {
      renderLoginForm();
      await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when password is too short', async () => {
      renderLoginForm();
      await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), '123');
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('does not call onSubmit when validation fails', async () => {
      renderLoginForm();
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('form submission', () => {
    it('calls onSubmit when form has valid inputs', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    });

    it('calls onSubmit with correct email and password credentials', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'correctpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          { email: 'admin@example.com', password: 'correctpassword' },
          expect.anything(),
        );
      }, { timeout: 3000 });
    });

    it('shows error message when wrong password is provided', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      const { rerender } = renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(
        { email: 'admin@example.com', password: 'wrongpassword' },
        expect.anything(),
      ));

      rerender(
        <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Invalid email or password" />,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });

    it('shows error message when wrong email is provided', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      const { rerender } = renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'somepassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(
        { email: 'wrong@example.com', password: 'somepassword' },
        expect.anything(),
      ));

      rerender(
        <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Invalid email or password" />,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });

    it('displays API error when onSubmit prop receives an error string', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup({ delay: null });
      const { rerender } = renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'validpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith(
        { email: 'user@example.com', password: 'v' },
        expect.anything(),
      ));

      rerender(
        <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Service unavailable" />,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });

    it('does not call onSubmit with invalid email format regardless of password', async () => {
      const user = userEvent.setup({ delay: null });
      renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

   

    it('does not call onSubmit with correct email but short password', async () => {
      const user = userEvent.setup({ delay: null });
      renderLoginForm();

      await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), '123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
      });
    });
  });
});
