'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentCourses } from '@/components/StudentCourses';
import { CertificateViewer } from '@/components/CertificateViewer';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PublicVerification } from '@/components/PublicVerification';
import { UserRole, PaymentReceipt, Certificate, Course } from '@/types';
import { INITIAL_RECEIPTS, INITIAL_CERTIFICATES } from '@/lib/mockData';
import { fetchVigentesCoursesFromQuinto } from '@/lib/quintoClient';
import { sendStudentReleaseNotification } from '@/lib/notificationService';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('courses');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [courses, setCourses] = useState<Course[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [verifyHash, setVerifyHash] = useState<string>('');

  useEffect(() => {
    async function loadCourses() {
      const data = await fetchVigentesCoursesFromQuinto();
      setCourses(data);
    }
    loadCourses();
  }, []);

  const handleAddReceipt = (newReceipt: PaymentReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    alert('¡Comprobante leído por OCR y enviado a WhatsApp del Administrador con éxito!');
  };

  const handleApproveReceipt = (receipt: PaymentReceipt) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receipt.id ? { ...r, admin_approval_status: 'approved' } : r))
    );

    const newCert: Certificate = {
      id: 'cert-' + Date.now(),
      enrollment_id: 'enr-' + Date.now(),
      student_name: receipt.student_name,
      course_title: receipt.course_title,
      academic_hours: 60,
      instructor_name: 'Equipo Especializado Quinto Eje',
      hash_sha256: receipt.receipt_hash,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://miscertificados.quinto.app/validar/${receipt.receipt_hash}`,
      issued_at: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setCertificates((prev) => [newCert, ...prev]);

    // Send Automated Release Notifications to Student via WhatsApp & Email
    sendStudentReleaseNotification(newCert);

    alert(`¡Pago de ${receipt.student_name} APROBADO (OK)!

1. Certificado liberado exitosamente.
2. Notificación push de WhatsApp y Email enviada automáticamente al alumno con el enlace de descarga.`);
  };

  const handleRejectReceipt = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, admin_approval_status: 'rejected' } : r))
    );
  };

  const handleUpdateCertificate = (updatedCert: Certificate) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === updatedCert.id ? updatedCert : c))
    );
  };

  const handleDeleteCertificate = (certId: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== certId));
  };

  const handleAddDelivery = (deliveryRecord: any) => {
    setDeliveries((prev) => [deliveryRecord, ...prev]);
    alert('¡Solicitud de despacho a domicilio "A Tu Puerta" registrada en el sistema logístico!');
  };

  const handleTriggerVerify = (hash: string) => {
    setVerifyHash(hash);
    setCurrentTab('verify');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          userRole={userRole}
          setUserRole={setUserRole}
        />

        <main className="max-w-7xl mx-auto p-6 md:p-8">
          {currentTab === 'courses' && (
            <StudentCourses onAddReceipt={handleAddReceipt} />
          )}

          {currentTab === 'certificates' && (
            <CertificateViewer
              certificates={certificates}
              onVerifyHash={handleTriggerVerify}
              onAddDelivery={handleAddDelivery}
            />
          )}

          {currentTab === 'admin' && (
            <AdminDashboard
              courses={courses}
              receipts={receipts}
              certificates={certificates}
              deliveries={deliveries}
              onUpdateCourses={setCourses}
              onApproveReceipt={handleApproveReceipt}
              onRejectReceipt={handleRejectReceipt}
              onUpdateCertificate={handleUpdateCertificate}
              onDeleteCertificate={handleDeleteCertificate}
            />
          )}

          {currentTab === 'verify' && (
            <PublicVerification
              certificates={certificates}
              initialHash={verifyHash}
            />
          )}
        </main>
      </div>

      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Mis Certificados — Subsistema Oficial del Ecosistema Quinto. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
