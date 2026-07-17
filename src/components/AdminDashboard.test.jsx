import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../context/ProductsContext', () => ({
  useProducts: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AdminDashboard Component', () => {
  let mockAddProduct;
  let mockUpdateProduct;
  let mockDeleteProduct;
  let mockLogout;
  const mockProductsList = [
    {
      id: 1,
      title: 'Wireless Headphones',
      description: 'Noise-canceling headphones',
      price: 99.99,
      category: 'Electronics',
      image: 'headphones.jpg',
      stock: 5,
    },
    {
      id: 2,
      title: 'Leather Watch',
      description: 'Quartz leather watch',
      price: 149.50,
      category: 'Accessories',
      image: 'watch.jpg',
      stock: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddProduct = vi.fn();
    mockUpdateProduct = vi.fn();
    mockDeleteProduct = vi.fn();
    mockLogout = vi.fn();

    useProducts.mockReturnValue({
      products: mockProductsList,
      addProduct: mockAddProduct,
      updateProduct: mockUpdateProduct,
      deleteProduct: mockDeleteProduct,
    });

    useAuth.mockReturnValue({
      logout: mockLogout,
    });
  });

  it('renders dashboard layout and logout button', () => {
    render(<AdminDashboard />);
    expect(screen.getByRole('heading', { name: /panel de administración/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /agregar nuevo producto/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('displays list of products with Name, Category, Price, and Stock', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Leather Watch')).toBeInTheDocument();
    expect(screen.getByText('Accessories')).toBeInTheDocument();
    expect(screen.getByText('$149.50')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('adds a new product successfully with valid details and resets fields', () => {
    render(<AdminDashboard />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Running Shoes' } });
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Footwear' } });
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: '89.99' } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Comfortable running shoes' } });

    fireEvent.click(screen.getByRole('button', { name: /agregar producto/i }));

    expect(mockAddProduct).toHaveBeenCalledWith({
      title: 'Running Shoes',
      category: 'Footwear',
      price: 89.99,
      stock: 15,
      description: 'Comfortable running shoes',
      image: '',
      onSale: false,
      discountPercent: 0,
      isNew: false,
    });

    // Inputs should be reset
    expect(screen.getByLabelText(/nombre/i).value).toBe('');
    expect(screen.getByLabelText(/categoría/i).value).toBe('');
    expect(screen.getByLabelText(/precio/i).value).toBe('');
    expect(screen.getByLabelText(/stock/i).value).toBe('');
    expect(screen.getByLabelText(/descripción/i).value).toBe('');
  });

  it('shows validation errors for empty name, price <= 0, or stock < 0', () => {
    render(<AdminDashboard />);

    // Test: Empty name
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: ' ' } });
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Electronics' } });
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /agregar producto/i }));

    expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    expect(mockAddProduct).not.toHaveBeenCalled();

    // Test: Price <= 0
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Valid Name' } });
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /agregar producto/i }));

    expect(screen.getByText(/el precio debe ser mayor que 0/i)).toBeInTheDocument();
    expect(mockAddProduct).not.toHaveBeenCalled();

    // Test: Stock < 0
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: '-2' } });
    fireEvent.click(screen.getByRole('button', { name: /agregar producto/i }));

    expect(screen.getByText(/el stock no puede ser negativo/i)).toBeInTheDocument();
    expect(mockAddProduct).not.toHaveBeenCalled();
  });

  it('populates form on Clicking Edit, allows cancel/clear, and updates product upon submitting', () => {
    render(<AdminDashboard />);

    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    expect(editButtons).toHaveLength(2);

    // Edit the first product (id: 1)
    fireEvent.click(editButtons[0]);

    // Heading should change to indicate Edit Mode
    expect(screen.getByRole('heading', { name: /editar producto/i })).toBeInTheDocument();

    // Form inputs should be populated
    const nameInput = screen.getByLabelText(/nombre/i);
    const categoryInput = screen.getByLabelText(/categoría/i);
    const priceInput = screen.getByLabelText(/precio/i);
    const stockInput = screen.getByLabelText(/stock/i);
    const descriptionInput = screen.getByLabelText(/descripción/i);

    expect(nameInput.value).toBe('Wireless Headphones');
    expect(categoryInput.value).toBe('Electronics');
    expect(priceInput.value).toBe('99.99');
    expect(stockInput.value).toBe('5');
    expect(descriptionInput.value).toBe('Noise-canceling headphones');

    // Test cancel edit selection button
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);

    // Heading should change back to Add
    expect(screen.getByRole('heading', { name: /agregar nuevo producto/i })).toBeInTheDocument();
    expect(nameInput.value).toBe('');

    // Click edit again
    fireEvent.click(editButtons[0]);
    expect(screen.getByRole('heading', { name: /editar producto/i })).toBeInTheDocument();

    // Modify price and stock
    fireEvent.change(priceInput, { target: { value: '89.99' } });
    fireEvent.change(stockInput, { target: { value: '12' } });

    // Submit edit
    fireEvent.click(screen.getByRole('button', { name: /actualizar producto/i }));

    expect(mockUpdateProduct).toHaveBeenCalledWith(1, {
      title: 'Wireless Headphones',
      category: 'Electronics',
      price: 89.99,
      stock: 12,
      description: 'Noise-canceling headphones',
      image: 'headphones.jpg',
      onSale: false,
      discountPercent: 0,
      isNew: false,
    });

    // Heading should reset back to Add
    expect(screen.getByRole('heading', { name: /agregar nuevo producto/i })).toBeInTheDocument();
    expect(nameInput.value).toBe('');
  });

  it('deletes a product on clicking Delete', () => {
    render(<AdminDashboard />);

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);

    // Delete the second product (id: 2)
    fireEvent.click(deleteButtons[1]);

    expect(mockDeleteProduct).toHaveBeenCalledWith(2);
  });

  it('calls AuthContext.logout on clicking Logout button', () => {
    render(<AdminDashboard />);

    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('triangulates adding a product with different inputs (integer price, different category, no description)', () => {
    render(<AdminDashboard />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Keyboard' } });
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Accessories' } });
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: '8' } });

    fireEvent.click(screen.getByRole('button', { name: /agregar producto/i }));

    expect(mockAddProduct).toHaveBeenCalledWith({
      title: 'Keyboard',
      category: 'Accessories',
      price: 50,
      stock: 8,
      description: '',
      image: '',
      onSale: false,
      discountPercent: 0,
      isNew: false,
    });
  });

  it('allows switching to Manage Users tab and performing user CRUD operations', async () => {
    // Provide a mocked user to allow self-deletion checks
    useAuth.mockReturnValue({
      logout: mockLogout,
      user: { email: 'admin@juanfershop.com', role: 'admin' },
    });

    render(<AdminDashboard />);

    // 1. Switch tab
    const usersTabBtn = screen.getByRole('button', { name: /gestionar usuarios/i });
    fireEvent.click(usersTabBtn);

    // 2. Verify user list is displayed
    expect(await screen.findByText('admin@juanfershop.com')).toBeInTheDocument();
    expect(screen.getByText('customer@juanfershop.com')).toBeInTheDocument();

    // 3. Prevent self-deletion: Admin delete button should be disabled
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    // First user is admin@juanfershop.com (index 0), second is customer@juanfershop.com (index 1)
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).not.toBeDisabled();

    // Delete customer
    fireEvent.click(deleteButtons[1]);
    expect(screen.queryByText('customer@juanfershop.com')).not.toBeInTheDocument();

    // 4. Add a new user
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'newuser@juanfershop.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /agregar usuario/i }));

    expect(await screen.findByText('newuser@juanfershop.com')).toBeInTheDocument();

    // 5. Update role
    const newRoleSelects = screen.getAllByLabelText('Selección de rol de usuario');
    fireEvent.change(newRoleSelects[0], { target: { value: 'customer' } }); // update role for remaining user admin to customer
    expect(newRoleSelects[0].value).toBe('customer');

    // 6. Reset password (toggle credentials modal, save password, cancel)
    const resetButtons = screen.getAllByRole('button', { name: /restablecer credenciales/i });
    fireEvent.click(resetButtons[0]);

    expect(screen.getByRole('heading', { name: /restablecer contraseña para/i })).toBeInTheDocument();
    const newPasswordInput = screen.getByLabelText(/nueva contraseña/i);
    fireEvent.change(newPasswordInput, { target: { value: 'reset123' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar nueva contraseña/i }));

    // Modal should disappear after saving
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /restablecer contraseña para/i })).not.toBeInTheDocument();
    });
  });
});


