import { supabase } from './supabaseClient';
import { Course, PaymentReceipt, Certificate } from '@/types';
import { MOCK_COURSES, INITIAL_RECEIPTS, INITIAL_CERTIFICATES } from './mockData';

// Fetch Courses from Supabase DB
export async function getCoursesFromDB(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_COURSES;
    }
    return data as Course[];
  } catch (err) {
    return MOCK_COURSES;
  }
}

// Fetch Receipts from Supabase DB
export async function getReceiptsFromDB(): Promise<PaymentReceipt[]> {
  try {
    const { data, error } = await supabase
      .from('payment_receipts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_RECEIPTS;
    }
    return data as PaymentReceipt[];
  } catch (err) {
    return INITIAL_RECEIPTS;
  }
}

// Save New Payment Receipt to DB
export async function saveReceiptToDB(receipt: PaymentReceipt): Promise<PaymentReceipt> {
  try {
    const { data, error } = await supabase
      .from('payment_receipts')
      .insert([
        {
          student_name: receipt.student_name,
          course_title: receipt.course_title,
          receipt_image_url: receipt.receipt_image_url,
          receipt_hash: receipt.receipt_hash,
          extracted_op_code: receipt.extracted_op_code,
          extracted_amount: receipt.extracted_amount,
          extracted_date: receipt.extracted_date,
          extracted_sender: receipt.extracted_sender,
          admin_approval_status: receipt.admin_approval_status
        }
      ])
      .select()
      .single();

    if (error || !data) {
      return receipt;
    }
    return data as PaymentReceipt;
  } catch (err) {
    return receipt;
  }
}

// Fetch Certificates from Supabase DB
export async function getCertificatesFromDB(): Promise<Certificate[]> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_CERTIFICATES;
    }
    return data as Certificate[];
  } catch (err) {
    return INITIAL_CERTIFICATES;
  }
}

// Save New Certificate to DB
export async function saveCertificateToDB(cert: Certificate): Promise<Certificate> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert([
        {
          student_name: cert.student_name,
          course_title: cert.course_title,
          academic_hours: cert.academic_hours,
          instructor_name: cert.instructor_name,
          hash_sha256: cert.hash_sha256,
          qr_code_url: cert.qr_code_url,
          issued_at: cert.issued_at
        }
      ])
      .select()
      .single();

    if (error || !data) {
      return cert;
    }
    return data as Certificate;
  } catch (err) {
    return cert;
  }
}

// Update Receipt Status in DB
export async function updateReceiptStatusInDB(receiptId: string, status: 'approved' | 'rejected') {
  try {
    await supabase
      .from('payment_receipts')
      .update({ admin_approval_status: status })
      .eq('id', receiptId);
  } catch (err) {
    console.error('Error updating receipt in DB:', err);
  }
}

export async function deleteCourseFromDB(courseId: string) {
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
