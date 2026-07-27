'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, QrCode, Clock, Users, ArrowRight } from 'lucide-react';
import { Course, PaymentReceipt } from '@/types';
import { fetchVigentesCoursesFromQuinto } from '@/lib/quintoClient';
import { PaymentOCRModal } from './PaymentOCRModal';

interface StudentCoursesProps {
  paymentQrUrl: string;
  onAddReceipt: (receipt: PaymentReceipt) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export const StudentCourses: React.FC<StudentCoursesProps> = ({ paymentQrUrl, onAddReceipt }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchVigentesCoursesFromQuinto();
      setCourses(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-white">Catálogo de Cursos Vigentes de Quinto</h1>
        <p className="text-slate-400 text-xs leading-relaxed">
          Selecciona tu programa completado para realizar el pago mediante el QR oficial y emitir tu certificado digital validado con sello SHA-256.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition-all space-y-5 shadow-xl"
          >
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-40 border border-slate-800">
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md text-cyan-400 font-bold rounded-full text-[10px] border border-cyan-500/30">
                  {course.category}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-white text-lg leading-snug">{course.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">{course.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-amber-400" /> {course.total_students || 30} alumnos</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Costo Certificado:</span>
                <span className="text-xl font-extrabold text-emerald-400">US ${course.price_usd.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setSelectedCourseForPayment(course)}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" /> Solicitar Certificado
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCourseForPayment && (
        <PaymentOCRModal
          course={selectedCourseForPayment}
          paymentQrUrl={paymentQrUrl}
          onClose={() => setSelectedCourseForPayment(null)}
          onSubmitReceipt={onAddReceipt}
        />
      )}
    </div>
  );
};
