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
  const [userProfile, setUserProfile] = useState<{ email: string; name: string; role: UserRole } | null>(null);
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
    // A. Parse Direct Hash Token from Google OAuth redirect (#access_token=...)
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
              setUserProfile({
                email: u.email || 'usuario@quinto.app',
                name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Usuario Quinto',
                role: u.email === 'admin@quinto.app' ? 'admin' : 'student'
              });
              setUserRole(u.email === 'admin@quinto.app' ? 'admin' : 'student');
              // Clear URL hash cleanly
              window.history.replaceState(null, '', window.location.pathname);
            }
          } catch (e) {
            console.error('Error setting OAuth session:', e);
          }
        }
      }
    };

    checkDirectHashToken();

    // B. Supabase Session Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        setUserProfile({
          email: u.email || 'usuario@quinto.app',
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Usuario Quinto',
          role: u.email === 'admin@quinto.app' ? 'admin' : 'student'
        });
        setUserRole(u.email === 'admin@quinto.app' ? 'admin' : 'student');
      } else {
        // Keep profile if manually logged in via master admin key
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
      // A. Load Courses from LocalStorage first
      const savedCourses = localStorage.getItem('quinto_courses_list');
      if (savedCourses) {
        try {
          const parsed = JSON.parse(savedCourses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(parsed);
          }
        } catch (e) {
          console.error('Error loading saved courses:', e);
        }
      }

      // B. Load Payment QR Code (LocalStorage + Supabase DB Global Sync)
      const savedQr = localStorage.getItem('quinto_payment_qr_url');
      // If savedQr contains old certificate template base64 (iVBORw0KGgoAAAANSUhEUgAAAdk), purge it
      if (savedQr && (savedQr.includes('AdkAAA') || savedQr.includes('AdkA') || savedQr.length > 50000)) {
        localStorage.removeItem('quinto_payment_qr_url');
      }
      const activeQr = localStorage.getItem('quinto_payment_qr_url') || 'https://i.imgur.com/NMnkr4t.png';
      setSystemSettings((prev) => ({ ...prev, payment_qr_url: activeQr }));

      try {
        const dbSettings = await getSystemSettingsFromDB();
        if (dbSettings?.payment_qr_url) {
          setSystemSettings((prev) => ({ ...prev, payment_qr_url: dbSettings.payment_qr_url! }));
          localStorage.setItem('quinto_payment_qr_url', dbSettings.payment_qr_url);
        }
      } catch (e) {}

      // C. Sync DB Data
      try {
        const dbCourses = await getCoursesFromDB();
        if (dbCourses && dbCourses.length > 0 && !savedCourses) {
          setCourses(dbCourses);
          localStorage.setItem('quinto_courses_list', JSON.stringify(dbCourses));
        }

        // Load Receipts & Certificates from LocalStorage first for instant persistence
        const savedReceipts = localStorage.getItem('quinto_receipts_list');
        if (savedReceipts) {
          try {
            const parsedR = JSON.parse(savedReceipts);
            if (Array.isArray(parsedR)) setReceipts(parsedR);
          } catch(e) {}
        }

        const savedCerts = localStorage.getItem('quinto_certificates_list');
        if (savedCerts) {
          try {
            const parsedC = JSON.parse(savedCerts);
            if (Array.isArray(parsedC)) setCertificates(parsedC);
          } catch(e) {}
        }

        // Fetch DB data
        const dbReceipts = await getReceiptsFromDB();
        if (dbReceipts && dbReceipts.length > 0 && !savedReceipts) setReceipts(dbReceipts);

        const dbCerts = await getCertificatesFromDB();
        if (dbCerts && dbCerts.length > 0 && !savedCerts) setCertificates(dbCerts);
      } catch (err) {
        console.error('Error syncing DB data:', err);
      }
    }

    loadData();
  }, []);

  // ---------------------------------------------------------------------------
  // 3. ADMIN COURSE MUTATION HANDLERS (Real-time Sync to User View)
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
      const updated = [newReceipt, ...prev];
      localStorage.setItem('quinto_receipts_list', JSON.stringify(updated));
      return updated;
    });
    await saveReceiptToDB(newReceipt);
  };

  const handleApproveReceipt = async (receipt: PaymentReceipt) => {
    setReceipts((prev) => {
      const updatedR = prev.map((r) => (r.id === receipt.id ? { ...r, admin_approval_status: 'approved' as const } : r));
      localStorage.setItem('quinto_receipts_list', JSON.stringify(updatedR));
      return updatedR;
    });
    await updateReceiptStatusInDB(receipt.id, 'approved');

    const validHash = receipt.receipt_hash || ('SHA256-' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)).toUpperCase();
    const newCert: Certificate = {
      id: 'cert-' + Date.now(),
      enrollment_id: receipt.id,
      student_name: receipt.student_name,
      course_title: receipt.course_title,
      academic_hours: 40,
      instructor_name: 'Directorio Quinto',
      hash_sha256: validHash,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://mis-certificados.quinto.app/validar/${validHash}`,
      issued_at: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    setCertificates((prev) => {
      const updatedC = [newCert, ...prev];
      localStorage.setItem('quinto_certificates_list', JSON.stringify(updatedC));
      return updatedC;
    });
    await saveCertificateToDB(newCert);
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
      await saveSystemSettingsToDB({ payment_qr_url: newSettings.payment_qr_url });
    }
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
            name: 'Hernán (Director Quinto)',
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
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {currentTab === 'my-certificates' && userProfile && (
          <CertificateViewer
            certificates={certificates}
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
