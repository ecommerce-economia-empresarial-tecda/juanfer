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
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
  });

  it('displays validation message when Email is empty on submission', () => {
    render(<LoginForm />);
    
    // Fill only password
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));
    
    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays validation message when Password is empty on submission', () => {
    render(<LoginForm />);
    
    // Fill only email
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'customer@juanfershop.com' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));
    
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays validation message when Email format is invalid', () => {
    render(<LoginForm />);
    
    // Fill invalid email and some password
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));
    
    expect(screen.getByText(/formato de correo electrónico no válido/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays credentials validation error when AuthContext.login throws an error', () => {
    mockLogin.mockImplementation(() => {
      throw new Error('Correo electrónico o contraseña no válidos');
    });

    render(<LoginForm />);
    
    // Fill valid format email and some password
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'unknown@juanfershop.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'customerJFS2026!' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('unknown@juanfershop.com', 'customerJFS2026!');
    expect(screen.getByText(/correo electrónico o contraseña no válidos/i)).toBeInTheDocument();
  });

  it('calls AuthContext.login with the entered email and password on successful form submission', () => {
    render(<LoginForm />);
    
    // Fill valid credentials
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'customer@juanfershop.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'customerJFS2026!' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('customer@juanfershop.com', 'customerJFS2026!');
    expect(screen.queryByText(/el correo electrónico es obligatorio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/la contraseña es obligatoria/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no válido/i)).not.toBeInTheDocument();
  });

  it('clears specific field validation errors as the user types', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /acceder/i });

    // Submit with empty inputs to trigger errors
    fireEvent.click(submitBtn);

    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();

    // Type in email and check if its error is cleared
    fireEvent.change(emailInput, { target: { value: 'a' } });
    expect(screen.queryByText(/el correo electrónico es obligatorio/i)).not.toBeInTheDocument();
    // Password error should still exist
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();

    // Type in password and check if its error is cleared
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(screen.queryByText(/la contraseña es obligatoria/i)).not.toBeInTheDocument();
  });
});

