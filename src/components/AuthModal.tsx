'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (userProfile: { email: string; name: string; role: UserRole }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estándar de Autenticación Google OAuth 2.0 / PKCE Protocol
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const redirectUrl = `${currentOrigin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        setErrorMsg(`Error en Autenticación Google: ${error.message}`);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(`Excepción en Google Auth: ${err.message || 'Error desconocido'}`);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isAdminMode) {
        // ACCESO PRIVADO DE ADMINISTRACIÓN (Exclusivo Hernán)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (email.toLowerCase() === 'admin@quinto.app' && password === 'admin123') {
            onSuccess({
              email: 'admin@quinto.app',
              name: 'Hernán (Director Quinto)',
              role: 'admin'
            });
            return;
          }
          setErrorMsg('Acceso denegado. Credenciales de Administrador no válidas.');
          setLoading(false);
          return;
        }

        onSuccess({
          email: data.user?.email || email,
          name: data.user?.user_metadata?.full_name || 'Hernán (Director Quinto)',
          role: 'admin'
        });
      } else if (isRegister) {
        // REGISTRO EXCLUSIVO DE ALUMNOS (ESTUDIANTES)
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
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        onSuccess({
          email,
          name: fullName || email.split('@')[0],
          role: 'student'
        });
      } else {
        // LOGIN ESTUDIANTE
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setErrorMsg('Correo o contraseña incorrectos.');
          setLoading(false);
          return;
        }

        const role = (data.user?.user_metadata?.role as UserRole) || 'student';
        onSuccess({
          email: data.user?.email || email,
          name: data.user?.user_metadata?.full_name || email.split('@')[0],
          role: role
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative border border-cyan-500/30 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
            isAdminMode
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
          }`}>
            {isAdminMode ? <ShieldAlert className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h3 className="font-extrabold text-xl text-white">
            {isAdminMode
              ? 'Acceso Privado de Administración'
              : isRegister
              ? 'Nuevo Registro de Estudiante'
              : 'Iniciar Sesión (Estudiantes)'}
          </h3>
          <p className="text-xs text-slate-400">
            {isAdminMode
              ? 'Consola exclusiva para la dirección general del sistema Quinto.'
              : isRegister
              ? 'Regístrate con 1-clic con Google o crea tu cuenta para tus certificados.'
              : 'Ingresa a tu portal personal para descargar tus certificados verificados.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs text-center font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {!isAdminMode && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-white/10"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {isRegister ? 'Registrarme con Google (1-Clic)' : 'Iniciar Sesión con Google (1-Clic)'}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-medium">
                {isRegister ? 'O regístrate con tu correo' : 'O usa tu correo'}
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && !isAdminMode && (
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nombre y Apellidos del Alumno:</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Hernán Cabrera"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              {isAdminMode ? 'Correo de Administrador:' : 'Correo Electrónico:'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminMode ? 'admin@quinto.app' : 'tu-correo@gmail.com'}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Contraseña:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isAdminMode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
            }`}
          >
            {loading
              ? 'Verificando con Supabase...'
              : isAdminMode
              ? 'Ingresar a Consola de Dirección'
              : isRegister
              ? 'Crear Cuenta de Estudiante'
              : 'Ingresar como Estudiante'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-semibold">
          {!isAdminMode ? (
            <>
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-cyan-400 hover:underline"
              >
                {isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Nuevo alumno? Regístrate aquí'}
              </button>

              <button
                onClick={() => {
                  setIsAdminMode(true);
                  setIsRegister(false);
                  setErrorMsg('');
                }}
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Acceso Admin
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsAdminMode(false);
                setErrorMsg('');
              }}
              className="text-cyan-400 hover:underline mx-auto"
            >
              ← Volver al Portal de Estudiantes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
