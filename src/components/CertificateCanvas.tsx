'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, CheckCircle2, ShieldCheck, Loader2, FileText, BookOpen } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
  const [downloading, setDownloading] = useState(false);
  const [downloadingGuide, setDownloadingGuide] = useState(false);
  const [hasPdfTemplate, setHasPdfTemplate] = useState(false);

  useEffect(() => {
    const savedPdfData = localStorage.getItem('quinto_cert_pdf_template_data');
    if (savedPdfData) {
      setHasPdfTemplate(true);
    }
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const savedPdfData = localStorage.getItem('quinto_cert_pdf_template_data');
      let pdfBytes: Uint8Array;

      if (savedPdfData && savedPdfData.startsWith('data:application/pdf')) {
        const base64Data = savedPdfData.split(',')[1];
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const pdfDoc = await PDFDocument.load(bytes);
        const pages = pdfDoc.getPages();
        const page = pages[0];
        const { width, height } = page.getSize();

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const nameText = studentName || 'Graduado Quinto';
        const nameFontSize = 32;
        const nameWidth = fontBold.widthOfTextAtSize(nameText, nameFontSize);
        const nameX = (width - nameWidth) / 2;

        const courseText = courseTitle || 'Capacitacion Especializada';
        const courseFontSize = 18;
        const courseWidth = fontBold.widthOfTextAtSize(courseText, courseFontSize);
        const courseX = (width - courseWidth) / 2;

        page.drawText(nameText, {
          x: nameX,
          y: height / 2 + 25,
          size: nameFontSize,
          font: fontBold,
          color: rgb(0.08, 0.12, 0.22)
        });

        page.drawText(courseText, {
          x: courseX,
          y: height / 2 - 25,
          size: courseFontSize,
          font: fontBold,
          color: rgb(0.06, 0.72, 0.85)
        });

        page.drawText("Fecha de Emisión: " + issuedAt, {
          x: 45,
          y: 45,
          size: 9,
          font: fontRegular,
          color: rgb(0.3, 0.4, 0.5)
        });

        page.drawText("Sello Criptográfico SHA-256: " + hashSha256, {
          x: 45,
          y: 30,
          size: 7,
          font: fontRegular,
          color: rgb(0.2, 0.5, 0.7)
        });

        const safeHash = hashSha256 || 'VALID-QUINTO-CERT';
        const targetQrUrl = qrCodeUrl && !qrCodeUrl.includes('undefined')
          ? qrCodeUrl 
          : "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://mis-certificados.quinto.app/validar/" + safeHash;

        try {
          const qrResponse = await fetch(targetQrUrl);
          if (qrResponse.ok) {
            const qrBlob = await qrResponse.arrayBuffer();
            const qrImage = await pdfDoc.embedPng(qrBlob);
            page.drawImage(qrImage, {
              x: width - 115,
              y: 20,
              width: 75,
              height: 75
            });
          } else {
            throw new Error('HTTP QR response not ok');
          }
        } catch (e) {
          console.error('Error Embedding primary QR image, applying secondary fallback:', e);
          try {
            const fallbackQrUrl = "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=https://mis-certificados.quinto.app/validar/" + safeHash;
            const qrResponse2 = await fetch(fallbackQrUrl);
            if (qrResponse2.ok) {
              const qrBlob2 = await qrResponse2.arrayBuffer();
              const qrImage2 = await pdfDoc.embedPng(qrBlob2);
              page.drawImage(qrImage2, {
                x: width - 115,
                y: 20,
                width: 75,
                height: 75
              });
            }
          } catch (e2) {
            console.error('Secondary QR fallback failed:', e2);
          }
        }

        pdfBytes = await pdfDoc.save();
      } else {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([841.89, 595.28]);
        const { width, height } = page.getSize();

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.04, 0.06, 0.1)
        });

        page.drawRectangle({
          x: 20,
          y: 20,
          width: width - 40,
          height: height - 40,
          borderColor: rgb(0.8, 0.6, 0.2),
          borderWidth: 3
        });

        const headerText = 'QUINTO EJE INGENIERÍA - CERTIFICADO OFICIAL';
        const headerW = fontBold.widthOfTextAtSize(headerText, 14);
        page.drawText(headerText, {
          x: (width - headerW) / 2,
          y: height - 70,
          size: 14,
          font: fontBold,
          color: rgb(0.9, 0.7, 0.3)
        });

        const nameText = studentName || 'Nombre del Graduado';
        const nameW = fontBold.widthOfTextAtSize(nameText, 36);
        page.drawText(nameText, {
          x: (width - nameW) / 2,
          y: height / 2 + 30,
          size: 36,
          font: fontBold,
          color: rgb(1, 1, 1)
        });

        const courseW = fontBold.widthOfTextAtSize(courseTitle, 20);
        page.drawText(courseTitle, {
          x: (width - courseW) / 2,
          y: height / 2 - 30,
          size: 20,
          font: fontBold,
          color: rgb(0.2, 0.7, 0.9)
        });

        page.drawText("Fecha de Emisión: " + issuedAt, {
          x: 45,
          y: 65,
          size: 11,
          font: fontRegular,
          color: rgb(0.7, 0.7, 0.7)
        });

        page.drawText("Firma Criptográfica SHA-256: " + hashSha256, {
          x: 45,
          y: 45,
          size: 9,
          font: fontRegular,
          color: rgb(0.2, 0.8, 0.9)
        });

        if (qrCodeUrl) {
          try {
            const qrResponse = await fetch(qrCodeUrl);
            const qrBlob = await qrResponse.arrayBuffer();
            const qrImage = await pdfDoc.embedPng(qrBlob);
            page.drawImage(qrImage, {
              x: width - 130,
              y: 40,
              width: 85,
              height: 85
            });
          } catch (e) {}
        }

        pdfBytes = await pdfDoc.save();
      }

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const safeName = (studentName || 'Graduado').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = "Certificado_Oficial_" + safeName + ".pdf";
      link.click();
    } catch (err) {
      console.error('Error generando documento PDF nativo:', err);
      alert('Error generando documento PDF nativo. Por favor verifica los archivos.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPracticalGuide = async () => {
    setDownloadingGuide(true);
    try {
      const savedGuidePdfData = localStorage.getItem('quinto_practical_guide_pdf_data');
      const savedGuideUrl = localStorage.getItem('quinto_practical_guide_url');

      if (savedGuidePdfData && savedGuidePdfData.startsWith('data:application/pdf')) {
        const base64Data = savedGuidePdfData.split(',')[1];
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes.buffer], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const safeCourse = (courseTitle || 'Curso').replace(/[^a-zA-Z0-9]/g, '_');
        link.download = "Guia_Practica_Oficial_" + safeCourse + ".pdf";
        link.click();
        return;
      }

      if (savedGuideUrl && (savedGuideUrl.startsWith('http://') || savedGuideUrl.startsWith('https://'))) {
        try {
          const resp = await fetch(savedGuideUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const safeCourse = (courseTitle || 'Curso').replace(/[^a-zA-Z0-9]/g, '_');
            link.download = "Guia_Practica_Oficial_" + safeCourse + ".pdf";
            link.click();
            return;
          }
        } catch (e) {
          window.open(savedGuideUrl, '_blank');
          return;
        }
      }

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawRectangle({
        x: 0,
        y: height - 120,
        width,
        height: 120,
        color: rgb(0.06, 0.09, 0.16)
      });

      page.drawRectangle({
        x: 0,
        y: height - 124,
        width,
        height: 4,
        color: rgb(0.06, 0.72, 0.85)
      });

      page.drawText('QUINTO EJE INGENIERIA', {
        x: 40,
        y: height - 50,
        size: 16,
        font: fontBold,
        color: rgb(0.06, 0.72, 0.85)
      });

      page.drawText('GUIA PRACTICA DE APLICACION Y ESTUDIO', {
        x: 40,
        y: height - 75,
        size: 14,
        font: fontBold,
        color: rgb(1, 1, 1)
      });

      page.drawText("Curso: " + courseTitle, {
        x: 40,
        y: height - 100,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.85, 0.9)
      });

      page.drawRectangle({
        x: 40,
        y: height - 200,
        width: width - 80,
        height: 60,
        color: rgb(0.96, 0.98, 1.0),
        borderColor: rgb(0.8, 0.88, 0.95),
        borderWidth: 1
      });

      page.drawText("DOCUMENTO EXCLUSIVO PARA: " + studentName.toUpperCase(), {
        x: 55,
        y: height - 165,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.35)
      });

      page.drawText('Estado: Comprobante Aprobado & Contenido Liberado por Direccion General', {
        x: 55,
        y: height - 185,
        size: 9,
        font: fontRegular,
        color: rgb(0.1, 0.6, 0.4)
      });

      page.drawText('1. RESUMEN EJECUTIVO & METODOLOGIA PRACTICA', {
        x: 40,
        y: height - 240,
        size: 12,
        font: fontBold,
        color: rgb(0.06, 0.72, 0.85)
      });

      const lines = [
        'Esta guia contiene los fundamentos operativos, workflows y recomendaciones tecnicas',
        'desarrolladas especificamente para la capacitacion de "' + courseTitle + '".',
        '',
        '- Modulo I: Configuracion del Entorno y Herramientas Especializadas.',
        '- Modulo II: Automatizacion de Flujos de Trabajo y Buenas Practicas.',
        '- Modulo III: Implementacion en Produccion y Casos de Estudio Reales.',
        '',
        'RECOMENDACIONES DE ESTUDIO:',
        '1. Revisa cada modulo siguiendo los ejemplos practicos en tu entorno de desarrollo.',
        '2. Guarda tu certificado oficial verificado mediante el codigo QR para validez curricular.',
        '3. Accede a las actualizaciones continuas de la plataforma Quinto Eje Ingenieria.'
      ];

      let currentY = height - 265;
      lines.forEach((line) => {
        const isHeader = line.startsWith('-') || line.startsWith('RECOMENDACIONES');
        page.drawText(line, {
          x: isHeader ? 50 : 40,
          y: currentY,
          size: isHeader ? 10 : 9.5,
          font: isHeader ? fontBold : fontRegular,
          color: isHeader ? rgb(0.1, 0.15, 0.25) : rgb(0.3, 0.35, 0.45)
        });
        currentY -= 20;
      });

      page.drawRectangle({
        x: 40,
        y: 40,
        width: width - 80,
        height: 55,
        color: rgb(0.97, 0.97, 0.98),
        borderColor: rgb(0.9, 0.9, 0.92),
        borderWidth: 1
      });

      page.drawText('VERIFICACION Y VALIDACION INSTITUCIONAL QUINTO EJE', {
        x: 55,
        y: 78,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.3, 0.4)
      });

      page.drawText("Sello Criptografico Hash SHA-256: " + (hashSha256 || 'VALIDATED-QUINTO-GUIDE'), {
        x: 55,
        y: 60,
        size: 8,
        font: fontRegular,
        color: rgb(0.1, 0.6, 0.8)
      });

      page.drawText("Emitido el: " + issuedAt + " | Soporte: contacto@quinto.app", {
        x: 55,
        y: 48,
        size: 8,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5)
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const safeCourse = (courseTitle || 'Curso').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = "Guia_Practica_Oficial_" + safeCourse + ".pdf";
      link.click();
    } catch (err) {
      console.error('Error al generar la Guia Practica:', err);
      alert('Error al generar la Guia Practica en PDF.');
    } finally {
      setDownloadingGuide(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="relative w-full bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-amber-400" />
            <span className="font-extrabold text-white text-base">
              {hasPdfTemplate ? 'Plantilla PDF Oficial Cargada' : 'Certificado Digital Oficial'}
            </span>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold">
            Formato PDF HD Nativo
          </span>
        </div>

        <div className="space-y-4 py-2">
          <div>
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Otorgado a Favor de:</span>
            <p className="text-2xl sm:text-3xl font-black text-white">{studentName}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Capacitación Aprobada:</span>
            <p className="text-lg font-bold text-cyan-300">{courseTitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-400">
            <div>
              <span className="block font-bold text-slate-300">Fecha de Emisión:</span>
              <span>{issuedAt}</span>
            </div>
            <div>
              <span className="block font-bold text-slate-300">Sello SHA-256:</span>
              <span className="font-mono text-cyan-400 truncate block max-w-full">{hashSha256}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            onClick={handleDownloadPracticalGuide}
            disabled={downloadingGuide}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            {downloadingGuide ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Generando Guía Práctica PDF...</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 text-cyan-200" />
                <span>Descargar Guía Práctica (.PDF)</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                <span>Estampando y Generando PDF Nativo...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-200" />
                <span>Descargar Certificado Oficial (.PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
