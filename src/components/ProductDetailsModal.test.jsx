import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetailsModal from './ProductDetailsModal';
import { CartProvider } from '../context/CartContext';
import { NotificationProvider } from '../context/NotificationContext';

const mockProduct = {
  id: 99,
  title: 'Gravity Boots',
  description: 'Boots that defy gravity.',
  price: 150.00,
  category: 'Footwear',
  image: 'boots.png',
  stock: 5,
  onSale: true,
  discountPercent: 10,
};

describe('ProductDetailsModal', () => {
  it('renders modal contents correctly', () => {
    const handleClose = vi.fn();
    render(
      <NotificationProvider>
        <CartProvider>
          <ProductDetailsModal product={mockProduct} onClose={handleClose} />
        </CartProvider>
      </NotificationProvider>
    );

    expect(screen.getByText('Gravity Boots')).toBeInTheDocument();
    expect(screen.getByText('Boots that defy gravity.')).toBeInTheDocument();
    expect(screen.getByText('Footwear')).toBeInTheDocument();
    expect(screen.getByText('Stock: 5')).toBeInTheDocument();
    // Sale price should be 135 (150 * 0.9)
    expect(screen.getByText('$135.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close details');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
