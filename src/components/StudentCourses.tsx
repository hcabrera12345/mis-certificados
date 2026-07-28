'use client';

import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle2, QrCode, ArrowRight } from 'lucide-react';
import { Course, PaymentReceipt } from '@/types';
import { PaymentOCRModal } from './PaymentOCRModal';

interface StudentCoursesProps {
  courses: Course[];
  paymentQrUrl: string;
  onAddReceipt: (receipt: PaymentReceipt) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export const StudentCourses: React.FC<StudentCoursesProps> = ({
  courses,
  paymentQrUrl,
  onAddReceipt,
  isAuthenticated,
  onOpenAuth
}) => {
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);

  const handleEnrollClick = (course: Course) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setSelectedCourseForPayment(course);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-mono font-bold uppercase tracking-wider inline-block mb-3">
            Catálogo Oficial de Capacitaciones
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cursos Disponibles & Certificación Digital
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Inscríbete en nuestros programas de alta especialización en Inteligencia Artificial y obtén tu diploma oficial verificado con código QR y Hash SHA-256.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-cyan-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {course.category}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {course.title}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Precio Certificado:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  US ${course.price_usd.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => handleEnrollClick(course)}
                className="py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Solicitar Certificado</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment OCR Modal */}
      {selectedCourseForPayment && (
        <PaymentOCRModal
          course={selectedCourseForPayment}
          paymentQrUrl={paymentQrUrl}
          onClose={() => setSelectedCourseForPayment(null)}
          onSubmitReceipt={(receipt) => {
            onAddReceipt(receipt);
            setSelectedCourseForPayment(null);
          }}
        />
      )}
    </div>
  );
};
