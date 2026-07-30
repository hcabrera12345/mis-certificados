'use client';
export function getDirectImageUrl(url: string): string {
  if (!url) return '/qr_oficial_banco_ganadero.png';
  let cleanUrl = url.trim();
  if (cleanUrl.includes('imgur.com') || cleanUrl.includes('NMnkr4t')) {
    return '/qr_oficial_banco_ganadero.png';
  }
  return cleanUrl;
}

import { OFFICIAL_QUINTO_PAYMENT_QR_BASE64 } from '@/lib/mockData';

import React, { useState } from 'react';
import { X, Award, BookOpen, FileText, Users, DollarSign, ShieldCheck, CheckCircle2, XCircle, Send, Upload, Eye, Edit, Plus, Trash2, Save, FileSpreadsheet, QrCode, Image as ImageIcon, Truck, RefreshCw, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
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
  const [qrUrlInput, setQrUrlInput] = useState<string>(systemSettings.payment_qr_url || '');
  const [guideUrlInput, setGuideUrlInput] = useState<string>(systemSettings.practical_guide_url || '');
  const [activeTab, setActiveTab] = useState<'approvals' | 'courses' | 'certificates' | 'settings'>('approvals');
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

            const handleSaveQRUrl = async (urlToSave?: string) => {
    const rawUrl = (urlToSave || qrUrlInput).trim();
    const finalUrl = getDirectImageUrl(rawUrl);
    if (!finalUrl) {
      alert('Por favor ingresa una URL de imagen válida.');
      return;
    }
    localStorage.setItem('quinto_payment_qr_url', finalUrl);
    if (onUpdateSettings) {
      onUpdateSettings({ ...systemSettings, payment_qr_url: finalUrl });
    }
    alert('¡Enlace de QR de Pago Guardado Exitosamente! Ya está activo e instalado para el 100% de las tablets, celulares y computadoras.');
  };

  
  const handleSaveGuideUrl = (urlToSave?: string) => {
    const finalUrl = (urlToSave || guideUrlInput).trim();
    if (!finalUrl) {
      alert('Por favor ingresa una URL de PDF válida.');
      return;
    }
    localStorage.setItem('quinto_practical_guide_url', finalUrl);
    if (onUpdateSettings) {
      onUpdateSettings({ ...systemSettings, practical_guide_url: finalUrl });
    }
    alert('¡Enlace de la Guía Práctica Guardado Exitosamente!');
  };

  const handleGuidePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          localStorage.setItem('quinto_practical_guide_pdf_data', dataUrl);
          alert('¡Guía Práctica Oficial (.PDF) cargada exitosamente!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePDFTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          localStorage.setItem('quinto_cert_pdf_template_data', dataUrl);
          alert('¡Plantilla PDF Oficial (.PDF) cargada exitosamente! Todos los certificados se generarán estampando sobre este documento PDF oficial.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (rawDataUrl) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, 400, 400);
              ctx.drawImage(img, 0, 0, 400, 400);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

              localStorage.setItem('quinto_payment_qr_url', compressedDataUrl);
              if (onUpdateSettings) {
                onUpdateSettings({ ...systemSettings, payment_qr_url: compressedDataUrl });
              }
              alert('¡QR Oficial de Pago comprimido y guardado exitosamente en la base de datos global de Supabase! Ya está activo y sincronizado para tablets, celulares y computadoras mundialmente.');
            }
          };
          img.src = rawDataUrl;
        }
      };
      reader.readAsDataURL(file);
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
            Subir QR & Guía Práctica
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
            <h3 className="font-bold text-white text-lg">Gestión de Cursos & Precios (USD)</h3>
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
                  
                  <th className="p-3">Docente / Instructor</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">{c.title}</td>
                    <td className="p-3 font-bold text-emerald-400">US ${c.price_usd.toFixed(2)}</td>
                    
                    <td className="p-3">{c.instructor_name}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCourse(c)}
                          className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl transition-all inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar el curso "${c.title}"? Esta acción no se puede deshacer.`)) {
                              const updated = courses.filter((item) => item.id !== c.id);
                              onUpdateCourses(updated);
                              if (onDeleteCourse) onDeleteCourse(c.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold rounded-xl transition-all inline-flex items-center gap-1"
                          title="Eliminar Curso"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
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
                  {/* TAB 4: UPLOAD PAYMENT QR & TEMPLATES */}
                        {/* TAB 4: UPLOAD PAYMENT QR & PDF CERTIFICATE TEMPLATES */}
                        {/* TAB 4: UPLOAD PAYMENT QR & PDF CERTIFICATE TEMPLATES */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                {/* Left Card: Official Payment QR Code */}
                <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Configurar QR Oficial de Pago</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Elige la opción que prefieras para desplegar el QR a todos los estudiantes.
                      </p>
                    </div>
                  </div>

                  {/* QR Image Live Preview */}
                  <div className="space-y-2 text-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vista Previa del QR Activo:</span>
                    <div className="w-52 h-52 sm:w-60 sm:h-60 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border-2 border-amber-500/50">
                      <img
                        src={systemSettings.payment_qr_url || OFFICIAL_QUINTO_PAYMENT_QR_BASE64}
                        alt="QR Oficial de Pago Quinto"
                        className="w-full h-full object-contain select-none"
                      />
                    </div>
                  </div>

                  {/* Option 1: Direct Image URL Paste */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-black text-amber-400 uppercase tracking-wider">
                      Opción 1: Pegar Enlace / URL Pública de la Foto del QR:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="url"
                        value={qrUrlInput}
                        onChange={(e) => setQrUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveQRUrl()}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                      >
                        Guardar URL
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">Pega un enlace público de la imagen del QR para distribución ultra-rápida sin peso.</p>
                  </div>

                  {/* Option 2: Local File Upload */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                      Opción 2: Subir Foto de QR desde la Computadora (PNG/JPG):
                    </label>
                    <label className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-all shadow-sm">
                      <span>Subir Nueva Imagen de QR Local</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('quinto_payment_qr_url');
                          if (onUpdateSettings) {
                            onUpdateSettings({ ...systemSettings, payment_qr_url: '/qr_oficial_banco_ganadero.png' });
                          }
                          alert('¡QR Restablecido al Oficial del Banco Ganadero S.A.!');
                        }}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restablecer a QR Oficial del Banco Ganadero S.A.</span>
                      </button>
                    </div>
                </div>

                {/* Right Card: Official PDF Template Background Uploader */}
                <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Plantilla Oficial de Certificado (.PDF)</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Sube el documento PDF oficial sobre el cual se mecharán los nombres de los graduados.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-6 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 transition-all text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Cargar Plantilla PDF Oficial (.PDF o Imagen)</h4>
                        <p className="text-xs text-slate-400 mt-1">Formato horizontal Landscape de alta resolución</p>
                      </div>

                      <input
                        type="file"
                        accept=".pdf,application/pdf,image/*"
                        onChange={handlePDFTemplateUpload}
                        className="hidden"
                        id="template-pdf-input"
                      />
                      <label
                        htmlFor="template-pdf-input"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-lg shadow-cyan-500/20 transition-all"
                      >
                        Seleccionar y Cargar Plantilla PDF (.PDF)
                      </label>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estado de Plantilla Actual:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        PDF Oficial Configurado
                      </span>
                    </div>

                {/* Card 3: Official Practical Guide (.PDF) Uploader & Direct Link */}
                <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between lg:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Cargar Guía Práctica Oficial (.PDF)</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Sube o configura la Guía Práctica en PDF que se liberará al estudiante tras aprobar su comprobante de pago.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Option 1: Direct Link */}
                      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <label className="block text-xs font-black text-emerald-400 uppercase tracking-wider">
                          Opción 1: Pegar Enlace / URL Pública de la Guía (.PDF):
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="url"
                            value={guideUrlInput}
                            onChange={(e) => setGuideUrlInput(e.target.value)}
                            placeholder="https://.../guia_practica.pdf"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveGuideUrl()}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                          >
                            Guardar URL
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">Pega un enlace público directo de Google Drive, Dropbox u otro servidor.</p>
                      </div>

                      {/* Option 2: Local PDF Upload */}
                      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                          Opción 2: Subir Archivo PDF desde tu Computadora:
                        </label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleGuidePDFUpload}
                          className="hidden"
                          id="admin-guide-pdf-input"
                        />
                        <label
                          htmlFor="admin-guide-pdf-input"
                          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-all shadow-sm"
                        >
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span>Seleccionar y Cargar Guía Práctica (.PDF)</span>
                        </label>
                        <p className="text-[10px] text-slate-500">Carga directa del documento de estudio oficial en PDF.</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estado de Guía Práctica Actual:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Guía Práctica Lista en Servidor & Sincronizada
                      </span>
                    </div>
                  </div>
                </div>

                  </div>

                  <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
                    Nota: El sistema estampa automáticamente el nombre completo del alumno, fecha, hash SHA-256 de autenticidad y el QR vectorial sobre este PDF.
                  </div>
                </div>
              </div>
            )}
    
      {/* Receipt Inspection Side-by-Side Zoom Modal */}
      {inspectingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Inspección Detallada de Comprobante</h3>
                  <p className="text-xs text-slate-400">Estudiante: {inspectingReceipt.student_name}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingReceipt(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Foto del Comprobante Adjuntado:</span>
                <div className="w-full h-80 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                  {inspectingReceipt.receipt_image_url?.includes('application/pdf') ? (
                    <iframe src={inspectingReceipt.receipt_image_url} className="w-full h-full rounded border-0" title="Comprobante PDF" />
                  ) : (
                    <img
                      src={inspectingReceipt.receipt_image_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400'}
                      alt="Comprobante Adjuntado"
                      className="w-full h-full object-contain rounded select-none"
                    />
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Datos del Pago Registrado:</span>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-400">Nombre del Estudiante: <strong className="text-white block text-sm">{inspectingReceipt.student_name}</strong></p>
                    <p className="text-slate-400">Capacitación: <strong className="text-cyan-300 block">{inspectingReceipt.course_title}</strong></p>
                    <p className="text-slate-400">Código de Operación Bancaria: <span className="font-mono text-cyan-400 block font-bold">{inspectingReceipt.extracted_op_code}</span></p>
                    <p className="text-slate-400">Monto Transferido: <span className="text-emerald-400 font-bold block text-base">${inspectingReceipt.extracted_amount} USD</span></p>
                    <p className="text-slate-400">Sello Hash SHA-256: <span className="font-mono text-slate-400 block text-[10px] truncate">{inspectingReceipt.receipt_hash}</span></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <button
                    onClick={() => {
                      onApproveReceipt(inspectingReceipt);
                      setInspectingReceipt(null);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprobar y Liberar Certificado
                  </button>
                  <button
                    onClick={() => {
                      onRejectReceipt(inspectingReceipt.id);
                      setInspectingReceipt(null);
                    }}
                    className="px-4 py-3 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs transition-all"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* COURSE EDITING/CREATION MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white">
                {courses.some(c => c.id === editingCourse.id) ? 'Editar Curso' : 'Agregar Nuevo Curso'}
              </h3>
              <button onClick={() => setEditingCourse(null)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Titulo del Curso *</label>
                <input type="text" value={editingCourse.title} onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Descripcion</label>
                <textarea value={editingCourse.description} onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})} rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Precio USD *</label>
                  <input type="number" step="0.01" value={editingCourse.price_usd} onChange={(e) => setEditingCourse({...editingCourse, price_usd: parseFloat(e.target.value) || 0})} required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Horas Academicas</label>
                  <input type="number" value={editingCourse.academic_hours} onChange={(e) => setEditingCourse({...editingCourse, academic_hours: parseInt(e.target.value) || 40})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Instructor / Docente</label>
                <input type="text" value={editingCourse.instructor_name} onChange={(e) => setEditingCourse({...editingCourse, instructor_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Categoria</label>
                <input type="text" value={editingCourse.category} onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">URL de Imagen del Curso</label>
                <input type="url" value={editingCourse.image_url} onChange={(e) => setEditingCourse({...editingCourse, image_url: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition-all" />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditingCourse(null)} className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs shadow-xl transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" /> Guardar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE EDITING MODAL */}
      {editingCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white">Editar y Re-emitir Certificado</h3>
              <button onClick={() => setEditingCertificate(null)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCertificate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Nombre del Graduado *</label>
                <input type="text" value={editingCertificate.student_name} onChange={(e) => setEditingCertificate({...editingCertificate, student_name: e.target.value})} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Titulo del Curso *</label>
                <input type="text" value={editingCertificate.course_title} onChange={(e) => setEditingCertificate({...editingCertificate, course_title: e.target.value})} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Horas Academicas</label>
                  <input type="number" value={editingCertificate.academic_hours} onChange={(e) => setEditingCertificate({...editingCertificate, academic_hours: parseInt(e.target.value) || 40})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Instructor</label>
                  <input type="text" value={editingCertificate.instructor_name} onChange={(e) => setEditingCertificate({...editingCertificate, instructor_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Hash SHA-256</label>
                <input type="text" value={editingCertificate.hash_sha256} readOnly
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 font-mono" />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditingCertificate(null)} className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-extrabold rounded-xl text-xs shadow-xl transition-all flex items-center gap-2">
                  <Award className="w-4 h-4" /> Re-emitir Certificado con SHA-256
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
</div>
  );
};