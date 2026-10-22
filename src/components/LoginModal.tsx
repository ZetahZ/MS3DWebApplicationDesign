import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setLoading(true);

    try {
      const endpoint = isRegistering
        ? 'http://127.0.0.1:8000/api/v1/auth/register'
        : 'http://127.0.0.1:8000/api/v1/auth/login';

      const bodyData = isRegistering
        ? { nombre, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ocurrió un error en la autenticación');
      }

      if (isRegistering) {
        // El registro ya no entra directo: hay que verificar el correo primero
        setAviso(data.message || 'Te enviamos un código a tu correo.');
        setVerificando(true);
        setCodigo('');
        return;
      }

      console.log('Login exitoso:', data);

      // Guardamos la sesión en el navegador
      localStorage.setItem('user', JSON.stringify(data.user || data));

      if (onLoginSuccess) {
        onLoginSuccess(data.user || data);
      }

      // Limpiamos y cerramos
      setEmail('');
      setPassword('');
      setNombre('');
      onClose();

      // Recargamos la página para que el Header refleje el nombre del usuario al instante
      window.location.reload();

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: codigo.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo verificar el correo');
      }

      // Correo verificado: volvemos al login para que ingrese
      setVerificando(false);
      setIsRegistering(false);
      setCodigo('');
      setPassword('');
      setAviso('Correo verificado. Ahora iniciá sesión con tu cuenta.');

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const volverAlFormulario = () => {
    setVerificando(false);
    setCodigo('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-cyan-500/30 bg-slate-900 p-8 shadow-2xl shadow-cyan-500/10">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Título */}
        <h2 className="mb-2 text-2xl font-bold tracking-wider text-cyan-400">
          {verificando ? 'VERIFICAR CORREO' : isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
        </h2>
        <p className="mb-6 text-xs text-gray-400">
          {verificando
            ? `Ingresá el código de 6 dígitos que te enviamos a ${email}`
            : isRegistering
              ? 'Ingresa tus datos para registrarte en M\'s3D'
              : 'Accede a tu cuenta para gestionar tus pedidos 3D'}
        </p>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Mensaje de Aviso */}
        {aviso && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
            {aviso}
          </div>
        )}

        {/* Paso de verificación por código */}
        {verificando ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Código de verificación
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="123456"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-lg tracking-[0.5em] text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || codigo.trim().length !== 6}
              className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar correo'}
            </button>

            <div className="text-center text-xs text-gray-400">
              ¿Te equivocaste de correo o no llegó?{' '}
              <button
                type="button"
                onClick={volverAlFormulario}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Volver y reintentar
              </button>
            </div>
          </form>
        ) : (
          /* Formulario Login / Registro */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Ingresar'}
            </button>
          </form>
        )}

        {/* Toggle para alternar entre Login y Registro */}
        {!verificando && (
          <div className="mt-6 text-center text-xs text-gray-400">
            {isRegistering ? (
              <p>
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(null); setAviso(null); }}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Inicia sesión aquí
                </button>
              </p>
            ) : (
              <p>
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setError(null); setAviso(null); }}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Regístrate gratis
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
