import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Lock, Mail, User as UserIcon, Phone, ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface AuthViewProps {
  onNavigate: (view: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const { login, register, quickLoginAs, user, logout } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Generic error message as explicitly specified
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      login(loginEmail, loginPassword);
      showToast('¡Sesión iniciada con éxito!', 'success');
      onNavigate('home');
    } catch (err: any) {
      // Generic error message as required: "Credenciales inválidas"
      setErrorMessage('Credenciales inválidas');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      });
      showToast('¡Registro completado exitosamente!', 'success');
      onNavigate('home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar usuario.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      
      {/* If already logged in, show current user and fast switch */}
      {user ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F9E3E3] flex items-center justify-center text-[#B3202A]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B3202A]">
              Sesión Iniciada
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1">{user.name}</h2>
            <p className="text-xs text-stone-500">{user.email}</p>
            <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#F9E3E3] text-[#8B1820]">
              Rol: {user.role}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Ir a la Tienda
            </button>
            <button
              onClick={() => { logout(); showToast('Sesión cerrada.', 'info'); }}
              className="px-5 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          
          {/* Header Tabs */}
          <div className="grid grid-cols-2 bg-stone-100 border-b border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`py-3.5 text-center transition-colors ${
                mode === 'login'
                  ? 'bg-white text-[#8B1820] border-t-2 border-[#B3202A]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`py-3.5 text-center transition-colors ${
                mode === 'register'
                  ? 'bg-white text-[#8B1820] border-t-2 border-[#B3202A]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Registrar Cuenta
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Generic Error Banner as specified */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@ganadocarnes.com"
                      className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Las contraseñas se almacenan y verifican de forma segura.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Entrar a GanadoCarnes
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nombre Completo o Razón Social *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Carlos Restrepo"
                      className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="carlos@hacienda.com"
                      className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Teléfono Móvil
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+57 310 000 0000"
                      className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repita la contraseña"
                      className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Crear Cuenta de Cliente
                </button>
              </form>
            )}

            {/* Quick Demo Switcher for Evaluation */}
            <div className="pt-6 border-t border-stone-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block text-center">
                Usuarios de Demostración (Acceso en 1 Clic)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { quickLoginAs('Administrador'); onNavigate('home'); }}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-[#B3202A] hover:bg-rose-50 text-left transition-all"
                >
                  <p className="font-bold text-[#8B1820]">Administrador</p>
                  <p className="text-[10px] text-stone-500">admin@ganadocarnes.com</p>
                  <p className="text-[10px] text-stone-400 font-mono">pass: admin123</p>
                </button>

                <button
                  type="button"
                  onClick={() => { quickLoginAs('Vendedor'); onNavigate('home'); }}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-[#B3202A] hover:bg-rose-50 text-left transition-all"
                >
                  <p className="font-bold text-[#8B1820]">Vendedor</p>
                  <p className="text-[10px] text-stone-500">vendedor@ganadocarnes.com</p>
                  <p className="text-[10px] text-stone-400 font-mono">pass: vendedor123</p>
                </button>

                <button
                  type="button"
                  onClick={() => { quickLoginAs('Cliente'); onNavigate('home'); }}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-[#B3202A] hover:bg-rose-50 text-left transition-all"
                >
                  <p className="font-bold text-[#8B1820]">Cliente</p>
                  <p className="text-[10px] text-stone-500">cliente@ganadocarnes.com</p>
                  <p className="text-[10px] text-stone-400 font-mono">pass: cliente123</p>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
