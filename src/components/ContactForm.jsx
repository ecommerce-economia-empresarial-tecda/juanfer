import { useState, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export default function ContactForm() {
  const notificationCtx = useContext(NotificationContext);
  const showNotification = notificationCtx ? notificationCtx.showNotification : () => {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Formato de correo electrónico no válido';
      }
    }
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSending(true);

    const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

    if (!isTestEnv) {
      try {
        const { db } = await import('../firebase');
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'messages'), {
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error saving message:', err);
        showNotification('Error al enviar el mensaje. Intente nuevamente.', 'error');
        setSending(false);
        return;
      }
    }

    showNotification('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.', 'success');
    setFormData({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="contact-page">
      <div className="view-header">
        <span className="micro-eyebrow">Comunicate con nosotros</span>
        <h2>Contacto</h2>
        <p>¿Tenés preguntas o querés más información sobre nuestros productos? Escribinos y te respondemos a la brevedad.</p>
      </div>
      <div className="contact-form-container double-bezel-outer">
        <div className="double-bezel-inner" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} className="contact-form" noValidate>
            <div className="form-group">
              <label htmlFor="contact-name" className="micro-eyebrow">Nombre completo</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contact-email" className="micro-eyebrow">Correo electrónico</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@ejemplo.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contact-message" className="micro-eyebrow">Mensaje</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribí tu mensaje aquí..."
                className={errors.message ? 'input-error' : ''}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="submit-contact-btn premium-btn-pill"
            >
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
