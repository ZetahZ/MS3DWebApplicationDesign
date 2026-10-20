    import React, { useState } from 'react';

    interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    }

    export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegistering) {
        console.log('Registrando usuario:', { nombre, email, password });
        // Aquí conectas con tu backend (API / PostgreSQL)
        } else {
        console.log('Iniciando sesión:', { email, password });
        // Aquí envías la petición de login
        }
        onClose();
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
            {isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
            </h2>
            <p className="mb-6 text-xs text-gray-400">
            {isRegistering
                ? 'Ingresa tus datos para registrarte en M\'s3D'
                : 'Accede a tu cuenta para gestionar tus pedidos 3D'}
            </p>

            {/* Formulario */}
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
                className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]"
            >
                {isRegistering ? 'Registrarse' : 'Ingresar'}
            </button>
            </form>

            {/* Toggle para alternar entre Login y Registro */}
            <div className="mt-6 text-center text-xs text-gray-400">
            {isRegistering ? (
                <p>
                ¿Ya tienes cuenta?{' '}
                <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
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
                    onClick={() => setIsRegistering(true)}
                    className="text-cyan-400 hover:underline font-semibold"
                >
                    Regístrate gratis
                </button>
                </p>
            )}
            </div>
        </div>
        </div>
    );
    };