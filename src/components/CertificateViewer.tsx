'use client';

import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, ExternalLink, Calendar, User } from 'lucide-react';
import { Certificate } from '@/types';
import { CertificateCanvas } from './CertificateCanvas';

interface CertificateViewerProps {
  certificates: Certificate[];
  onVerifyHash: (hash: string) => void;
  onAddDelivery?: (delivery: any) => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  certificates,
  onVerifyHash
}) => {
  const [templateUrl, setTemplateUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedTemplate = localStorage.getItem('quinto_cert_template_url');
    if (savedTemplate) {
      setTemplateUrl(savedTemplate);
    }
  }, []);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Mis Certificados Digitales Oficiales</h1>
            <p className="text-xs sm:text-sm text-slate-400">Emisión digital autenticada con sello criptográfico SHA-256 y verificación QR</p>
          </div>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <Award className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">Aún no cuentas con certificados emitidos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Inscríbete en nuestros cursos del catálogo y completa tu comprobante de pago. Al ser aprobado por Dirección, tu diploma digital se emitirá automáticamente aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-2xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 inline-block">
                    <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                    Certificado Válido & Auténtico
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-2">{cert.course_title}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {cert.issued_at}
                  </span>
                  <button
                    onClick={() => onVerifyHash(cert.hash_sha256)}
                    className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verificar QR
                  </button>
                </div>
              </div>

              {/* Render High-Res Certificate Diploma Canvas */}
              <CertificateCanvas
                templateUrl={templateUrl}
                studentName={cert.student_name}
                courseTitle={cert.course_title}
                issuedAt={cert.issued_at}
                hashSha256={cert.hash_sha256}
                qrCodeUrl={cert.qr_code_url}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
