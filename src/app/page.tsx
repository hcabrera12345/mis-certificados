'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentCourses } from '@/components/StudentCourses';
import { CertificateViewer } from '@/components/CertificateViewer';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PublicVerification } from '@/components/PublicVerification';
import { AuthModal } from '@/components/AuthModal';
import { UserRole, PaymentReceipt, Certificate, Course } from '@/types';
import { INITIAL_RECEIPTS, INITIAL_CERTIFICATES } from '@/lib/mockData';
import { fetchVigentesCoursesFromQuinto } from '@/lib/quintoClient';
import { sendStudentReleaseNotification } from '@/lib/notificationService';
import { getCoursesFromDB, getReceiptsFromDB, getCertificatesFromDB, saveReceiptToDB, saveCertificateToDB, updateReceiptStatusInDB } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('courses');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState<{ email: string; name: string; role: UserRole } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [verifyHash, setVerifyHash] = useState<string>('');

  useEffect(() => {
    async function initData() {
      // Supabase Live DB Load
      const dbCourses = await getCoursesFromDB();
      const dbReceipts = await getReceiptsFromDB();
      const dbCerts = await getCertificatesFromDB();

      setCourses(dbCourses);
      setReceipts(dbReceipts);
      setCertificates(dbCerts);
    }
    initData();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const role = (session.user.user_metadata?.role as UserRole) || (session.user.email?.includes('admin') ? 'admin' : 'student');
        setUserProfile({
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
          role: role
        });
        setUserRole(role);
      }
    });
  }, []);

  const handleAuthSuccess = (profile: { email: string; name: string; role: UserRole }) => {
    setUserProfile(profile);
    setUserRole(profile.role);
    setShowAuthModal(false);
    if (profile.role === 'admin') {
      setCurrentTab('admin');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setUserRole('student');
    setCurrentTab('courses');
  };

  const handleAddReceipt = async (newReceipt: PaymentReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    await saveReceiptToDB(newReceipt);
    alert('¡Comprobante guardado en Supabase, leído por OCR y notificado por WhatsApp al Administrador con éxito!');
  };

  const handleApproveReceipt = async (receipt: PaymentReceipt) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receipt.id ? { ...r, admin_approval_status: 'approved' } : r))
    );

    await updateReceiptStatusInDB(receipt.id, 'approved');

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
    await saveCertificateToDB(newCert);

    // Send Automated Release Notifications to Student via WhatsApp & Email
    sendStudentReleaseNotification(newCert);

    alert(`¡Pago de ${receipt.student_name} APROBADO (OK)!

1. Certificado guardado y liberado en Supabase.
2. Notificación push de WhatsApp enviada al estudiante.`);
  };

  const handleRejectReceipt = async (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, admin_approval_status: 'rejected' } : r))
    );
    await updateReceiptStatusInDB(receiptId, 'rejected');
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
          userProfile={userProfile}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
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

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Mis Certificados — Subsistema Oficial del Ecosistema Quinto. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
