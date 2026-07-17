import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';
import { useAuth } from '../context/AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('LoginForm Component', () => {
  let mockLogin;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn();
    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  it('renders input fields correctly', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('displays validation message when Email is empty on submission', () => {
    render(<LoginForm />);
    
    // Fill only password
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays validation message when Password is empty on submission', () => {
    render(<LoginForm />);
    
    // Fill only email
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'customer@juanfershop.com' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays validation message when Email format is invalid', () => {
    render(<LoginForm />);
    
    // Fill invalid email and some password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays credentials validation error when AuthContext.login throws an error', () => {
    mockLogin.mockImplementation(() => {
      throw new Error('Invalid email or password');
    });

    render(<LoginForm />);
    
    // Fill valid format email and some password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'unknown@juanfershop.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'customerJFS2026!' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('unknown@juanfershop.com', 'customerJFS2026!');
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('calls AuthContext.login with the entered email and password on successful form submission', () => {
    render(<LoginForm />);
    
    // Fill valid credentials
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'customer@juanfershop.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'customerJFS2026!' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('customer@juanfershop.com', 'customerJFS2026!');
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  it('clears specific field validation errors as the user types', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /log in/i });

    // Submit with empty inputs to trigger errors
    fireEvent.click(submitBtn);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    // Type in email and check if its error is cleared
    fireEvent.change(emailInput, { target: { value: 'a' } });
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    // Password error should still exist
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    // Type in password and check if its error is cleared
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
  });
});

