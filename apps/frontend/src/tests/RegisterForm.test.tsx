import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../components/RegisterForm';

const mockOnSubmit = jest.fn();

function renderRegisterForm(props: Partial<React.ComponentProps<typeof RegisterForm>> = {}) {
  return render(
    <RegisterForm
      onSubmit={props.onSubmit ?? mockOnSubmit}
      isLoading={props.isLoading ?? false}
      error={props.error ?? null}
    />,
  );
}

beforeEach(() => {
  mockOnSubmit.mockReset();
});

describe('RegisterForm', () => {
  describe('rendering', () => {
    it('renders all form fields', () => {
      renderRegisterForm();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
      renderRegisterForm({ isLoading: true });
      const btn = screen.getByRole('button', { name: /creating account/i });
      expect(btn).toBeDisabled();
    });

    it('shows error message when error prop is set', () => {
      renderRegisterForm({ error: 'Email already in use' });
      expect(screen.getByRole('alert')).toHaveTextContent('Email already in use');
    });
  });

  describe('validation', () => {
    it('shows email error when email is empty', async () => {
      renderRegisterForm();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows email error for invalid email format', async () => {
      renderRegisterForm();
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'not-an-email' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('shows password error when password is too short', async () => {
      renderRegisterForm();
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'abc' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('shows confirmPassword error when passwords do not match', async () => {
      renderRegisterForm();
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'differentpass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('does not call onSubmit when validation fails', async () => {
      renderRegisterForm();
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });
});
