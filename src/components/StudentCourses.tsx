'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Award, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { Course, PaymentReceipt } from '@/types';
import { fetchVigentesCoursesFromQuinto } from '@/lib/quintoClient';
import { PaymentOCRModal } from './PaymentOCRModal';

interface StudentCoursesProps {
  onAddReceipt: (receipt: PaymentReceipt) => void;
}

export const StudentCourses: React.FC<StudentCoursesProps> = ({ onAddReceipt }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuintoCourses() {
      setIsLoading(true);
      const data = await fetchVigentesCoursesFromQuinto();
      setCourses(data);
      setIsLoading(false);
    }
    loadQuintoCourses();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-cyan-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Conectado en Tiempo Real con CRM Quinto
          </div>
          <h1 className="text-3xl font-extrabold text-white">Cursos Vigentes & Emisión de Certificados</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ingresa con tu enlace de alumno, selecciona tu curso culminado en Quinto, procesa la verificación de comprobante por IA y obtén tu certificado digital respaldado en la base de datos oficial.
          </p>
        </div>
      </div>

      {/* Synchronized Courses Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Programas Activos en Quinto CRM
            <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              {courses.length} Vigentes
            </span>
          </h2>
          <p className="text-xs text-slate-400">Sincronización automática de estudiantes finalizados.</p>
        </div>

        <button
          onClick={async () => {
            setIsLoading(true);
            const data = await fetchVigentesCoursesFromQuinto();
            setCourses(data);
            setIsLoading(false);
          }}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Sincronizar CRM
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="glass-panel rounded-3xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-56 overflow-hidden">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full border border-emerald-500/40 shadow-lg">
                  Curso Vigente CRM Quinto
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-extrabold text-2xl text-white group-hover:text-cyan-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    {course.academic_hours} Horas Lectivas
                  </span>
                  <span className="text-cyan-300 font-semibold">{course.instructor_name}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Estatus: Aprobado 100%
                    </span>
                    <span className="text-cyan-400">Nota: 19/20</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setSelectedCourse(course)}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Obtener Certificado Oficial • US ${course.price_usd.toFixed(2)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment OCR Modal */}
      {selectedCourse && (
        <PaymentOCRModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSubmitReceipt={(receipt) => {
            onAddReceipt(receipt);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};
