'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentCourses } from '@/components/StudentCourses';
import { CertificateViewer } from '@/components/CertificateViewer';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PublicVerification } from '@/components/PublicVerification';
import { AuthModal } from '@/components/AuthModal';
import { UserRole, PaymentReceipt, Certificate, Course, SystemSettings } from '@/types';
import { INITIAL_RECEIPTS, INITIAL_CERTIFICATES, MOCK_COURSES, DEFAULT_SETTINGS } from '@/lib/mockData';
import { sendStudentReleaseNotification } from '@/lib/notificationService';
import { getCoursesFromDB, getReceiptsFromDB, getCertificatesFromDB, saveReceiptToDB, saveCertificateToDB, updateReceiptStatusInDB } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('courses');
  const [authDebugMsg, setAuthDebugMsg] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState<{ email: string; name: string; role: UserRole } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [verifyHash, setVerifyHash] = useState<string>('');

  useEffect(() => {
    // 1. Carga de Datos desde la Base de Datos
    async function initData() {
      const dbCourses = await getCoursesFromDB();
      const dbReceipts = await getReceiptsFromDB();
      const dbCerts = await getCertificatesFromDB();

      if (dbCourses && dbCourses.length > 0) setCourses(dbCourses);
      if (dbReceipts && dbReceipts.length > 0) setReceipts(dbReceipts);
      if (dbCerts && dbCerts.length > 0) setCertificates(dbCerts);
    }
    initData();

    // 2. Procesador unificado de sesión
    const processSession = (session: any) => {
      if (session?.user) {
        const email = session.user.email || '';
        const isUserAdmin = email.toLowerCase() === 'admin@quinto.app' || session.user.user_metadata?.role === 'admin';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0] || 'Estudiante Quinto';
        const role: UserRole = isUserAdmin ? 'admin' : 'student';

        setUserProfile({ email, name, role });
        setUserRole(role);

        // Limpiar la URL manteniendo la estética limpia
        if (typeof window !== 'undefined' && (window.location.search.includes('code=') || window.location.hash.includes('access_token'))) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    // 3. Manejador de intercambio de código OAuth PKCE en el cliente
    async function checkOAuthCallback() {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          try {
            setAuthDebugMsg('Procesando código de autenticación de Google...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              setAuthDebugMsg(`Error de Google Auth en Supabase: ${error.message}`);
            } else if (data.session) {
              setAuthDebugMsg(`¡Autenticación exitosa! Bienvenido ${data.session.user.email}`);
              processSession(data.session);
              return;
            }
          } catch (e: any) {
            setAuthDebugMsg(`Excepción en Auth Callback: ${e.message}`);
          }
        }
      }

      // Verificación regular de sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      processSession(session);
    }

    checkOAuthCallback();

    // 4. Listener reactivo en tiempo real para eventos de autenticación (SIGNED_IN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        processSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setUserRole('student');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const handleCreateReceipt = async (receipt: PaymentReceipt) => {
    const newReceipts = [receipt, ...receipts];
    setReceipts(newReceipts);
    await saveReceiptToDB(receipt);
  };

  const handleApproveReceipt = async (receipt: PaymentReceipt) => {
    const updatedReceipts = receipts.map((r) =>
      r.id === receipt.id ? { ...r, admin_approval_status: 'approved' as const } : r
    );
    setReceipts(updatedReceipts);
    await updateReceiptStatusInDB(receipt.id, 'approved');

    const courseObj = courses.find((c) => c.title === receipt.course_title) || courses[0];
    const newCert: Certificate = {
      id: 'cert-' + Date.now(),
      enrollment_id: 'enr-' + Date.now(),
      student_name: receipt.student_name,
      course_title: receipt.course_title,
      academic_hours: courseObj ? courseObj.academic_hours : 40,
      instructor_name: courseObj ? courseObj.instructor_name : 'Directorio Quinto',
      hash_sha256: receipt.receipt_hash,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://miscertificados.quinto.app/validar/${receipt.receipt_hash}`,
      issued_at: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const newCertificates = [newCert, ...certificates];
    setCertificates(newCertificates);
    await saveCertificateToDB(newCert);

    sendStudentReleaseNotification(newCert, '+51 987654321', 'alumno@quinto.app');

    alert(`¡Certificado para ${receipt.student_name} emitido exitosamente! Se envió la alerta por WhatsApp.`);
  };

  const handleRejectReceipt = async (receiptId: string) => {
    const updatedReceipts = receipts.map((r) =>
      r.id === receiptId ? { ...r, admin_approval_status: 'rejected' as const } : r
    );
    setReceipts(updatedReceipts);
    await updateReceiptStatusInDB(receiptId, 'rejected');
  };

  const handleUpdateCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
  };

  const handleUpdateCertificate = (updatedCert: Certificate) => {
    const updated = certificates.map((c) => (c.id === updatedCert.id ? updatedCert : c));
    setCertificates(updated);
  };

  const handleDeleteCertificate = (certId: string) => {
    setCertificates(certificates.filter((c) => c.id !== certId));
  };

  const handleRequestPhysicalDelivery = (deliveryInfo: any) => {
    setDeliveries([...deliveries, deliveryInfo]);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white font-sans antialiased">
      
      {authDebugMsg && (
        <div className="bg-gradient-to-r from-cyan-950 to-blue-950 border-b border-cyan-500/40 text-cyan-200 px-4 py-2 text-xs text-center font-mono font-bold flex items-center justify-center justify-between">
          <span>🔍 Diagnóstico de Autenticación: {authDebugMsg}</span>
          <button onClick={() => setAuthDebugMsg('')} className="text-slate-400 hover:text-white ml-4">✕</button>
        </div>
      )}

      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        userProfile={userProfile}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'courses' && (
          <StudentCourses
            paymentQrUrl={systemSettings.payment_qr_url}
            onAddReceipt={handleCreateReceipt}
          />
        )}

        {currentTab === 'my-certificates' && (
          <CertificateViewer
            certificates={certificates}
            onVerifyHash={(hash) => {
              setVerifyHash(hash);
              setCurrentTab('verify');
            }}
            onAddDelivery={handleRequestPhysicalDelivery}
          />
        )}

        {currentTab === 'admin' && userRole === 'admin' && (
          <AdminDashboard
            courses={courses}
            receipts={receipts}
            certificates={certificates}
            deliveries={deliveries}
            systemSettings={systemSettings}
            onUpdateCourses={handleUpdateCourses}
            onApproveReceipt={handleApproveReceipt}
            onRejectReceipt={handleRejectReceipt}
            onUpdateCertificate={handleUpdateCertificate}
            onDeleteCertificate={handleDeleteCertificate}
            onUpdateSettings={setSystemSettings}
          />
        )}

        {currentTab === 'verify' && (
          <PublicVerification
            certificates={certificates}
            initialHash={verifyHash}
          />
        )}
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </main>
  );
}
