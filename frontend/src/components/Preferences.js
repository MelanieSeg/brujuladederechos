import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';

toast.configure();

const Preferences = () => {
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: false,
    push: true,
    sms: false
  });

  const { register, handleSubmit, errors } = useForm();

  useEffect(() => {
    fetch('/api/preferences')
      .then(response => response.json())
      .then(data => setNotificationPrefs(data))
      .catch(() => toast.error('Error al cargar preferencias'));
  }, []);

  const onSubmit = (data) => {
    fetch('/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al guardar preferencias');
      }
      toast.success('Preferencias guardadas exitosamente');
    })
    .catch(error => toast.error(error.message));
  };

  return (
    <div>
      <h2>Configuración de Preferencias</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>
            <input
              type="checkbox"
              name="email"
              ref={register({ required: true })}
              defaultChecked={notificationPrefs.email}
            />
            Notificaciones por Email
          </label>
          {errors.email && <p style={{color: 'red'}}>Este campo es obligatorio</p>}
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="push"
              ref={register}
              defaultChecked={notificationPrefs.push}
            />
            Notificaciones Push
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="sms"
              ref={register}
              defaultChecked={notificationPrefs.sms}
            />
            Notificaciones por SMS
          </label>
        </div>
        <button type="submit">Guardar Preferencias</button>
      </form>
    </div>
  );
};

export default Preferences;