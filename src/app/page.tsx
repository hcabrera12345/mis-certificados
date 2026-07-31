'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentCourses } from '@/components/StudentCourses';
import { CertificateViewer } from '@/components/CertificateViewer';
import { PublicVerification } from '@/components/PublicVerification';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthModal } from '@/components/AuthModal';
import { MOCK_COURSES, DEFAULT_SETTINGS, OFFICIAL_QUINTO_PAYMENT_QR_BASE64 } from '@/lib/mockData';
import { Course, PaymentReceipt, Certificate, UserRole, SystemSettings } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { 
  getCoursesFromDB, 
  getReceiptsFromDB, 
  getCertificatesFromDB, 
  saveReceiptToDB, 
  saveCertificateToDB, 
  updateReceiptStatusInDB,
  saveCourseToDB,
  deleteCourseFromDB,
  getSystemSettingsFromDB,
  saveSystemSettingsToDB
} from '@/lib/supabaseService';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('courses');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState<{ email: string; name: string; role: UserRole; id?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedHashForVerification, setSelectedHashForVerification] = useState<string | null>(null);

  // Core Dynamic State
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // ---------------------------------------------------------------------------
  // 1. AUTHENTICATION MOTOR: Google OAuth Hash Parser & Supabase Session Listener
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const checkDirectHashToken = async () => {
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (data.session?.user) {
              const u = data.session.user;
              const email = u.email || 'usuario@quinto.app';
              const isAdmin = email.toLowerCase() === 'admin@quinto.app' || email.toLowerCase().includes('quinto.app');
              setUserProfile({
                email: email,
                name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Usuario Quinto',
                role: isAdmin ? 'admin' : 'student',
                id: u.id
              });
              setUserRole(isAdmin ? 'admin' : 'student');
              window.history.replaceState(null, '', window.location.pathname);
            }
          } catch (e) {
            console.error('Error setting OAuth session:', e);
          }
        }
      }
    };

    checkDirectHashToken();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const email = u.email || 'usuario@quinto.app';
        const isAdmin = email.toLowerCase() === 'admin@quinto.app' || email.toLowerCase().includes('quinto.app');
        setUserProfile({
          email: email,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Usuario Quinto',
          role: isAdmin ? 'admin' : 'student',
          id: u.id
        });
        setUserRole(isAdmin ? 'admin' : 'student');
      } else {
        setUserProfile((prev) => (prev?.role === 'admin' ? prev : null));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. DATA PERSISTENCE: Dynamic Courses, QR Code, Receipts & Certificates
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      // Courses
      const savedCourses = localStorage.getItem('quinto_courses_list');
      if (savedCourses) {
        try {
          const parsed = JSON.parse(savedCourses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(parsed);
          }
        } catch (e) {}
      }

      // Settings (QR + Guide)
      const savedQr = localStorage.getItem('quinto_payment_qr_url');
      const activeQr = savedQr || '/qr_oficial_banco_ganadero.png';
      setSystemSettings((prev) => ({ ...prev, payment_qr_url: activeQr }));

      try {
        const dbSettings = await getSystemSettingsFromDB();
        if (dbSettings) {
          if (dbSettings.payment_qr_url && dbSettings.payment_qr_url.length > 10) {
            setSystemSettings((prev) => ({ ...prev, payment_qr_url: dbSettings.payment_qr_url! }));
            localStorage.setItem('quinto_payment_qr_url', dbSettings.payment_qr_url);
          }
          if (dbSettings.practical_guide_url) {
            localStorage.setItem('quinto_practical_guide_url', dbSettings.practical_guide_url);
          }
          if (dbSettings.practical_guide_pdf_data) {
            localStorage.setItem('quinto_practical_guide_pdf_data', dbSettings.practical_guide_pdf_data);
          }
        }
      } catch (e) {}

      // Receipts
      try {
        const savedReceipts = localStorage.getItem('quinto_receipts_list');
        let localR: PaymentReceipt[] = [];
        if (savedReceipts) {
          try {
            localR = JSON.parse(savedReceipts) || [];
          } catch(e) {}
        }

        const dbReceipts = await getReceiptsFromDB();
        if (dbReceipts && dbReceipts.length > 0) {
          const map = new Map<string, PaymentReceipt>();
          localR.forEach(r => map.set(r.id, r));
          dbReceipts.forEach(r => map.set(r.id, r));
          const combined = Array.from(map.values());
          setReceipts(combined);
          localStorage.setItem('quinto_receipts_list', JSON.stringify(combined));
        } else if (localR.length > 0) {
          setReceipts(localR);
        }
      } catch (e) {}

      // Certificates
      try {
        const savedCerts = localStorage.getItem('quinto_certificates_list');
        let localC: Certificate[] = [];
        if (savedCerts) {
          try {
            localC = JSON.parse(savedCerts) || [];
          } catch(e) {}
        }

        const dbCerts = await getCertificatesFromDB();
        if (dbCerts && dbCerts.length > 0) {
          const map = new Map<string, Certificate>();
          localC.forEach(c => map.set(c.id || c.hash_sha256, c));
          dbCerts.forEach(c => map.set(c.id || c.hash_sha256, c));
          const combined = Array.from(map.values());
          setCertificates(combined);
          localStorage.setItem('quinto_certificates_list', JSON.stringify(combined));
        } else if (localC.length > 0) {
          setCertificates(localC);
        }
      } catch (err) {
        console.error('Error syncing certs:', err);
      }
    }

    loadData();
  }, []);

  // ---------------------------------------------------------------------------
  // 3. ADMIN COURSE MUTATION HANDLERS
  // ---------------------------------------------------------------------------
  const handleUpdateCourses = async (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
    localStorage.setItem('quinto_courses_list', JSON.stringify(updatedCourses));
    for (const c of updatedCourses) {
      await saveCourseToDB(c);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    localStorage.setItem('quinto_courses_list', JSON.stringify(updated));
    await deleteCourseFromDB(courseId);
  };

  // ---------------------------------------------------------------------------
  // 4. RECEIPT & CERTIFICATE HANDLERS
  // ---------------------------------------------------------------------------
  const handleCreateReceipt = async (newReceipt: PaymentReceipt) => {
    setReceipts((prev) => {
      const updated = [newReceipt, ...prev.filter(r => r.id !== newReceipt.id)];
      localStorage.setItem('quinto_receipts_list', JSON.stringify(updated));
      return updated;
    });
    await saveReceiptToDB(newReceipt);
  };

  const handleApproveReceipt = async (receipt: PaymentReceipt) => {
    // 1. Update receipt approval status locally and in DB
    setReceipts((prev) => {
      const updatedR = prev.map((r) => (r.id === receipt.id ? { ...r, admin_approval_status: 'approved' as const } : r));
      localStorage.setItem('quinto_receipts_list', JSON.stringify(updatedR));
      return updatedR;
    });
    await updateReceiptStatusInDB(receipt.id, 'approved');

    // 2. Generate and issue Certificate
    const validHash = receipt.receipt_hash || ('SHA256-' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)).toUpperCase();
    const newCert: Certificate = {
      id: 'cert-' + Date.now(),
      enrollment_id: receipt.id,
      student_name: receipt.student_name,
      student_email: receipt.student_email || userProfile?.email || '',
      course_title: receipt.course_title,
      academic_hours: 40,
      instructor_name: 'Directorio Quinto',
      hash_sha256: validHash,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://mis-certificados.quinto.app/validar/${validHash}`,
      issued_at: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    setCertificates((prev) => {
      const updatedC = [newCert, ...prev.filter(c => c.id !== newCert.id && c.hash_sha256 !== newCert.hash_sha256)];
      localStorage.setItem('quinto_certificates_list', JSON.stringify(updatedC));
      return updatedC;
    });

    // 3. Save Certificate to DB (System Row 97 + Table)
    await saveCertificateToDB(newCert);

    alert(`¡Certificado emitido exitosamente para ${receipt.student_name}! Ya está disponible para el estudiante.`);
  };

  const handleRejectReceipt = async (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, admin_approval_status: 'rejected' } : r))
    );
    await updateReceiptStatusInDB(receiptId, 'rejected');
  };

  const handleUpdateCertificate = async (updatedCert: Certificate) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === updatedCert.id ? updatedCert : c))
    );
    await saveCertificateToDB(updatedCert);
  };

  const handleDeleteCertificate = (certId: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== certId));
  };

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
    if (newSettings.payment_qr_url) {
      localStorage.setItem('quinto_payment_qr_url', newSettings.payment_qr_url);
    }
    await saveSystemSettingsToDB(newSettings);
  };

  const handleVerifyHash = (hash: string) => {
    setSelectedHashForVerification(hash);
    setCurrentTab('verify');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setUserRole('student');
    setCurrentTab('courses');
  };

  // Filter certificates for student view: match by email OR name (case-insensitive)
  const userCertificates = userRole === 'admin'
    ? certificates
    : certificates.filter(c => {
        if (!userProfile) return true; // Show all if student is viewing without filter
        const certEmail = (c.student_email || '').toLowerCase().trim();
        const userEmail = (userProfile.email || '').toLowerCase().trim();
        const certName = (c.student_name || '').toLowerCase().trim();
        const userName = (userProfile.name || '').toLowerCase().trim();

        return (certEmail && certEmail === userEmail) ||
               (certName && certName.includes(userName)) ||
               (userName && userName.includes(certName)) ||
               (!certEmail && !certName);
      });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        userProfile={userProfile}
        onOpenAuth={() => setShowAuthModal(true)}
        onDirectAdminLogin={() => {
          setUserRole('admin');
          setUserProfile({
            email: 'admin@quinto.app',
            name: 'Hernan (Director Quinto)',
            role: 'admin'
          });
          setCurrentTab('admin');
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'courses' && (
          <StudentCourses
            courses={courses}
            paymentQrUrl={systemSettings.payment_qr_url}
            onAddReceipt={handleCreateReceipt}
            isAuthenticated={!!userProfile}
            userName={userProfile?.name}
            studentEmail={userProfile?.email}
            studentId={userProfile?.id}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {currentTab === 'my-certificates' && (
          <CertificateViewer
            certificates={userCertificates}
            onVerifyHash={handleVerifyHash}
            onAddDelivery={() => {}}
          />
        )}

        {currentTab === 'verify' && (
          <PublicVerification 
            certificates={certificates}
            initialHash={selectedHashForVerification || undefined} 
          />
        )}

        {currentTab === 'admin' && userRole === 'admin' && (
          <AdminDashboard
            courses={courses}
            receipts={receipts}
            certificates={certificates}
            deliveries={[]}
            systemSettings={systemSettings}
            onUpdateCourses={handleUpdateCourses}
            onDeleteCourse={handleDeleteCourse}
            onApproveReceipt={handleApproveReceipt}
            onRejectReceipt={handleRejectReceipt}
            onUpdateCertificate={handleUpdateCertificate}
            onDeleteCertificate={handleDeleteCertificate}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(profile) => {
            setUserProfile(profile);
            setUserRole(profile.role);
            if (profile.role === 'admin') {
              setCurrentTab('admin');
            }
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
