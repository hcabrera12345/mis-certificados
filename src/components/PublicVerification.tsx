'use client';

import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, ExternalLink, Calendar, User, BookOpen } from 'lucide-react';
import { Certificate } from '@/types';

interface PublicVerificationProps {
  certificates: Certificate[];
  initialHash?: string;
}

export const PublicVerification: React.FC<PublicVerificationProps> = ({ certificates, initialHash = '' }) => {
  const [searchHash, setSearchHash] = useState(initialHash);
  const [foundCert, setFoundCert] = useState<Certificate | null>(
    certificates.find((c) => c.hash_sha256 === initialHash) || (certificates.length > 0 ? certificates[0] : null)
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = certificates.find((c) => c.hash_sha256.toLowerCase().trim() === searchHash.toLowerCase().trim());
    setFoundCert(result || null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 border border-emerald-500/30 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-9 h-9 animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Portal Público de Validación de Autenticidad</h1>
          <p className="text-slate-400 text-xs mt-1">Verifica la validez criptográfica SHA-256 de cualquier certificado emito en el Ecosistema Quinto.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto pt-2">
          <input
            type="text"
            placeholder="Pega aquí el Hash SHA-256 (64 caracteres)..."
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            Validar
          </button>
        </form>
      </div>

      {/* Result Display */}
      {foundCert ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 space-y-6 shadow-2xl">
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-extrabold text-emerald-300 text-lg">CERTIFICADO AUTÉNTICO Y VÁLIDO</h3>
              <p className="text-xs text-emerald-400/90">Firma digital e integridad verificadas en la base de datos de Quinto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" /> Graduado / Alumno:
              </span>
              <p className="text-base font-bold text-white">{foundCert.student_name}</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Programa Académico:
              </span>
              <p className="text-base font-bold text-white">{foundCert.course_title}</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" /> Fecha de Emisión:
              </span>
              <p className="text-sm font-bold text-slate-200">{foundCert.issued_at}</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Entidad Emisora:
              </span>
              <p className="text-sm font-bold text-amber-400">Quinto Academy Official</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
            <span className="text-slate-400 font-semibold">Sello Digital SHA-256 Verificado:</span>
            <p className="font-mono text-emerald-400 break-all text-[11px]">{foundCert.hash_sha256}</p>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl border border-red-500/30 text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="font-bold text-lg text-white">No se encontró ningún certificado registrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Por favor, revisa el código Hash e inténtalo nuevamente. Asegúrate de escanear el código QR impreso en el certificado original.
          </p>
        </div>
      )}
    </div>
  );
};
