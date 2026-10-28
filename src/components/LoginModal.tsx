import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: any) => void;
  onNavigate: (view: any) => void;  
}

type Vista = 'form' | 'verify' | 'forgot' | 'reset' | 'admin-login';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, onNavigate }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [vista, setVista] = useState<Vista>('form');
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const volverALogin = (mensaje?: string) => {
    setVista('form');
    setIsRegistering(false);
    setCodigo('');
    setNuevaPassword('');
    setError(null);
    setAviso(mensaje || null);
  };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ocurrió un error en la autenticación');
      }

      if (isRegistering) {
        setAviso(data.message || 'Te enviamos un código a tu correo.');
        setVista('verify');
        setCodigo('');
        return;
      }

      console.log('Login exitoso:', data);
      
      // Extraemos el ID sin importar si viene en data.id o data.user.id
      const userObj = data.user || data;
      const userId = data.id || userObj.id;

      // GUARDADO EN LOCALSTORAGE PARA M'S3D
      if (userId) {
        localStorage.setItem('user_id', userId.toString());
      }
      localStorage.setItem('user', JSON.stringify(userObj));

      if (onLoginSuccess) {
        onLoginSuccess(userObj);
      }

      setEmail('');
      setPassword('');
      setNombre('');
      onClose();
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

      setPassword('');
      volverALogin('Correo verificado. Ahora iniciá sesión con tu cuenta.');

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo enviar el código');
      }

      setAviso(data.message || 'Si ese correo está registrado, te llegó un código.');
      setVista('reset');
      setCodigo('');

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: codigo.trim(), nueva_password: nuevaPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo cambiar la contraseña');
      }

      setPassword('');
      volverALogin('Contraseña actualizada. Iniciá sesión con la nueva.');

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const titulos: Record<Vista, string> = {
    form: isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN',
    verify: 'VERIFICAR CORREO',
    forgot: 'RECUPERAR CONTRASEÑA',
    reset: 'CONTRASEÑA NUEVA',
    'admin-login': 'ACCESO ADMINISTRADOR',
  };

  const subtitulos: Record<Vista, string> = {
    form: isRegistering
      ? 'Ingresa tus datos para registrarte en M\'s3D'
      : 'Accede a tu cuenta para gestionar tus pedidos 3D',
    verify: `Ingresá el código de 6 dígitos que te enviamos a ${email}`,
    forgot: 'Escribí tu correo y te mandamos un código para cambiar la contraseña',
    reset: `Ingresá el código que te enviamos a ${email} y elegí tu contraseña nueva`,
    'admin-login': 'Introduce tus credenciales de gestión interna',
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setAviso(null);
  setLoading(true);

  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Credenciales de administrador incorrectas');
    }

    const userObj = data.user || data;

    // Solo deja pasar si la base dice que es admin de verdad
    if (userObj.is_admin !== true) {
      throw new Error('Esta cuenta no es administradora.');
    }

    const userId = data.id || userObj.id;

    if (userId) {
      localStorage.setItem('user_id', userId.toString());
    }
    localStorage.setItem('user', JSON.stringify(userObj));

    if (onLoginSuccess) {
      onLoginSuccess(userObj);
    }

    setEmail('');
    setPassword('');
    onClose();

    // Redirige directamente al panel de administración tras loguearse con éxito
    if (onNavigate) {
      onNavigate({ page: 'admin' });
    } else {
      window.location.reload();
    }

  } catch (err: any) {
    setError(err.message || 'Error al conectar con el servidor');
  } finally {
    setLoading(false);
  }
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
          {titulos[vista]}
        </h2>
        <p className="mb-6 text-xs text-gray-400">
          {subtitulos[vista]}   
        </p>

        {/* Mensaje de Error */}
        {typeof error === 'string' && error.trim() !== '' ? (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
           {error}
          </div>
        ) : null}    

        {/* Mensaje de Aviso */}
        {typeof aviso === 'string' && aviso.trim() !== '' ? (
         <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
          {aviso}
         </div>
        ) : null}

        {/* Paso: código de verificación de registro */}
        {vista === 'verify' && (
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
                onClick={() => { setVista('form'); setCodigo(''); setError(null); }}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Volver y reintentar
              </button>
            </div>
          </form>
        )}

        {/* Paso: pedir correo para recuperar */}
        {vista === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>

            <div className="text-center text-xs text-gray-400">
              ¿Te acordaste?{' '}
              <button
                type="button"
                onClick={() => volverALogin()}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Volver a iniciar sesión
              </button>
            </div>
          </form>
        )}

        {/* Paso: Login de Administrador */}
        {vista === 'admin-login' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Correo de Administrador
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ms3d.com"
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
              {loading ? 'Verificando...' : 'Entrar al Panel Admin'}
            </button>

            <div className="text-center text-xs text-gray-400">
              ¿No eres administrador?{' '}
              <button
                type="button"
                onClick={() => volverALogin()}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Volver al login normal
              </button>
            </div>
          </form>
        )}

        {/* Paso: código + contraseña nueva */}
        {vista === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Código
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

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Contraseña nueva
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || codigo.trim().length !== 6 || !nuevaPassword}
              className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>

            <div className="text-center text-xs text-gray-400">
              ¿No llegó el código?{' '}
              <button
                type="button"
                onClick={() => { setVista('forgot'); setError(null); }}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Reenviar
              </button>
            </div>
          </form>
        )}

        {/* Formulario Login / Registro */}
        {vista === 'form' && (
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

            {!isRegistering && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setVista('forgot'); setError(null); setAviso(null); }}
                  className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

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
        {vista === 'form' && (
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
              <div className="flex items-center justify-center gap-2">
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
                <span className="text-slate-600">|</span>
                <button
                 type="button"
                 onClick={() => {
                  setVista('admin-login');
                  setError(null);
                  setAviso(null);
                 }}
                 className="text-cyan-400 hover:underline font-semibold"
                >
                 Administrador
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );  
};