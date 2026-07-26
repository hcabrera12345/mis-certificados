'use client';

import React from 'react';
import { Award, ShieldCheck, LayoutDashboard, BookOpen, User, Sparkles } from 'lucide-react';
import { UserRole } from '@/types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole
}) => {
  return (
    <nav className="w-full glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-cyan-500/20">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('courses')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white">Mis Certificados</span>
            <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
              Quinto Ecosystem
            </span>
          </div>
          <p className="text-xs text-slate-400">Emisión Criptográfica & OCR AI</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setCurrentTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            currentTab === 'courses'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Cursos
        </button>

        <button
          onClick={() => setCurrentTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            currentTab === 'certificates'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Award className="w-4 h-4" />
          Mis Certificados
        </button>

        <button
          onClick={() => setCurrentTab('verify')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            currentTab === 'verify'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Validar QR
        </button>

        <button
          onClick={() => setCurrentTab('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            currentTab === 'admin'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Admin Dashboard
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-medium">Modo Demo:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-slate-800 text-cyan-400 text-xs font-bold rounded-lg px-2 py-1 border border-cyan-500/30 focus:outline-none"
          >
            <option value="student">Estudiante (María R.)</option>
            <option value="admin">Administrador (Director Quinto)</option>
          </select>
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 cursor-pointer">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </div>
    </nav>
  );
};
