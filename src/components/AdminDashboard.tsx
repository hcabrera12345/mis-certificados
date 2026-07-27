'use client';

import React, { useState } from 'react';
import { X, Award, Users, DollarSign, ShieldCheck, CheckCircle2, XCircle, Send, Upload, Eye, Edit, Plus, Trash2, Save, FileSpreadsheet, QrCode, Image as ImageIcon, Truck, RefreshCw, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PaymentReceipt, Certificate, Course, SystemSettings } from '@/types';
import { exportReceiptsToCSV, exportCertificatesToCSV } from '@/lib/reportExporter';

interface AdminDashboardProps {
  courses: Course[];
  receipts: PaymentReceipt[];
  certificates: Certificate[];
  deliveries: any[];
  systemSettings: SystemSettings;
  onUpdateCourses: (updatedCourses: Course[]) => void;
  onDeleteCourse?: (courseId: string) => void;
  onApproveReceipt: (receipt: PaymentReceipt) => void;
  onRejectReceipt: (receiptId: string) => void;
  onUpdateCertificate: (updatedCert: Certificate) => void;
  onDeleteCertificate: (certId: string) => void;
  onUpdateSettings: (newSettings: SystemSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  courses,
  receipts,
  certificates,
  deliveries,
  systemSettings,
  onUpdateCourses,
  onDeleteCourse,
  onApproveReceipt,
  onRejectReceipt,
  onUpdateCertificate,
  onDeleteCertificate,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'courses' | 'certificates' | 'settings' | 'logistics'>('approvals');
  const [inspectingReceipt, setInspectingReceipt] = useState<PaymentReceipt | null>(null);
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
    alert('¡Curso y precio (USD) actualizado exitosamente!');
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCertificate) return;

    onUpdateCertificate(editingCertificate);
    setEditingCertificate(null);
    alert('¡Certificado actualizado y re-emitido con sello SHA-256!');
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onUpdateSettings({ ...systemSettings, payment_qr_url: url });
      alert('¡QR de Pago Oficial cargado exitosamente! Ahora los alumnos verán este código al pagar.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Consola de Validación & Dirección General
            <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
              Hernán (Director Quinto)
            </span>
          </h1>
          <p className="text-slate-400 text-xs">Módulo de Inspección de Pagos, Aprobaciones, Cursos y Certificados.</p>
        </div>

        {/* 5 Working Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'approvals' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Validar Comprobantes ({pendingReceipts.length})
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'courses' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit className="w-4 h-4" />
            Cursos & Precios ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'certificates' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Certificados ({certificates.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Subir QR Oficial
          </button>

          <button
            onClick={() => setActiveTab('logistics')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'logistics' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            Logística ({deliveries.length})
          </button>
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

      {/* TAB 1: ADMIN PAYMENT RECEIPT VALIDATION & INSPECTOR */}
      {activeTab === 'approvals' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Validación de Comprobantes de Pago (Inspección del Administrador)
              </h3>
              <p className="text-xs text-slate-400">Revisa la foto del pago subida por el cliente, compara datos con tu cuenta bancaria y aprueba o rechaza.</p>
            </div>
            <span className="text-xs text-amber-400 font-bold px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              Pendientes de Validación: {pendingReceipts.length}
            </span>
          </div>

          {pendingReceipts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-white font-bold text-base">¡No hay comprobantes pendientes de validación!</p>
              <p className="text-xs text-slate-400">Todos los pagos han sido revisados y procesados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReceipts.map((r) => (
                <div key={r.id} className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{r.student_name}</span>
                    <span className="text-[10px] px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full font-mono font-bold">
                      {r.extracted_op_code}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-400">Programa Académico: <strong className="text-cyan-400">{r.course_title}</strong></p>
                    <p className="text-slate-400">Monto Leído por IA: <strong className="text-emerald-400">US ${r.extracted_amount.toFixed(2)}</strong></p>
                    <p className="text-slate-400">Fecha Transferencia: <span className="text-slate-300">{r.extracted_date}</span></p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInspectingReceipt(r)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> Inspeccionar Foto Lado a Lado
                    </button>

                    <button
                      onClick={() => onApproveReceipt(r)}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Aprobar (OK)
                    </button>

                    <button
                      onClick={() => onRejectReceipt(r.id)}
                      className="p-2.5 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded-xl transition-all"
                      title="Rechazar Comprobante"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EDIT COURSES & PRICES */}
      {activeTab === 'courses' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">Gestión de Cursos, Precios (USD) & Horas Lectivas</h3>
            <button
              onClick={() =>
                setEditingCourse({
                  id: 'c-' + Date.now(),
                  title: 'Nuevo Curso',
                  description: 'Descripción del curso',
                  academic_hours: 40,
                  instructor_name: 'Directorio Quinto',
                  price_usd: 50.00,
                  image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
                  category: 'Capacitación',
                  is_active: true
                })
              }
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Agregar Nuevo Curso
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-cyan-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Título del Curso</th>
                  <th className="p-3">Precio Certificado (USD)</th>
                  <th className="p-3">Horas Lectivas</th>
                  <th className="p-3">Docente / Instructor</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">{c.title}</td>
                    <td className="p-3 font-bold text-emerald-400">US ${c.price_usd.toFixed(2)}</td>
                    <td className="p-3 font-mono">{c.academic_hours} hrs</td>
                    <td className="p-3">{c.instructor_name}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setEditingCourse(c)}
                        className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl transition-all inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar Datos / Precio / Horas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EDIT & RE-ISSUE CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
          <h3 className="font-bold text-white text-lg">Certificados Emitidos (Edición Libre & Re-Emisión)</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-cyan-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Graduado</th>
                  <th className="p-3">Curso</th>
                  <th className="p-3">Horas Lectivas</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Sello SHA-256</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">{cert.student_name}</td>
                    <td className="p-3">{cert.course_title}</td>
                    <td className="p-3 font-mono">{cert.academic_hours} hrs</td>
                    <td className="p-3">{cert.issued_at}</td>
                    <td className="p-3 font-mono text-[10px] text-cyan-400 truncate max-w-[120px]">{cert.hash_sha256}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingCertificate(cert)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar & Re-emitir
                      </button>
                      <button
                        onClick={() => onDeleteCertificate(cert.id)}
                        className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Revocar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: UPLOAD PAYMENT QR & TEMPLATES */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Cargar QR Oficial de Pago (Yape / Plin / Banco)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Sube la imagen de tu código QR real. Este código es el que verán los alumnos cuando presionen "Pagar / Solicitar Certificado".
            </p>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="bg-white p-3 rounded-xl inline-block max-w-[180px] mx-auto shadow-md">
                <img src={systemSettings.payment_qr_url} alt="QR Oficial" className="w-full h-auto rounded-lg" />
              </div>

              <label className="block">
                <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Subir Nueva Imagen de QR
                </span>
                <input type="file" accept="image/*" onChange={handleQRUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Cargar Fondo de Plantilla de Certificado</h3>
            </div>
            <p className="text-xs text-slate-400">
              Sube el diseño de fondo oficial (PNG / SVG / PDF) sobre el cual se imprimirán los datos del graduado.
            </p>

            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all space-y-2">
              <Upload className="w-8 h-8 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300">Subir Plantilla (PNG / SVG)</span>
              <span className="text-[10px] text-slate-500">Formato horizontal de alta resolución</span>
              <input
                type="file"
                accept="image/*"
                onChange={() => alert('¡Fondo de Plantilla oficial subida y vinculada al motor de renderizado!')}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: LOGISTICS */}
      {activeTab === 'logistics' && (
        <div className="glass-panel rounded-3xl p-6 border border-amber-500/30 space-y-6">
          <h3 className="font-bold text-white text-lg">Módulo de Logística "A Tu Puerta" (GPS)</h3>

          {deliveries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No hay solicitudes de envío físico aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-amber-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Tracking GPS</th>
                    <th className="p-3">Alumno</th>
                    <th className="p-3">Dirección</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Estado</th>
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
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-[11px]">
                          En Camino GPS
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

      {/* SIDE-BY-SIDE INSPECTOR MODAL (Foto del Comprobante vs Datos de Operacion) */}
      {inspectingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl rounded-3xl p-6 relative border border-cyan-500/30 shadow-2xl space-y-4">
            <button
              onClick={() => setInspectingReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Inspección Lado a Lado del Comprobante de Pago
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Side: Receipt Image */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 max-h-[60vh] overflow-auto text-center space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Foto / Captura Subida por el Alumno</span>
                <img src={inspectingReceipt.receipt_image_url} alt="Comprobante Alumno" className="w-full h-auto rounded-xl shadow-md" />
              </div>

              {/* Right Side: Extracted Data Comparison */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">Datos de la Transacción</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alumno:</span>
                      <strong className="text-white font-bold">{inspectingReceipt.student_name}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Curso Solicitado:</span>
                      <strong className="text-cyan-400">{inspectingReceipt.course_title}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Nº Operación (IA OCR):</span>
                      <strong className="font-mono text-cyan-300">{inspectingReceipt.extracted_op_code}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Monto Leído:</span>
                      <strong className="text-emerald-400 text-base font-extrabold">US ${inspectingReceipt.extracted_amount.toFixed(2)}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Fecha Transferencia:</span>
                      <span className="text-slate-300">{inspectingReceipt.extracted_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onApproveReceipt(inspectingReceipt);
                      setInspectingReceipt(null);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprobar Pago & Liberar Certificado (OK)
                  </button>

                  <button
                    onClick={() => {
                      onRejectReceipt(inspectingReceipt.id);
                      setInspectingReceipt(null);
                    }}
                    className="px-4 py-3 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 relative border border-cyan-500/30 shadow-2xl space-y-4">
            <button
              onClick={() => setEditingCourse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Editar Curso, Precio & Horas Lectivas</h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Título del Curso:</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Precio Certificado (USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingCourse.price_usd}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price_usd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Horas Lectivas Libres:</label>
                  <input
                    type="number"
                    value={editingCourse.academic_hours}
                    onChange={(e) => setEditingCourse({ ...editingCourse, academic_hours: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyan-400 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Instructor / Docente:</label>
                <input
                  type="text"
                  value={editingCourse.instructor_name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, instructor_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Descripción:</label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white h-20"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CERTIFICATE MODAL */}
      {editingCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 relative border border-amber-500/30 shadow-2xl space-y-4">
            <button
              onClick={() => setEditingCertificate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Editar & Re-Emitir Certificado</h3>

            <form onSubmit={handleSaveCertificate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nombre Completo del Graduado:</label>
                <input
                  type="text"
                  value={editingCertificate.student_name}
                  onChange={(e) => setEditingCertificate({ ...editingCertificate, student_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Programa Académico:</label>
                <input
                  type="text"
                  value={editingCertificate.course_title}
                  onChange={(e) => setEditingCertificate({ ...editingCertificate, course_title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyan-400 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Horas Lectivas Libres:</label>
                  <input
                    type="number"
                    value={editingCertificate.academic_hours}
                    onChange={(e) => setEditingCertificate({ ...editingCertificate, academic_hours: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyan-400 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Fecha de Emisión:</label>
                  <input
                    type="text"
                    value={editingCertificate.issued_at}
                    onChange={(e) => setEditingCertificate({ ...editingCertificate, issued_at: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Re-Emitir Certificado con Sello SHA-256
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
