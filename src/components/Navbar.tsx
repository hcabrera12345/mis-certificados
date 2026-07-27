'use client';

import React from 'react';
import { Award, BookOpen, ShieldCheck, UserCheck, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('courses')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div>
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              Mis Certificados
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-mono">
                Quinto
              </span>
            </span>
            <p className="text-[10px] text-slate-400">Emisión & Autenticidad Digital</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60 text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('courses')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentTab === 'courses'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Catálogo Cursos
          </button>

          <button
            onClick={() => setCurrentTab('certificates')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentTab === 'certificates'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Mis Certificados
          </button>

          <button
            onClick={() => setCurrentTab('verify')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              currentTab === 'verify'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Validación QR
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-3">
              <div className="text-right block text-xs">
                <p className="font-bold text-white">{userProfile.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  userProfile.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {userProfile.role === 'admin' ? 'Administrador' : 'Estudiante'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Autenticarme
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
