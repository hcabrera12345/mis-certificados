'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, CheckCircle2, ShieldCheck, Loader2, FileText } from 'lucide-react';
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

      if (savedPdfData) {
        // A. STAMP OVER ADMIN'S UPLOADED PDF TEMPLATE (.PDF)
        const existingPdfBytes = Uint8Array.from(atob(savedPdfData.split(',')[1] || savedPdfData), c => c.charCodeAt(0));
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const page = pages[0];

        const { width, height } = page.getSize();
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Draw ONLY Student Full Name (Centered perfectly over the template line)
        const nameText = studentName || 'Nombre del Graduado';
        const fontSize = nameText.length > 25 ? 26 : 32;
        const nameWidth = fontBold.widthOfTextAtSize(nameText, fontSize);
        
        // Target exact vertical position above line (approx 45% from bottom of page)
        page.drawText(nameText, {
          x: (width - nameWidth) / 2,
          y: height * 0.44,
          size: fontSize,
          font: fontBold,
          color: rgb(0.06, 0.11, 0.22) // Deep navy black matching template typography
        });

        // Draw Issue Date & SHA-256 Hash in bottom left corner
        page.drawText(`Fecha de Emisión: ${issuedAt}`, {
          x: 45,
          y: 28,
          size: 8,
          font: fontRegular,
          color: rgb(0.35, 0.4, 0.45)
        });

        page.drawText(`SHA-256: ${hashSha256}`, {
          x: 45,
          y: 18,
          size: 7,
          font: fontRegular,
          color: rgb(0.2, 0.5, 0.7)
        });

        // Draw QR Code Image onto PDF Page with Robust Fallback URL
        const safeHash = hashSha256 || 'VALID-QUINTO-CERT';
        const targetQrUrl = qrCodeUrl && !qrCodeUrl.includes('undefined')
          ? qrCodeUrl 
          : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://mis-certificados.quinto.app/validar/${safeHash}`;

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
            const fallbackQrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=https://mis-certificados.quinto.app/validar/${safeHash}`;
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
        // B. GENERATE CLEAN NATIVE DIPLOMA PDF IF NO TEMPLATE UPLOADED YET
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([841.89, 595.28]); // A4 Landscape (297mm x 210mm)
        const { width, height } = page.getSize();

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Dark Luxury Background
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.04, 0.06, 0.1)
        });

        // Gold Border Frame
        page.drawRectangle({
          x: 20,
          y: 20,
          width: width - 40,
          height: height - 40,
          borderColor: rgb(0.8, 0.6, 0.2),
          borderWidth: 3
        });

        // Title Header
        const headerText = 'QUINTO EJE INGENIERÍA - CERTIFICADO OFICIAL';
        const headerW = fontBold.widthOfTextAtSize(headerText, 14);
        page.drawText(headerText, {
          x: (width - headerW) / 2,
          y: height - 70,
          size: 14,
          font: fontBold,
          color: rgb(0.9, 0.7, 0.3)
        });

        // Student Name
        const nameText = studentName || 'Nombre del Graduado';
        const nameW = fontBold.widthOfTextAtSize(nameText, 36);
        page.drawText(nameText, {
          x: (width - nameW) / 2,
          y: height / 2 + 30,
          size: 36,
          font: fontBold,
          color: rgb(1, 1, 1)
        });

        // Course Title
        const courseW = fontBold.widthOfTextAtSize(courseTitle, 20);
        page.drawText(courseTitle, {
          x: (width - courseW) / 2,
          y: height / 2 - 30,
          size: 20,
          font: fontBold,
          color: rgb(0.2, 0.7, 0.9)
        });

        // Dates & Hashes
        page.drawText(`Fecha de Emisión: ${issuedAt}`, {
          x: 45,
          y: 65,
          size: 11,
          font: fontRegular,
          color: rgb(0.7, 0.7, 0.7)
        });

        page.drawText(`Firma Criptográfica SHA-256: ${hashSha256}`, {
          x: 45,
          y: 45,
          size: 9,
          font: fontRegular,
          color: rgb(0.2, 0.8, 0.9)
        });

        // Embed QR Code
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

      // Download PDF File Natively
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const safeName = (studentName || 'Graduado').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Certificado_Oficial_${safeName}.pdf`;
      link.click();
    } catch (err) {
      console.error('Error generando documento PDF nativo:', err);
      alert('Error generando documento PDF nativo. Por favor verifica los archivos.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Clean Diploma Card Preview */}
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

        {/* PDF Download Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                <span>Estampando y Generando Documento PDF Nativo...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-200" />
                <span>Descargar Certificado Oficial (.PDF Nativo)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
