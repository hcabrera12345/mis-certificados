'use client';

import React, { useRef, useState } from 'react';
import { Download, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    setDownloading(true);

    try {
      // 1. Capture ONLY the certificate element at 300 DPI (scale 3)
      const canvas = await html2canvas(containerRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#090d16',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // 2. Create A4 Landscape PDF (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      // 3. Download Clean Standalone PDF File
      const safeName = (studentName || 'Graduado').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Certificado_Oficial_${safeName}.pdf`);
    } catch (err) {
      console.error('Error generando PDF de alta resolucion:', err);
      alert('Se produjo un inconveniente al generar el PDF. Por favor reintenta.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Isolated High-Res Printable Certificate Element */}
      <div 
        ref={containerRef}
        id="certificate-print-area"
        className="relative w-full aspect-[1.414/1] bg-slate-950 border-4 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-8 sm:p-14 select-none"
        style={{
          backgroundImage: templateUrl ? `url(${templateUrl})` : undefined,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* If no custom background template, render clean dark luxury diploma layout */}
        {!templateUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 flex flex-col justify-between border-[12px] border-slate-900/90">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
              <div className="flex items-center gap-3">
                <img src="/quinto_eje_exact_logo.png" alt="Quinto Eje" className="h-10 w-auto" />
              </div>
              <div className="text-right">
                <span className="px-3.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-bold tracking-widest uppercase">
                  Diploma Oficial de Certificación
                </span>
              </div>
            </div>

            {/* Central Student & Course Info */}
            <div className="text-center my-4 space-y-4">
              <p className="text-xs text-slate-400 uppercase tracking-[0.3em] font-semibold">
                Otorgado oficialmente a favor de:
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white tracking-tight leading-tight py-1">
                {studentName || 'Nombre del Graduado'}
              </h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                Por haber completado y aprobado satisfactoriamente el programa de alta especialización técnica:
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-cyan-300 max-w-2xl mx-auto leading-snug tracking-tight">
                {courseTitle}
              </h3>
            </div>

            {/* Footer Signatures, Hash & QR */}
            <div className="flex items-end justify-between pt-6 border-t border-slate-800/80">
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Fecha de Emisión:</p>
                <p className="text-xs font-bold text-slate-200">{issuedAt}</p>
                <div className="text-[9.5px] font-mono text-cyan-400/90 mt-2 truncate max-w-[260px] bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <span className="text-[8px] text-slate-500 block uppercase">Firma Criptográfica SHA-256:</span>
                  {hashSha256}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <img src={qrCodeUrl} alt="QR Verificación" className="w-20 h-20 rounded-xl bg-white p-1.5 shadow-lg mx-auto" />
                  <span className="text-[8.5px] text-slate-400 font-mono block mt-1.5 font-bold">Escanear para Validar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Template Overlay when template image is uploaded */}
        {templateUrl && (
          <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none p-6">
            <div className="text-center mt-28">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight drop-shadow-md">
                {studentName}
              </h2>
              <p className="text-lg font-bold text-slate-800 mt-6">{courseTitle}</p>
            </div>

            <div className="flex justify-between items-end">
              <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-300">
                SHA-256: {hashSha256}
              </div>
              <img src={qrCodeUrl} alt="QR" className="w-16 h-16 bg-white p-1 rounded-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Download Action Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 border border-amber-400/30 transition-all flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
              <span>Generando Documento PDF en HD...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-amber-200" />
              <span>Descargar PDF Oficial (Documento Independiente HD)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
