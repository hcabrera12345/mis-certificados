'use client';

import React from 'react';
import { Award, Download, CheckCircle, ExternalLink, Calendar, Clock, ShieldCheck, User } from 'lucide-react';
import { Certificate } from '@/types';

interface CertificateViewerProps {
  certificates: Certificate[];
  onVerifyHash: (hash: string) => void;
  onAddDelivery: (delivery: any) => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  certificates,
  onVerifyHash,
  onAddDelivery
}) => {
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Mis Certificados & Diplomas Digitales</h1>
            <p className="text-xs text-slate-400">Emisión digital oficial con verificación pública mediante Hash SHA-256</p>
          </div>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <Award className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">Aún no cuentas con certificados emitidos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            Inscríbete en nuestros cursos del catálogo y completa tus comprobantes de pago para recibir tus certificados oficiales.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Emitido & Auténtico
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {cert.issued_at}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {cert.course_title}
                </h3>

                <div className="space-y-2 mb-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Otorgado a: <strong className="text-slate-200">{cert.student_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Carga Académica: <strong className="text-slate-200">{cert.academic_hours} horas lectivas</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl mb-6 text-[11px] font-mono text-slate-400">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Firma Criptográfica SHA-256:</div>
                  <div className="truncate text-cyan-300">{cert.hash_sha256}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => alert(`Descargando Certificado Oficial PDF de ${cert.course_title}...`)}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>

                <button
                  onClick={() => onVerifyHash(cert.hash_sha256)}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Verificar QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
