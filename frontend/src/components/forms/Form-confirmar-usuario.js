import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


export default function FormConfirmarUsuario() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('confirming');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const hasConfirmed = useRef(false);

  useEffect(() => {
    const confirmAccount = async () => {
      if (!token || hasConfirmed.current) {
        return;
      }
      hasConfirmed.current = true;

      try {
        const response = await axios.post('http://localhost:4000/user/confirmar-usuario', { token });

        if (response.status === 200) {
          setStatus('success');
          setMessage('Tu cuenta ha sido confirmada exitosamente.');
          // Opcional: Redirigir al usuario a la página de inicio o login
          // navigate('/login');
        } else {
          setStatus('error');
          setMessage('El enlace de confirmación es inválido o ha expirado.');
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          setMessage(error.response.data.error);
        } else {
          setMessage('Ocurrió un error al confirmar tu cuenta. Por favor, intenta de nuevo.');
        }
        setStatus('error');
      }
    };

    confirmAccount();
  }, [token, navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-md shadow-md text-center">
      {status === 'confirming' && <p>Confirmando tu cuenta...</p>}
      {status === 'success' && <p className="text-green-600">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
    </div>
  );
}
