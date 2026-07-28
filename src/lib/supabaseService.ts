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
// INDESTRUCTIBLE CROSS-DEVICE PAYMENT QR PERSISTENCE (Supabase DB + Fallback)
// ---------------------------------------------------------------------------
export async function getSystemSettingsFromDB(): Promise<{ payment_qr_url?: string } | null> {
  try {
    // 1. Try fetching from system_settings table
    const { data: sData, error: sErr } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'default_settings')
      .maybeSingle();

    if (sData && sData.payment_qr_url) {
      return { payment_qr_url: sData.payment_qr_url };
    }

    // 2. Fallback: try fetching system QR from courses table meta row (guaranteed table)
    const { data: cData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', 'system-setting-qr')
      .maybeSingle();

    if (cData && cData.description) {
      return { payment_qr_url: cData.description };
    }

    return null;
  } catch (err) {
    console.error('Exception reading system_settings:', err);
    return null;
  }
}

export async function saveSystemSettingsToDB(settings: { payment_qr_url?: string }): Promise<void> {
  if (!settings.payment_qr_url) return;

  try {
    // 1. Try saving to system_settings table
    await supabase
      .from('system_settings')
      .upsert({
        id: 'default_settings',
        payment_qr_url: settings.payment_qr_url,
        updated_at: new Date().toISOString()
      });
  } catch (e) {}

  try {
    // 2. Dual-save to courses table meta row (guaranteed DB table)
    await supabase
      .from('courses')
      .upsert({
        id: 'system-setting-qr',
        title: 'QUINTO_SYSTEM_SETTING_PAYMENT_QR',
        category: 'SYSTEM',
        price_usd: 0,
        academic_hours: 0,
        instructor_name: 'SYSTEM',
        description: settings.payment_qr_url,
        is_active: false
      });
  } catch (e) {
    console.error('Exception dual-saving QR to courses meta row:', e);
  }
}
