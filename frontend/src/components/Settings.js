import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import zxcvbn from 'zxcvbn';

toast.configure();

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrapingFrequency, setScrapingFrequency] = useState('daily');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register, handleSubmit, errors } = useForm();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(`Modo ${!isDarkMode ? 'Oscuro' : 'Claro'} Activado`);
  };

  const onScrapingFrequencyChange = (e) => {
    setScrapingFrequency(e.target.value);
    toast.success(`Frecuencia de Web Scraping actualizada a ${e.target.value}`);
  };

  const onPasswordChange = (e) => {
    const password = e.target.value;
    const strength = zxcvbn(password).score;
    setPasswordStrength(strength);
  };

  const onSubmitPasswordChange = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
    } else if (passwordStrength < 3) {
      toast.error('La contraseña es demasiado débil');
    } else {
      toast.success('Contraseña actualizada exitosamente');
    }
  };

  const onProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success('Foto de perfil actualizada');
    }
  };

  const savePreferencesToBackend = async (data) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Error al guardar las preferencias');
      }
  
      const result = await response.json();
      console.log(result);  // Así evitas el warning, aunque no lo uses aún
  
      toast.success('Preferencias guardadas exitosamente');
    } catch (error) {
      toast.error('Ocurrió un error al guardar las preferencias');
    }
  };
  

  const onSubmitAdditionalInfo = async (data) => {
    await savePreferencesToBackend(data);
    console.log('Datos adicionales enviados: ', data);
  };

  return (
    <Container isDarkMode={isDarkMode}>
      <h2>Configuración</h2>

      <div>
        <h3>Frecuencia de Web Scraping</h3>
        <select value={scrapingFrequency} onChange={onScrapingFrequencyChange}>
          <option value="hourly">Cada Hora</option>
          <option value="daily">Diariamente</option>
          <option value="weekly">Semanalmente</option>
        </select>
      </div>

      <div>
        <h3>Modo Oscuro/Claro</h3>
        <button onClick={toggleDarkMode}>
          Activar {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmitPasswordChange)}>
        <h3>Cambiar Contraseña</h3>
        <input
          type="password"
          name="newPassword"
          placeholder="Nueva Contraseña"
          onChange={onPasswordChange}
          ref={register({ required: true, minLength: 6 })}
        />
        {errors.newPassword && <p>La contraseña debe tener al menos 6 caracteres</p>}
        
        <PasswordStrengthMeter score={passwordStrength} />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar Contraseña"
          ref={register({ required: true })}
        />
        {errors.confirmPassword && <p>Este campo es obligatorio</p>}
        
        <button type="submit">Cambiar Contraseña</button>
      </form>

      <div>
        <h3>Cambiar Foto de Perfil</h3>
        <input type="file" onChange={onProfilePhotoChange} />
      </div>

      <form onSubmit={handleSubmit(onSubmitAdditionalInfo)}>
        <h3>Información de Perfil</h3>

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          ref={register({
            required: 'El correo electrónico es obligatorio',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Formato de correo electrónico inválido'
            }
          })}
        />
        {errors.email && <p>{errors.email.message}</p>}
        
        <input
          type="text"
          name="address"
          placeholder="Dirección"
          ref={register}
        />

        <label>Preferencias de Comunicación</label>
        <select name="communication" ref={register}>
          <option value="email">Correo electrónico</option>
          <option value="sms">SMS</option>
          <option value="none">Ninguno</option>
        </select>

        <button type="submit">Guardar Información</button>
      </form>
    </Container>
  );
};

const PasswordStrengthMeter = ({ score }) => {
  const strengthLabels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
  return (
    <div>
      <p>Fortaleza de la contraseña: {strengthLabels[score]}</p>
      <div className="strength-meter">
        <div className={`strength-${score}`} />
      </div>
    </div>
  );
};

const Container = styled.div`
  background-color: ${(props) => (props.isDarkMode ? '#333' : '#fff')};
  color: ${(props) => (props.isDarkMode ? '#fff' : '#000')};
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  margin: auto;

  input, select {
    display: block;
    margin: 10px 0;
  }

  button {
    margin-top: 10px;
  }

  .strength-meter {
    height: 5px;
    background: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 5px;
  }

  .strength-0 {
    width: 20%;
    background: red;
  }

  .strength-1 {
    width: 40%;
    background: orange;
  }

  .strength-2 {
    width: 60%;
    background: yellow;
  }

  .strength-3 {
    width: 80%;
    background: lightgreen;
  }

  .strength-4 {
    width: 100%;
    background: green;
  }
`;

export default Settings;