import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with default guest/unauthenticated state', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.currentView).toBe('home');
  });

  it('should restore auth session from localStorage if present', () => {
    const mockUser = { email: 'customer@juanfershop.com', role: 'customer' };
    window.localStorage.setItem('auth_user', JSON.stringify(mockUser));
    window.localStorage.setItem('auth_current_view', 'checkout');

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.currentView).toBe('checkout');
  });

  it('should successfully log in as customer and redirect to catalog', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set view to login first so we can verify the transition to catalog
    act(() => {
      result.current.setView('login');
    });
    expect(result.current.currentView).toBe('login');

    // Test with customerJFS2026! (from user request)
    await act(async () => {
      await result.current.login('customer@juanfershop.com', 'customerJFS2026!');
    });

    expect(result.current.user).toEqual({ email: 'customer@juanfershop.com', role: 'customer' });
    expect(result.current.currentView).toBe('catalog');

    // Verify localStorage
    expect(JSON.parse(window.localStorage.getItem('auth_user'))).toEqual({
      email: 'customer@juanfershop.com',
      role: 'customer',
    });
    expect(window.localStorage.getItem('auth_current_view')).toBe('catalog');
  });

  it('should successfully log in as admin and redirect to admin dashboard', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setView('login');
    });

    // Test with adminJFS2026! (from user request)
    await act(async () => {
      await result.current.login('admin@juanfershop.com', 'adminJFS2026!');
    });

    expect(result.current.user).toEqual({ email: 'admin@juanfershop.com', role: 'admin' });
    expect(result.current.currentView).toBe('admin');

    // Verify localStorage
    expect(JSON.parse(window.localStorage.getItem('auth_user'))).toEqual({
      email: 'admin@juanfershop.com',
      role: 'admin',
    });
    expect(window.localStorage.getItem('auth_current_view')).toBe('admin');
  });

  it('should throw "El correo electrónico es obligatorio" if email is empty', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(() => {
      act(() => {
        result.current.login('', 'customerJFS2026!');
      });
    }).toThrow('El correo electrónico es obligatorio');
  });

  it('should throw "La contraseña es obligatoria" if password is empty', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(() => {
      act(() => {
        result.current.login('customer@juanfershop.com', '');
      });
    }).toThrow('La contraseña es obligatoria');
  });

  it('should throw "Formato de correo electrónico no válido" if email regex fails', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(() => {
      act(() => {
        result.current.login('customer-juanfershop.com', 'customerJFS2026!');
      });
    }).toThrow('Formato de correo electrónico no válido');

    expect(() => {
      act(() => {
        result.current.login('customer@', 'customerJFS2026!');
      });
    }).toThrow('Formato de correo electrónico no válido');
  });

  it('should throw "Correo electrónico o contraseña no válidos" for invalid credentials', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      result.current.login('unknown@juanfershop.com', 'customerJFS2026!')
    ).rejects.toThrow('Correo electrónico o contraseña no válidos');

    await expect(
      result.current.login('customer@juanfershop.com', 'wrongpassword')
    ).rejects.toThrow('Correo electrónico o contraseña no válidos');
  });

  it('should successfully log out and reset user state and view', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initial log in
    await act(async () => {
      await result.current.login('customer@juanfershop.com', 'customerJFS2026!');
    });
    expect(result.current.user).toEqual({ email: 'customer@juanfershop.com', role: 'customer' });
    expect(result.current.currentView).toBe('catalog');

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.currentView).toBe('home');

    // Verify localStorage cleared
    expect(window.localStorage.getItem('auth_user')).toBeNull();
    expect(window.localStorage.getItem('auth_current_view')).toBeNull();
  });

  it('should allow setting the view manually', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setView('checkout');
    });

    expect(result.current.currentView).toBe('checkout');
    expect(window.localStorage.getItem('auth_current_view')).toBe('checkout');
  });
});
