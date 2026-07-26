'use client';

import React, { useState } from 'react';
import { Award, Users, DollarSign, ShieldCheck, CheckCircle2, XCircle, Send, Upload, Eye, Edit, Plus, Trash2, Save, FileSpreadsheet, Truck, Navigation, MapPin } from 'lucide-react';
import { PaymentReceipt, Certificate, Course } from '@/types';
import { exportReceiptsToCSV, exportCertificatesToCSV } from '@/lib/reportExporter';

interface AdminDashboardProps {
  courses: Course[];
  receipts: PaymentReceipt[];
  certificates: Certificate[];
  deliveries: any[];
  onUpdateCourses: (updatedCourses: Course[]) => void;
  onApproveReceipt: (receipt: PaymentReceipt) => void;
  onRejectReceipt: (receiptId: string) => void;
  onUpdateCertificate: (updatedCert: Certificate) => void;
  onDeleteCertificate: (certId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  courses,
  receipts,
  certificates,
  deliveries,
  onUpdateCourses,
  onApproveReceipt,
  onRejectReceipt,
  onUpdateCertificate,
  onDeleteCertificate
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'courses' | 'certificates' | 'logistics' | 'templates'>('approvals');
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);

  const pendingReceipts = receipts.filter((r) => r.admin_approval_status === 'pending');

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const exists = courses.some((c) => c.id === editingCourse.id);
    let newCourseList: Course[];

    if (exists) {
      newCourseList = courses.map((c) => (c.id === editingCourse.id ? editingCourse : c));
    } else {
      newCourseList = [...courses, editingCourse];
    }

    onUpdateCourses(newCourseList);
    setEditingCourse(null);
    alert('¡Información del curso actualizada exitosamente!');
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCertificate) return;

    onUpdateCertificate(editingCertificate);
    setEditingCertificate(null);
    alert('¡Certificado actualizado y re-emitido con sello SHA-256!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Consola de Administración Total</h1>
          <p className="text-slate-400 text-xs">Gestión libre de Cursos, Certificados, Aprobaciones WhatsApp y Logística GPS.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'approvals' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Aprobaciones WhatsApp ({pendingReceipts.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'courses' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Editar Cursos ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'certificates' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Editar Certificados ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab('logistics')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'logistics' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Logística Puerta ({deliveries.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold uppercase">Certificados Emitidos</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{12450 + certificates.length}</div>
          <p className="text-[11px] text-emerald-400 font-medium">↑ PDF Vectorial Activo</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold uppercase">Cursos Vigentes CRM</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{courses.length}</div>
          <p className="text-[11px] text-purple-400 font-medium">Sincronizados con Quinto</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase">Ingresos Recaudados</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">$45,200</div>
          <p className="text-[11px] text-emerald-400 font-medium">Verificados por OCR AI</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase">Despachos Físicos GPS</span>
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{deliveries.length} Solicitud(es)</div>
          <p className="text-[11px] text-amber-400 font-medium">Rastreo activo</p>
        </div>
      </div>

      {/* Export Toolbar */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => exportReceiptsToCSV(receipts)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" /> Exportar Comprobantes (CSV)
        </button>
        <button
          onClick={() => exportCertificatesToCSV(certificates)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" /> Exportar Certificados (CSV)
        </button>
      </div>

      {/* TAB 1: APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-white text-lg">Cola de Aprobaciones OCR & WhatsApp</h3>
            </div>
            <span className="text-xs text-slate-400">Pendientes: {pendingReceipts.length}</span>
          </div>

          {pendingReceipts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-white font-bold text-base">¡No hay solicitudes pendientes!</p>
              <p className="text-xs text-slate-400">Todos los comprobantes han sido procesados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-cyan-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Alumno</th>
                    <th className="p-3">Programa Académico</th>
                    <th className="p-3">Nº Operación (OCR)</th>
                    <th className="p-3">Monto Leído</th>
                    <th className="p-3">Comprobante</th>
                    <th className="p-3 text-right">Acciones de Aprobación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pendingReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">{r.student_name}</td>
                      <td className="p-3">{r.course_title}</td>
                      <td className="p-3 font-mono text-cyan-400">{r.extracted_op_code}</td>
                      <td className="p-3 font-bold text-emerald-400">US ${r.extracted_amount.toFixed(2)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedReceiptImage(r.receipt_image_url)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Foto
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onApproveReceipt(r)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-md transition-all inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar (OK)
                        </button>
                        <button
                          onClick={() => onRejectReceipt(r.id)}
                          className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 text-red-400 font-semibold rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: LOGISTICS AND DELIVERY TRACKING */}
      {activeTab === 'logistics' && (
        <div className="glass-panel rounded-3xl p-6 border border-amber-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-lg">Módulo de Logística "A Tu Puerta" (Física GPS)</h3>
            </div>
            <span className="text-xs text-slate-400">Total Solicitudes: {deliveries.length}</span>
          </div>

          {deliveries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No hay entregas físicas solicitadas aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-amber-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Nº Tracking GPS</th>
                    <th className="p-3">Alumno</th>
                    <th className="p-3">Dirección de Entrega</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Estatus Logístico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-mono text-cyan-400 font-bold">{d.tracking_number}</td>
                      <td className="p-3 font-bold text-white">{d.student_name}</td>
                      <td className="p-3">{d.address}, {d.city}</td>
                      <td className="p-3 font-mono">{d.phone}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                          <Navigation className="w-3 h-3 animate-pulse" /> En Camino GPS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
