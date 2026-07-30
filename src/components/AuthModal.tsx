'use client';

import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types';
import { supabase } from '@/lib/supabaseClient';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (profile: { email: string; name: string; role: UserRole }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  // mode: 'signup' (Crear Cuenta) | 'signin' (Iniciar Sesión) | 'admin' (Acceso Director)
  const [authTab, setAuthTab] = useState<'signup' | 'signin' | 'admin'>('signup');
  const [email, setEmail] = useState('admin@quinto.app');
  const [password, setPassword] = useState('QuintoEje2026');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://mis-certificados.quinto.app';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentOrigin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      if (error) setErrorMsg(error.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1-Click Instant Admin Login for Hernan (No password error, zero validation)
    if (authTab === 'admin') {
      onSuccess({
        email: email.trim() || 'admin@quinto.app',
        name: 'Hernán (Director Quinto)',
        role: 'admin'
      });
      onClose();
      return;
    }
try {

      // 2. Modo Iniciar Sesión (Sign In)
      if (authTab === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          const isUserAdmin = email.toLowerCase() === '';
          onSuccess({
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: isUserAdmin ? 'admin' : 'student'
          });
          onClose();
          return;
        }
      }

      // 3. Modo Crear Cuenta (Sign Up)
      if (authTab === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('Por favor ingresa tu nombre y apellido completo.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'student'
            }
          }
        });

        if (error) {
          if (
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already in use') ||
            error.code === 'user_already_exists'
          ) {
            setErrorMsg('⚠️ Este correo electrónico ya se encuentra registrado en el sistema. Por favor conmuta a la pestaña "Iniciar Sesión" o utiliza "Google (1-Clic)".');
            setLoading(false);
            return;
          }
          throw error;
        }

        if (data.user) {
          if (data.session) {
            onSuccess({
              email: data.user.email || email,
              name: fullName,
              role: 'student'
            });
            onClose();
          } else {
            alert(`¡Registro completado! Se ha enviado un correo de confirmación a ${email}. Por favor revisa tu bandeja para activar tu cuenta.`);
            onClose();
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/50 overflow-hidden font-sans">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                {authTab === 'admin' ? (
                  <Shield className="w-5 h-5 text-amber-400" />
                ) : (
                  <User className="w-5 h-5 text-cyan-400" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {authTab === 'admin' ? 'Acceso de Dirección' : 'Plataforma Quinto'}
              </h2>
              <p className="text-xs text-slate-400">
                {authTab === 'admin' ? 'Consola Privada de Administración' : 'Emisión & Autenticidad Digital'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: Sign Up vs Sign In */}
        {authTab !== 'admin' && (
          <div className="p-2 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-2 px-6 pt-4 pb-2">
            <button
              type="button"
              onClick={() => {
                setAuthTab('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                authTab === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Crear Cuenta (Sign Up)
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                authTab === 'signin'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión (Sign In)
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Error / Notification Alert */}
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google 1-Click Button */}
          {authTab !== 'admin' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-800/90 hover:bg-slate-800 text-white font-semibold rounded-2xl text-xs border border-slate-700/80 shadow-md transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.3-.7-.5-1.5-.5-2.3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"
                  />
                </svg>
                <span>Continuar con Google (1-Clic)</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-mono uppercase tracking-wider">
                  o con tu correo
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre y Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Hernán Cabrera Pantoja"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required={authTab !== 'admin'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@quinto.app"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required={authTab !== 'admin'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                authTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-amber-500/20'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : authTab === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Crear Cuenta de Usuario
                </>
              ) : authTab === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Ingresar a Consola de Dirección (1-Clic)
                </>
              )}
            </button>
          </form>

          {/* Switch to Admin mode */}
          <div className="pt-2 text-center">
            {authTab === 'admin' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMsg('');
                }}
                className="text-[11px] text-slate-400 hover:text-cyan-400 font-semibold underline underline-offset-4 transition-all"
              >
                ← Volver al Registro de Usuarios
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthTab('admin');
                  setEmail('');
                  setPassword('');
                  setErrorMsg('');
                }}
                className="text-[11px] text-slate-500 hover:text-amber-400 font-medium transition-all"
              >
                Acceso Privado de Dirección General (Admin)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
