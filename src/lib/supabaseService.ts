import { supabase } from './supabaseClient';
import { Course, PaymentReceipt, Certificate } from '@/types';
import { MOCK_COURSES } from './mockData';

// 1. Cursos
export async function getCoursesFromDB(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data as Course[];
    return MOCK_COURSES;
  } catch (err) {
    console.error('Error obteniendo cursos de Supabase DB:', err);
    return MOCK_COURSES;
  }
}

export async function saveCourseToDB(course: Course): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('courses')
      .upsert({
        id: course.id,
        title: course.title,
        description: course.description,
        academic_hours: course.academic_hours || 40,
        instructor_name: course.instructor_name || 'Directorio Quinto',
        price_usd: course.price_usd,
        image_url: course.image_url,
        category: course.category || 'Capacitación',
        is_active: course.is_active !== false
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error guardando curso en Supabase DB:', err);
    return false;
  }
}

export async function deleteCourseFromDB(courseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error borrando curso de Supabase DB:', err);
    return false;
  }
}

// 2. Comprobantes de Pago
export async function getReceiptsFromDB(): Promise<PaymentReceipt[]> {
  try {
    const { data, error } = await supabase
      .from('payment_receipts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PaymentReceipt[];
  } catch (err) {
    console.error('Error obteniendo comprobantes de Supabase DB:', err);
    return [];
  }
}

export async function saveReceiptToDB(receipt: PaymentReceipt): Promise<PaymentReceipt> {
  try {
    const { data, error } = await supabase
      .from('payment_receipts')
      .insert({
        student_id: receipt.student_id,
        student_name: receipt.student_name,
        course_id: receipt.course_id,
        course_title: receipt.course_title,
        receipt_image_url: receipt.receipt_image_url,
        receipt_hash: receipt.receipt_hash,
        extracted_op_code: receipt.extracted_op_code,
        extracted_amount: receipt.extracted_amount,
        extracted_date: receipt.extracted_date,
        extracted_sender: receipt.extracted_sender,
        ocr_status: receipt.ocr_status,
        admin_approval_status: receipt.admin_approval_status
      })
      .select()
      .single();

    if (error) throw error;
    return data as PaymentReceipt;
  } catch (err) {
    console.error('Error guardando comprobante en Supabase DB:', err);
    return receipt;
  }
}

export async function updateReceiptStatusInDB(receiptId: string, status: 'approved' | 'rejected') {
  try {
    const { error } = await supabase
      .from('payment_receipts')
      .update({ admin_approval_status: status })
      .eq('id', receiptId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando estado de comprobante:', err);
    return false;
  }
}

// 3. Certificados Emitidos
export async function getCertificatesFromDB(): Promise<Certificate[]> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Certificate[];
  } catch (err) {
    console.error('Error obteniendo certificados de Supabase DB:', err);
    return [];
  }
}

export async function saveCertificateToDB(cert: Certificate): Promise<Certificate> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        enrollment_id: cert.enrollment_id,
        student_name: cert.student_name,
        course_title: cert.course_title,
        academic_hours: cert.academic_hours,
        instructor_name: cert.instructor_name,
        hash_sha256: cert.hash_sha256,
        qr_code_url: cert.qr_code_url,
        issued_at: cert.issued_at
      })
      .select()
      .single();

    if (error) throw error;
    return data as Certificate;
  } catch (err) {
    console.error('Error guardando certificado en Supabase DB:', err);
    return cert;
  }
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// UNRESTRICTED PUBLIC PAYMENT QR DB & STORAGE SYNC
// ---------------------------------------------------------------------------
export async function getSystemSettingsFromDB(): Promise<{ payment_qr_url?: string } | null> {
  try {
    // A. Query system_settings table
    const { data: sData } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'default_settings')
      .maybeSingle();

    if (sData && sData.payment_qr_url && sData.payment_qr_url.length > 20) {
      return { payment_qr_url: sData.payment_qr_url };
    }

    // B. Query courses table system row
    const { data: cData } = await supabase
      .from('courses')
      .select('description')
      .eq('id', 'system-setting-qr')
      .maybeSingle();

    if (cData && cData.description && cData.description.length > 20) {
      return { payment_qr_url: cData.description };
    }

    return null;
  } catch (err) {
    console.error('Exception fetching public QR from DB:', err);
    return null;
  }
}

export async function saveSystemSettingsToDB(settings: { payment_qr_url?: string }): Promise<void> {
  if (!settings.payment_qr_url) return;
  const qrData = settings.payment_qr_url;
  const SYSTEM_UUID = '00000000-0000-0000-0000-000000000099';

  try {
    const { error } = await supabase.from('courses').upsert({
      id: SYSTEM_UUID,
      title: 'QUINTO_SYSTEM_SETTING_PAYMENT_QR',
      description: qrData,
      instructor_name: 'Directorio Quinto',
      price_usd: 0,
      academic_hours: 0,
      category: 'SYSTEM',
      image_url: '/quinto_official_payment_qr.png',
      is_active: false
    });
    if (error) {
      console.error('Error saving QR row in Supabase DB:', error);
    } else {
      console.log('Successfully saved QR to Supabase DB system row!');
    }
  } catch (e) {
    console.error('Exception saving QR to DB:', e);
  }
}
