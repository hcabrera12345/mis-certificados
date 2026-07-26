'use client';

import React, { useState } from 'react';
import { X, QrCode, Upload, CheckCircle2, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { Course, PaymentReceipt } from '@/types';

interface PaymentOCRModalProps {
  course: Course;
  onClose: () => void;
  onSubmitReceipt: (receipt: PaymentReceipt) => void;
}

export const PaymentOCRModal: React.FC<PaymentOCRModalProps> = ({
  course,
  onClose,
  onSubmitReceipt
}) => {
  const [step, setStep] = useState<'qr' | 'upload' | 'ocr_scanning' | 'parsed_result' | 'sent_whatsapp'>('qr');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const [extractedData] = useState({
    opCode: 'OP-' + Math.floor(10000000 + Math.random() * 90000000),
    amount: course.price_usd,
    date: new Date().toLocaleDateString('es-ES'),
    sender: 'María Elena Rodríguez'
  });

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setStep('ocr_scanning');

      setTimeout(() => {
        setStep('parsed_result');
      }, 2000);
    }
  };

  const handleConfirmAndSendWhatsApp = () => {
    setStep('sent_whatsapp');

    const newReceipt: PaymentReceipt = {
      id: 'rec-' + Date.now(),
      student_id: 'usr-101',
      student_name: 'María Elena Rodríguez',
      course_id: course.id,
      course_title: course.title,
      receipt_image_url: uploadedImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      receipt_hash: 'hash-' + Math.random().toString(36).substring(2),
      extracted_op_code: extractedData.opCode,
      extracted_amount: extractedData.amount,
      extracted_date: extractedData.date,
      extracted_sender: extractedData.sender,
      ocr_status: 'parsed',
      admin_approval_status: 'pending',
      created_at: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmitReceipt(newReceipt);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 relative border border-cyan-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Solicitud de Certificado Digital</h3>
            <p className="text-xs text-slate-400">{course.title} • US ${course.price_usd.toFixed(2)}</p>
          </div>
        </div>

        {step === 'qr' && (
          <div className="space-y-5 text-center">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-semibold mb-2">Escanea el código QR de pago oficial:</span>
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PagoCertificado_${course.id}_${course.price_usd}`}
                  alt="QR Pago"
                  className="w-44 h-44"
                />
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-400 bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-800">
                <ShieldCheck className="w-4 h-4" />
                Acepta Yape, Plin, Transferencia Bancaria
              </div>
            </div>

            <div className="text-left bg-slate-900/50 p-4 rounded-xl text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white mb-1">Instrucciones de Emisión:</p>
              <p>1. Realiza el pago por el monto exacto de <strong>US ${course.price_usd.toFixed(2)}</strong> (o equivalente local).</p>
              <p>2. Guarda la captura de pantalla o foto del comprobante.</p>
              <p>3. Adjunta la imagen a continuación para la lectura automatizada por IA.</p>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              Ya hice el pago, Adjuntar Comprobante
              <Upload className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-5 text-center">
            <div className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-900/60 rounded-2xl p-8 flex flex-col items-center justify-center transition-all">
              <Upload className="w-12 h-12 text-cyan-400 mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-white mb-1">Sube la foto de tu comprobante de pago</p>
              <p className="text-xs text-slate-400 mb-4">Formatos aceptados: PNG, JPG, JPEG (Máx 10MB)</p>
              
              <label className="cursor-pointer px-5 py-2.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-semibold rounded-xl text-sm transition-all">
                Seleccionar Archivo
                <input type="file" accept="image/*" onChange={handleSimulateUpload} className="hidden" />
              </label>
            </div>

            <button
              onClick={() => setStep('qr')}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Volver al Código QR
            </button>
          </div>
        )}

        {step === 'ocr_scanning' && (
          <div className="py-12 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Analizando Comprobante con AI Vision...</h4>
              <p className="text-xs text-slate-400">Extrayendo Número de Operación, Monto y Fecha en tiempo real</p>
            </div>
          </div>
        )}

        {step === 'parsed_result' && (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-300">¡Comprobante Leído Correctamente!</p>
                <p className="text-xs text-emerald-400/80">Inteligencia Artificial con tasa de confianza 99.4%</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Nº de Operación Extraído:</span>
                <span className="font-mono font-bold text-cyan-400">{extractedData.opCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Monto Detectado:</span>
                <span className="font-bold text-white">US ${extractedData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Emisor:</span>
                <span className="font-bold text-slate-200">{extractedData.sender}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Fecha del Pago:</span>
                <span className="font-bold text-slate-200">{extractedData.date}</span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <Send className="w-4 h-4 text-green-400" />
              <span>Al confirmar, se enviará una notificación a WhatsApp del Administrador para el visto bueno de emisión.</span>
            </div>

            <button
              onClick={handleConfirmAndSendWhatsApp}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
            >
              Enviar a Aprobación por WhatsApp
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'sent_whatsapp' && (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 border border-green-500/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Send className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">¡Notificación Enviada al Administrador!</h4>
              <p className="text-xs text-slate-400">El admin verificará tu pago y el certificado se liberará automáticamente.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
