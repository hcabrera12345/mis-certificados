'use client';

import React from 'react';
import { Award, BookOpen, ShieldCheck, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import { UserRole } from '@/types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userProfile: { email: string; name: string; role: UserRole } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  userProfile,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Official Quinto Eje Branding Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setCurrentTab('courses')}
        >
          <img 
            src="/quinto_eje_logo.png" 
            alt="Quinto Eje Ingeniería" 
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="hidden lg:block pl-2 border-l border-slate-800">
            <span className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              Mis Certificados
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-mono">
                Digital
              </span>
            </span>
            <p className="text-[10px] text-slate-400">Plataforma Oficial de Verificación</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('courses')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentTab === 'courses'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catálogo Cursos</span>
          </button>

          {/* Mis Certificados Tab: Shown ONLY when user is authenticated */}
          {userProfile && (
            <button
              onClick={() => setCurrentTab('my-certificates')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                currentTab === 'my-certificates'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Mis Certificados</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('verify')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentTab === 'verify'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validación QR</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </nav>

        {/* User Profile or Prominent "Autenticarme" Button */}
        <div className="flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 pl-3.5 pr-2 rounded-2xl border border-slate-800">
              <div className="text-right block text-xs">
                <p className="font-extrabold text-white leading-snug">{userProfile.name}</p>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                  userProfile.role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {userProfile.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700/60 transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 border border-cyan-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 animate-pulse-subtle"
            >
              <LogIn className="w-4 h-4 text-cyan-200" />
              <span>Autenticarme</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
