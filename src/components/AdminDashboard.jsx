import { useState, useEffect, useContext } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { NotificationContext } from '../context/NotificationContext';
import { hashPassword } from '../utils/hash';

export default function AdminDashboard() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { user, logout } = useAuth();
  const notificationCtx = useContext(NotificationContext);
  const showNotification = notificationCtx ? notificationCtx.showNotification : () => {};

  // Tab State
  const [activeTab, setActiveTab] = useState('products');

  // Filter State
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  // Product Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');
  const [isNew, setIsNew] = useState(false);

  // Edit Mode State
  const [editingProduct, setEditingProduct] = useState(null);

  // Validation Errors
  const [errors, setErrors] = useState({});

  // User Management State
  const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'customer' });
  const [userErrors, setUserErrors] = useState({});
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (isTestEnv) {
      setUsers([
        { email: 'admin@juanfershop.com', role: 'admin', password: 'c27494709dc088413f5302df598bee0a5b8b24376d5806089ba1b38328c7d553' },
        { email: 'customer@juanfershop.com', role: 'customer', password: '47c23d502a31871c4079b14716b48be4f867e3ee3d37360552d4cc8e1ac9f118' }
      ]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ email: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching users: ", err);
      }
    };

    fetchUsers();
  }, [isTestEnv]);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setPrice('');
    setStock('');
    setDescription('');
    setImage('');
    setOnSale(false);
    setDiscountPercent('');
    setIsNew(false);
    setEditingProduct(null);
    setErrors({});
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setTitle(product.title || '');
    setCategory(product.category || '');
    setPrice(product.price !== undefined ? String(product.price) : '');
    setStock(product.stock !== undefined ? String(product.stock) : '');
    setDescription(product.description || '');
    setImage(product.image || '');
    setOnSale(product.onSale || false);
    setDiscountPercent(product.discountPercent !== undefined ? String(product.discountPercent) : '');
    setIsNew(product.isNew || false);
    setErrors({});
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    if (!title || title.trim() === '') {
      newErrors.title = 'Name is required';
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (onSale) {
      const parsedDiscount = parseFloat(discountPercent);
      if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
        newErrors.discountPercent = 'Discount % must be between 0 and 100';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const productPayload = {
      title: title.trim(),
      category: category.trim(),
      price: parsedPrice,
      stock: parsedStock,
      description: description.trim(),
      image: image,
      onSale: onSale,
      discountPercent: onSale ? (parseFloat(discountPercent) || 0) : 0,
      isNew: isNew,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
      showNotification(`Product ${productPayload.title} updated!`, 'success');
    } else {
      addProduct(productPayload);
      showNotification(`Product ${productPayload.title} added!`, 'success');
    }

    resetForm();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserErrors({});
    const newErrors = {};

    if (!userForm.email || userForm.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (!userForm.password || userForm.password.trim() === '') {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setUserErrors(newErrors);
      return;
    }

    const email = userForm.email.trim();
    const password = userForm.password;
    const role = userForm.role;

    try {
      const hashedPassword = await hashPassword(password);

      if (isTestEnv) {
        setUsers((prev) => [...prev, { email, password: hashedPassword, role }]);
        setUserForm({ email: '', password: '', role: 'customer' });
        showNotification(`User ${email} added!`, 'success');
        return;
      }

      await setDoc(doc(db, 'users', email), { email, password: hashedPassword, role });
      setUsers((prev) => [...prev.filter((u) => u.email !== email), { email, password: hashedPassword, role }]);
      setUserForm({ email: '', password: '', role: 'customer' });
      showNotification(`User ${email} added!`, 'success');
    } catch (err) {
      console.error(err);
      setUserErrors({ general: 'Failed to add user' });
    }
  };

  const handleUpdateRole = async (email, newRole) => {
    if (isTestEnv) {
      setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
      showNotification(`User ${email} updated!`, 'success');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', email), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
      showNotification(`User ${email} updated!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (email) => {
    const currentUserEmail = user?.email;
    if (email === currentUserEmail) {
      alert("You cannot delete yourself.");
      return;
    }

    if (isTestEnv) {
      setUsers((prev) => prev.filter((u) => u.email !== email));
      showNotification(`User ${email} deleted!`, 'success');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', email));
      setUsers((prev) => prev.filter((u) => u.email !== email));
      showNotification(`User ${email} deleted!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!newPassword || newPassword.trim() === '') {
      setResetError('Password is required');
      return;
    }

    const emailToReset = resetPasswordEmail;

    try {
      const hashedPassword = await hashPassword(newPassword);

      if (isTestEnv) {
        setUsers((prev) => prev.map((u) => (u.email === emailToReset ? { ...u, password: hashedPassword } : u)));
        showNotification(`Password reset for ${emailToReset}!`, 'success');
        setResetPasswordEmail('');
        setNewPassword('');
        return;
      }

      await updateDoc(doc(db, 'users', emailToReset), { password: hashedPassword });
      setUsers((prev) => prev.map((u) => (u.email === emailToReset ? { ...u, password: hashedPassword } : u)));
      showNotification(`Password reset for ${emailToReset}!`, 'success');
      setResetPasswordEmail('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setResetError('Failed to reset password');
    }
  };

  const filteredProducts = showOutOfStockOnly
    ? products.filter((p) => p.stock === 0)
    : products;

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user && (
            <span className="user-indicator">
              Logged in as: <strong>{user.email} (Admin)</strong>
            </span>
          )}
          <button onClick={logout} className="logout-btn">
            Log Out
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('products')}
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          Manage Users
        </button>
      </div>

      <div className="admin-dashboard-content">
        {activeTab === 'products' && (
          <>
            <section className="product-list-section">
              <h2>Products Inventory</h2>
              <div className="filter-container" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                <span 
                  className="out-of-stock-filter-label" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: 'var(--text-h)' }}
                  onClick={() => setShowOutOfStockOnly(prev => !prev)}
                >
                  <input
                    type="checkbox"
                    checked={showOutOfStockOnly}
                    onChange={(e) => {
                      e.stopPropagation();
                      setShowOutOfStockOnly(e.target.checked);
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Show Out of Stock Only
                </span>
              </div>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>On Sale</th>
                    <th>New</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={product.stock === 0 ? 'out-of-stock-row' : ''}>
                      <td>{product.title}</td>
                      <td>{product.category}</td>
                      <td>${Number(product.price).toFixed(2)}</td>
                      <td className={product.stock === 0 ? 'out-of-stock-cell' : ''}>
                        {product.stock}
                        {product.stock === 0 && <span className="out-of-stock-badge" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '11px', backgroundColor: '#e53e3e', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}>Out of Stock</span>}
                      </td>
                      <td>{product.onSale ? `Yes (${product.discountPercent}%)` : 'No'}</td>
                      <td>{product.isNew ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          onClick={() => {
                            updateProduct(product.id, { stock: product.stock + 10 });
                            showNotification(`Product ${product.title} updated!`, 'success');
                          }}
                          className="restock-btn"
                          style={{ marginRight: '8px' }}
                        >
                          +10 Stock
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            deleteProduct(product.id);
                            showNotification(`Product ${product.title} deleted!`, 'success');
                          }}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="product-form-section">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} noValidate className="product-form">
                <div className="form-group">
                  <label htmlFor="product-name">Name</label>
                  <input
                    id="product-name"
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) {
                        setErrors((prev) => ({ ...prev, title: '' }));
                      }
                    }}
                    className={errors.title ? 'input-error' : ''}
                  />
                  {errors.title && (
                    <span className="error-message">{errors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="product-category">Category</label>
                  <input
                    id="product-category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-price">Price</label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) {
                        setErrors((prev) => ({ ...prev, price: '' }));
                      }
                    }}
                    className={errors.price ? 'input-error' : ''}
                  />
                  {errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="product-stock">Stock</label>
                  <input
                    id="product-stock"
                    type="number"
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      if (errors.stock) {
                        setErrors((prev) => ({ ...prev, stock: '' }));
                      }
                    }}
                    className={errors.stock ? 'input-error' : ''}
                  />
                  {errors.stock && (
                    <span className="error-message">{errors.stock}</span>
                  )}
                </div>

                <div className="form-group">
                   <label htmlFor="product-description">Description</label>
                   <textarea
                     id="product-description"
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                   />
                 </div>

                 <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                   <input
                     type="checkbox"
                     id="product-on-sale"
                     checked={onSale}
                     onChange={(e) => setOnSale(e.target.checked)}
                     style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                   />
                   <label htmlFor="product-on-sale" style={{ cursor: 'pointer', userSelect: 'none' }}>On Sale</label>
                 </div>

                 {onSale && (
                   <div className="form-group">
                     <label htmlFor="product-discount-percent">Discount %</label>
                     <input
                       id="product-discount-percent"
                       type="number"
                       min="0"
                       max="100"
                       value={discountPercent}
                       onChange={(e) => {
                         setDiscountPercent(e.target.value);
                         if (errors.discountPercent) {
                           setErrors((prev) => ({ ...prev, discountPercent: '' }));
                         }
                       }}
                       className={errors.discountPercent ? 'input-error' : ''}
                       style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                     />
                     {errors.discountPercent && (
                       <span className="error-message" style={{ color: '#e53e3e', fontSize: '12px' }}>{errors.discountPercent}</span>
                     )}
                   </div>
                 )}

                 <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                   <input
                     type="checkbox"
                     id="product-is-new"
                     checked={isNew}
                     onChange={(e) => setIsNew(e.target.checked)}
                     style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                   />
                   <label htmlFor="product-is-new" style={{ cursor: 'pointer', userSelect: 'none' }}>New Arrival</label>
                 </div>

                 <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <section className="user-list-section">
              <h2>Users Directory</h2>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email}>
                      <td>{u.email}</td>
                      <td>
                        <select
                          aria-label="User Role Selection"
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.email, e.target.value)}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => setResetPasswordEmail(u.email)}
                          className="reset-btn"
                        >
                          Reset Credentials
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.email)}
                          className="delete-btn"
                          disabled={u.email === user?.email}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {resetPasswordEmail && (
                <div className="reset-password-modal">
                  <h3>Reset Password for {resetPasswordEmail}</h3>
                  <form onSubmit={handleResetPassword} noValidate>
                    <div className="form-group">
                      <label htmlFor="new-password">New Password</label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      {resetError && <span className="error-message">{resetError}</span>}
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Save New Password</button>
                      <button type="button" onClick={() => { setResetPasswordEmail(''); setNewPassword(''); setResetError(''); }} className="cancel-btn">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </section>

            <section className="user-form-section">
              <h2>Add New User</h2>
              <form onSubmit={handleAddUser} noValidate className="user-form">
                {userErrors.general && (
                  <div className="error-message general-error">{userErrors.general}</div>
                )}
                <div className="form-group">
                  <label htmlFor="user-email">Email</label>
                  <input
                    id="user-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => {
                      setUserForm((prev) => ({ ...prev, email: e.target.value }));
                      if (userErrors.email) {
                        setUserErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    className={userErrors.email ? 'input-error' : ''}
                  />
                  {userErrors.email && (
                    <span className="error-message">{userErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="user-password">Password</label>
                  <input
                    id="user-password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => {
                      setUserForm((prev) => ({ ...prev, password: e.target.value }));
                      if (userErrors.password) {
                        setUserErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    className={userErrors.password ? 'input-error' : ''}
                  />
                  {userErrors.password && (
                    <span className="error-message">{userErrors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="user-role">Role</label>
                  <select
                    id="user-role"
                    value={userForm.role}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Add User</button>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
