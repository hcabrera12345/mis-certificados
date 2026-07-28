'use client';

import React, { useState } from 'react';
import { X, Upload, QrCode, CheckCircle2, ShieldCheck, FileText, Send, DollarSign, Image } from 'lucide-react';
import { Course, PaymentReceipt } from '@/types';

interface PaymentOCRModalProps {
  course: Course;
  paymentQrUrl: string;
  onClose: () => void;
  onSubmitReceipt: (receipt: PaymentReceipt) => void;
}

export const PaymentOCRModal: React.FC<PaymentOCRModalProps> = ({
  course,
  paymentQrUrl,
  onClose,
  onSubmitReceipt
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrData, setOcrData] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Simulate AI Vision OCR Reading
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setOcrData({
          opCode: 'YAPE-' + Math.floor(1000000 + Math.random() * 9000000),
          amount: course.price_usd,
          date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          sender: 'Hernán Cabrera'
        });
      }, 1500);
    }
  };

  const handleConfirmSubmission = () => {
    if (!ocrData || !previewUrl) return;

    const newReceipt: PaymentReceipt = {
      id: 'rec-' + Date.now(),
      student_id: 'usr-student-001',
      student_name: ocrData.sender,
      course_id: course.id,
      course_title: course.title,
      receipt_image_url: previewUrl,
      receipt_hash: 'hash-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      extracted_op_code: ocrData.opCode,
      extracted_amount: ocrData.amount,
      extracted_date: ocrData.date,
      extracted_sender: ocrData.sender,
      ocr_status: 'parsed',
      admin_approval_status: 'pending',
      created_at: new Date().toISOString().split('T')[0]
    };

    onSubmitReceipt(newReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 relative border border-cyan-500/30 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Emisión de Certificado: {course.title}</h3>
            <p className="text-xs text-slate-400">Escanea el QR Oficial de Quinto y sube el comprobante de pago.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Official Payment QR Box */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">QR OFICIAL DE PAGO QUINTO</span>
            <div className="bg-white p-3 rounded-xl inline-block shadow-md max-w-[180px] mx-auto">
              <img
                  src={paymentQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QUINTO_EJE_PAGO_OFICIAL'}
                  onError={(e) => {
                    e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QUINTO_EJE_PAGO_OFICIAL';
                  }}
                  alt="QR Oficial de Pago Quinto"
                  className="w-full h-auto rounded-xl border border-slate-700 bg-white p-2 shadow-inner object-contain max-h-[220px]"
                />
            </div>
            <div className="text-xs text-slate-300">
              <p className="font-semibold">Monto a Transferir:</p>
              <p className="text-xl font-extrabold text-emerald-400">US ${course.price_usd.toFixed(2)}</p>
            </div>
          </div>

          {/* Receipt Upload Dropzone */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">Sube la Foto o Captura del Comprobante:</label>

            {!previewUrl ? (
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all space-y-2">
                <Upload className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300">Seleccionar Imagen</span>
                <span className="text-[10px] text-slate-500">JPG, PNG o Screenshot</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-36">
                  <img src={previewUrl} alt="Comprobante Subido" className="w-full h-full object-cover" />
                </div>

                {isAnalyzing ? (
                  <div className="bg-cyan-950/60 border border-cyan-500/30 p-3 rounded-xl text-center space-y-1">
                    <p className="text-xs font-bold text-cyan-400 animate-pulse">Escaneando comprobante con IA Vision...</p>
                  </div>
                ) : ocrData ? (
                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-emerald-300">
                      <span>Nº Operación:</span>
                      <strong className="font-mono">{ocrData.opCode}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Monto Leído:</span>
                      <strong>US ${ocrData.amount.toFixed(2)}</strong>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {ocrData && (
          <button
            onClick={handleConfirmSubmission}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Comprobante al Administrador
          </button>
        )}
      </div>
    </div>
  );
};
