'use client';

import React, { useState } from 'react';
import { X, MapPin, Truck, CheckCircle2, ShieldCheck, Phone, Navigation } from 'lucide-react';
import { Certificate } from '@/types';

interface PhysicalDeliveryModalProps {
  certificate: Certificate;
  onClose: () => void;
  onSubmitDelivery: (deliveryData: any) => void;
}

export const PhysicalDeliveryModal: React.FC<PhysicalDeliveryModalProps> = ({
  certificate,
  onClose,
  onSubmitDelivery
}) => {
  const [address, setAddress] = useState('Av. Principal 456, Dpto 301');
  const [city, setCity] = useState('Lima');
  const [phone, setPhone] = useState('+51 987 654 321');
  const [notes, setNotes] = useState('Entregar en portería en horario de oficina.');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    const deliveryRecord = {
      id: 'del-' + Date.now(),
      certificate_id: certificate.id,
      student_name: certificate.student_name,
      course_title: certificate.course_title,
      address,
      city,
      phone,
      notes,
      tracking_number: 'GPS-QUINT-2026-' + Math.floor(1000 + Math.random() * 9000),
      status: 'en_camino',
      created_at: new Date().toLocaleDateString('es-ES')
    };

    setTimeout(() => {
      onSubmitDelivery(deliveryRecord);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 relative border border-cyan-500/30 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Solicitud de Certificado Físico "A Tu Puerta"</h3>
            <p className="text-xs text-slate-400">Diploma impreso en Tapa Dura e Insignia Metálica Quinto</p>
          </div>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Certificado Asociado: <strong>{certificate.course_title}</strong></span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Dirección Exacta de Entrega:</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white font-medium focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Ciudad / Provincia:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Teléfono de Contacto (GPS):</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Instrucciones Especiales para el Repartidor:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white h-16"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Confirmar Despacho a Domicilio
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">¡Despacho Registrado Exitosamente!</h4>
              <p className="text-xs text-slate-400 mt-1">El operador logístico Quinto iniciará el recorrido GPS a tu domicilio.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
