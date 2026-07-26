'use client';

import React, { useState } from 'react';
import { Award, Download, Share2, ShieldCheck, Truck, CheckCircle2, FileCode } from 'lucide-react';
import { Certificate } from '@/types';
import { PhysicalDeliveryModal } from './PhysicalDeliveryModal';
import confetti from 'canvas-confetti';

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
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (certificates.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-xl mx-auto border border-slate-800">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-xl text-white">Aún no tienes certificados emitidos</h3>
        <p className="text-slate-400 text-sm">
          Completa un programa en el Catálogo de Cursos y procesa el comprobante para liberar tu primer certificado oficial.
        </p>
      </div>
    );
  }

  const cert = certificates[0];

  const handleDownloadPDF = () => {
    // Printable Vectorized Window PDF Stream
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificado_${cert.student_name.replace(/\s+/g, '_')}</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { margin: 0; padding: 40px; background: #0f172a; color: #ffffff; font-family: 'Times New Roman', serif; text-align: center; }
          .cert-box { border: 12px double #f59e0b; padding: 40px; background: #0f172a; height: 85vh; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
          .title { font-size: 32px; color: #f59e0b; letter-spacing: 2px; }
          .student { font-size: 38px; color: #ffffff; margin: 20px 0; border-bottom: 2px solid #f59e0b; display: inline-block; padding-bottom: 5px; }
          .course { font-size: 26px; color: #06b6d4; margin: 15px 0; font-family: sans-serif; font-weight: bold; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; }
          .hash { font-family: monospace; font-size: 10px; color: #94a3b8; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div className="cert-box">
          <div>
            <div className="title">QUINTO ACADEMY • CERTIFICADO DE EXCELENCIA</div>
            <p style="color: #94a3b8; font-size: 14px;">Otorgado a:</p>
            <div className="student">${cert.student_name}</div>
            <p style="color: #cbd5e1; font-size: 14px;">Por completar satisfactoriamente el programa académico:</p>
            <div className="course">${cert.course_title}</div>
            <p style="color: #94a3b8; font-size: 13px;">Intensidad Horaria: ${cert.academic_hours} Horas Lectivas • Fecha: ${cert.issued_at}</p>
          </div>
          <div className="footer">
            <div style="text-align: left; font-size: 12px;">
              <strong>${cert.instructor_name}</strong><br/>
              <span>Director de Certificación Quinto</span>
            </div>
            <img src="${cert.qr_code_url}" width="100" height="100" />
          </div>
          <div className="hash">SHA-256: ${cert.hash_sha256}</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Mis Certificados Digitales</h1>
          <p className="text-slate-400 text-xs">Documentos académicos validados con sello SHA-256 e impresos en alta definición.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerConfetti}
            className="px-4 py-2 bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 font-semibold rounded-xl text-xs transition-all flex items-center gap-2"
          >
            🎉 Celebrar Logro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="certificate-border p-8 rounded-2xl text-center space-y-6 relative bg-slate-950/90">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-1 shadow-xl">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold tracking-widest text-amber-400 uppercase">QUINTO ACADEMY • CERTIFICADO DE EXCELENCIA</span>
              <h2 className="text-3xl font-serif font-bold text-gradient-gold">Otorgado a:</h2>
            </div>

            <div className="py-2 border-b border-amber-500/20 max-w-md mx-auto">
              <h3 className="text-3xl font-serif font-extrabold text-white tracking-wide">{cert.student_name}</h3>
            </div>

            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              Por haber completado y aprobado satisfactoriamente el programa académico de especialización profesional:
            </p>

            <h4 className="text-xl font-bold text-cyan-400">{cert.course_title}</h4>

            <p className="text-xs text-slate-400">
              Con una intensidad horaria de <strong>{cert.academic_hours} Horas Lectivas</strong>. Fecha de emisión: {cert.issued_at}.
            </p>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between px-6">
              <div className="text-left text-xs space-y-1">
                <p className="font-bold text-slate-300">{cert.instructor_name}</p>
                <p className="text-slate-500 text-[10px]">Director de Certificación Quinto</p>
              </div>

              <div className="p-2 bg-white rounded-xl shadow-md">
                <img src={cert.qr_code_url} alt="QR Code" className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base">Opciones del Documento</h4>
            <p className="text-xs text-slate-400">Exporta o solicita el despacho de tu diploma.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar PDF Real (300 DPI)
            </button>

            <button
              onClick={() => setShowDeliveryModal(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Solicitar Envío Físico "A Tu Puerta"
            </button>

            <button
              onClick={() => onVerifyHash(cert.hash_sha256)}
              className="w-full py-3 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verificar Sello SHA-256
            </button>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block">Firma Criptográfica Inmutable:</span>
            <p className="font-mono text-[10px] text-cyan-400 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
              {cert.hash_sha256}
            </p>
          </div>
        </div>
      </div>

      {showDeliveryModal && (
        <PhysicalDeliveryModal
          certificate={cert}
          onClose={() => setShowDeliveryModal(false)}
          onSubmitDelivery={(data) => {
            onAddDelivery(data);
            setShowDeliveryModal(false);
          }}
        />
      )}
    </div>
  );
};
