'use client';

import React, { useRef } from 'react';
import { Download, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CertificateCanvasProps {
  templateUrl?: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  hashSha256: string;
  qrCodeUrl: string;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  templateUrl,
  studentName,
  courseTitle,
  issuedAt,
  hashSha256,
  qrCodeUrl
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Certificate High-Res Visual Rendering */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[1.414/1] bg-slate-900 border-2 border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-8 sm:p-12 select-none group"
        style={{
          backgroundImage: templateUrl ? `url(${templateUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* If no custom template background uploaded yet, render elegant dark gradient certificate layout */}
        {!templateUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 flex flex-col justify-between border-8 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
              <div className="flex items-center gap-3">
                <img src="/quinto_eje_exact_logo.png" alt="Quinto Eje" className="h-10 w-auto" />
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
                  Certificado Oficial de Aprobación
                </span>
              </div>
            </div>

            <div className="text-center my-6 space-y-3">
              <p className="text-xs text-slate-400 uppercase tracking-[0.25em]">Se otorga el presente diploma a:</p>
              <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white tracking-tight">
                {studentName || 'Nombre del Graduado'}
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Por haber completado y aprobado satisfactoriamente la capacitación oficial de alta especialización:
              </p>
              <h3 className="text-lg sm:text-xl font-extrabold text-cyan-300 max-w-xl mx-auto leading-snug">
                {courseTitle}
              </h3>
            </div>

            <div className="flex items-end justify-between pt-6 border-t border-slate-800/80">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Fecha de Emisión:</p>
                <p className="text-xs font-bold text-slate-200">{issuedAt}</p>
                <div className="text-[9px] font-mono text-cyan-400 mt-2 truncate max-w-[220px]">
                  Firma Criptográfica SHA-256:<br/>{hashSha256}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <img src={qrCodeUrl} alt="QR Verificación" className="w-16 h-16 rounded-lg bg-white p-1 shadow-md mx-auto" />
                  <span className="text-[8.5px] text-slate-400 font-mono block mt-1">Escanear para Validar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Overlays when Custom Template is Loaded */}
        {templateUrl && (
          <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
            <div className="text-center mt-24">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight drop-shadow-md">
                {studentName}
              </h2>
            </div>
            <div className="text-center mb-16">
              <h3 className="text-xl font-bold text-slate-800">
                {courseTitle}
              </h3>
            </div>
            <div className="flex justify-between items-end">
              <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-[10px] font-mono text-cyan-300">
                Firma SHA-256: {hashSha256}
              </div>
              <img src={qrCodeUrl} alt="QR Validar" className="w-16 h-16 bg-white p-1 rounded-lg" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleDownloadPDF}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Descargar PDF Oficial</span>
        </button>
      </div>
    </div>
  );
};
