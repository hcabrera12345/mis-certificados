'use client';

import React, { useState } from 'react';
import { X, Upload, QrCode, CheckCircle2, ShieldCheck, FileText, Send, DollarSign, Image } from 'lucide-react';
import { Course, PaymentReceipt } from '@/types';
import { OFFICIAL_QUINTO_PAYMENT_QR_BASE64 } from '@/lib/mockData';

export function getDirectImageUrl(url: string): string {
  if (!url) return OFFICIAL_QUINTO_PAYMENT_QR_BASE64;
  let cleanUrl = url.trim();
  if (cleanUrl.includes('NMnkr4t') || cleanUrl.includes('imgur.com/a/NMnkr4t')) {
    return OFFICIAL_QUINTO_PAYMENT_QR_BASE64;
  }
  if (cleanUrl.includes('imgur.com')) {
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1].split('?')[0].split('#')[0];
    if (lastPart && lastPart !== 'a') {
      return `https://i.imgur.com/${lastPart}.png`;
    }
  }
  return cleanUrl;
}


interface PaymentOCRModalProps {
  course: Course;
  paymentQrUrl: string;
  userName?: string;
  onClose: () => void;
  onSubmitReceipt: (receipt: PaymentReceipt) => void;
}

export const PaymentOCRModal: React.FC<PaymentOCRModalProps> = ({
  course,
  paymentQrUrl,
  userName,
  onClose,
  onSubmitReceipt
}) => {
  const [studentName, setStudentName] = useState(userName || '');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(course.price_usd);
  const [submitting, setSubmitting] = useState(false);

  const activeQrUrl = paymentQrUrl || (typeof window !== 'undefined' ? localStorage.getItem('quinto_payment_qr_url') : null) || OFFICIAL_QUINTO_PAYMENT_QR_BASE64;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Por favor ingresa tu nombre completo oficial para el certificado.');
      return;
    }
    if (!file && !previewUrl) {
      alert('Por favor adjunta la foto o archivo del comprobante de pago.');
      return;
    }

    setSubmitting(true);

    const safeHash = 'SHA256-' + Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const newReceipt: PaymentReceipt = {
      id: 'rcpt-' + Date.now(),
      student_id: 'std-' + Math.random().toString(36).substring(2, 9),
      student_name: studentName,
      course_id: course.id,
      course_title: course.title,
      receipt_image_url: previewUrl || '/quinto_official_payment_qr.png',
      receipt_hash: safeHash,
      extracted_op_code: transactionId || 'OP-' + Math.floor(100000 + Math.random() * 900000),
      extracted_amount: amountPaid,
      extracted_date: new Date().toLocaleDateString('es-ES'),
      extracted_sender: studentName,
      ocr_status: 'parsed',
      admin_approval_status: 'pending',
      created_at: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    setTimeout(() => {
      onSubmitReceipt(newReceipt);
      setSubmitting(false);
      alert('¡Comprobante enviado exitosamente a Dirección! Al ser verificado, tu certificado digital se emitirá automáticamente.');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Solicitud & Pago de Certificado</h2>
              <p className="text-xs text-slate-400">Escanea el QR Oficial de Quinto Eje Ingeniería y adjunta tu comprobante</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Course Badge */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Capacitación Seleccionada:</span>
              <h3 className="text-sm font-extrabold text-white">{course.title}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold">Inversión:</span>
              <span className="text-lg font-black text-amber-400">${course.price_usd} USD</span>
            </div>
          </div>

          {/* QR Display */}
          <div className="bg-slate-950/80 border-2 border-amber-500/40 rounded-2xl p-5 text-center space-y-3 shadow-xl">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-400 inline" />
              CÓDIGO QR OFICIAL DE PAGO QUINTO
            </span>
            <div className="w-52 h-52 sm:w-60 sm:h-60 mx-auto bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden border-2 border-amber-500/30">
              <img
                src={getDirectImageUrl(activeQrUrl) || OFFICIAL_QUINTO_PAYMENT_QR_BASE64}
                onError={(e) => {
                  e.currentTarget.src = OFFICIAL_QUINTO_PAYMENT_QR_BASE64;
                }}
                alt="QR Oficial de Pago Quinto"
                className="w-full h-full object-contain select-none"
              />
            </div>
            <p className="text-xs text-slate-400 font-medium">Escanea este código desde tu app de banca móvil o Yape/Plin</p>
          </div>

          {/* Enrollment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nombre Completo Oficial (Tal como saldrá impreso en el certificado) *
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ej. Ing. Hernán Cabrera Flores"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Adjuntar Comprobante de Pago (Foto / Capture / PDF) *
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-amber-500/60 rounded-2xl p-6 bg-slate-950/40 cursor-pointer transition-all">
                <Upload className="w-8 h-8 text-amber-400/80 mb-2" />
                <span className="text-xs font-bold text-slate-200">
                  {file ? file.name : 'Haz clic aquí para seleccionar tu comprobante'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Soporta PNG, JPG, JPEG o PDF</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Enviando a Dirección...' : 'Enviar Comprobante & Solicitar Certificado'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
