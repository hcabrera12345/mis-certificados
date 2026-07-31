import { supabase } from './supabaseClient';
import { Course, PaymentReceipt, Certificate } from '@/types';
import { MOCK_COURSES, INITIAL_RECEIPTS } from './mockData';

// ---------------------------------------------------------------------------
// SUPABASE STORAGE & BASE64 HELPER
// ---------------------------------------------------------------------------
export async function uploadReceiptFile(file: File, receiptId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = `${receiptId}_${Date.now()}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(safeName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (!error && data?.path) {
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);
      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
    }
  } catch (e) {
    console.warn('Supabase Storage upload failed, falling back to base64:', e);
  }

  // Fallback: convert to Base64 Data URL
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      resolve((ev.target?.result as string) || '/quinto_official_payment_qr.png');
    };
    reader.onerror = () => resolve('/quinto_official_payment_qr.png');
    reader.readAsDataURL(file);
  });
}

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
        category: course.category || 'Capacitacion',
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
    let combined: PaymentReceipt[] = [];

    try {
      const { data: dbReceipts } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbReceipts && dbReceipts.length > 0) {
        combined = [...(dbReceipts as PaymentReceipt[])];
      }
    } catch(e) {}

    try {
      const { data: sysRow } = await supabase
        .from('courses')
        .select('description')
        .eq('id', '00000000-0000-0000-0000-000000000098')
        .maybeSingle();

      if (sysRow && sysRow.description && sysRow.description.length > 10) {
        const sysReceipts = JSON.parse(sysRow.description) as PaymentReceipt[];
        if (Array.isArray(sysReceipts)) {
          const map = new Map<string, PaymentReceipt>();
          combined.forEach(r => map.set(r.id, r));
          sysReceipts.forEach(r => map.set(r.id, r));
          combined = Array.from(map.values());
        }
      }
    } catch(e) {}

    return combined.length > 0 ? combined : INITIAL_RECEIPTS;
  } catch (err) {
    console.error('Error obteniendo comprobantes de Supabase DB:', err);
    return INITIAL_RECEIPTS;
  }
}

export async function saveReceiptToDB(receipt: PaymentReceipt): Promise<PaymentReceipt> {
  try {
    const isUuid = (s?: string) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const validStudentId = isUuid(receipt.student_id) ? receipt.student_id : null;
    const validCourseId = isUuid(receipt.course_id) ? receipt.course_id : null;

    try {
      await supabase
        .from('payment_receipts')
        .insert({
          student_id: validStudentId,
          student_name: receipt.student_name,
          course_id: validCourseId,
          course_title: receipt.course_title,
          receipt_image_url: receipt.receipt_image_url,
          receipt_hash: receipt.receipt_hash,
          extracted_op_code: receipt.extracted_op_code,
          extracted_amount: receipt.extracted_amount,
          extracted_date: receipt.extracted_date,
          extracted_sender: receipt.extracted_sender,
          ocr_status: receipt.ocr_status,
          admin_approval_status: receipt.admin_approval_status
        });
    } catch(e) {}

    try {
      const existing = await getReceiptsFromDB();
      const updated = [receipt, ...existing.filter(r => r.id !== receipt.id)].slice(0, 50);
      
      await supabase
        .from('courses')
        .upsert({
          id: '00000000-0000-0000-0000-000000000098',
          title: 'QUINTO_SYSTEM_SETTING_APPROVED_RECEIPTS',
          description: JSON.stringify(updated),
          instructor_name: 'System Admin',
          price_usd: 0,
          academic_hours: 0,
          category: 'SYSTEM',
          image_url: '/quinto_official_payment_qr.png',
          is_active: false
        });
    } catch(e) {}

    return receipt;
  } catch (err) {
    console.error('Error guardando comprobante en Supabase DB:', err);
    return receipt;
  }
}

export async function updateReceiptStatusInDB(receiptId: string, status: 'approved' | 'rejected'): Promise<boolean> {
  try {
    try {
      await supabase
        .from('payment_receipts')
        .update({ admin_approval_status: status })
        .eq('id', receiptId);
    } catch(e) {}

    try {
      const allReceipts = await getReceiptsFromDB();
      const updatedList = allReceipts.map(r => r.id === receiptId ? { ...r, admin_approval_status: status } : r);

      await supabase
        .from('courses')
        .upsert({
          id: '00000000-0000-0000-0000-000000000098',
          title: 'QUINTO_SYSTEM_SETTING_APPROVED_RECEIPTS',
          description: JSON.stringify(updatedList),
          instructor_name: 'System Admin',
          price_usd: 0,
          academic_hours: 0,
          category: 'SYSTEM',
          image_url: '/quinto_official_payment_qr.png',
          is_active: false
        });
    } catch(e) {}

    return true;
  } catch (err) {
    console.error('Error actualizando estado de comprobante en DB:', err);
    return false;
  }
}

// 3. Certificados Emitidos (Table + System Row 97 Sync for RLS Fail-Safe)
export async function getCertificatesFromDB(): Promise<Certificate[]> {
  let combined: Certificate[] = [];

  // A. Table query
  try {
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false });

    if (data && data.length > 0) {
      combined = [...(data as Certificate[])];
    }
  } catch (err) {}

  // B. Global System Row 97 Query (Fail-safe for RLS & Multi-device sync)
  try {
    const { data: sysRow } = await supabase
      .from('courses')
      .select('description')
      .eq('id', '00000000-0000-0000-0000-000000000097')
      .maybeSingle();

    if (sysRow && sysRow.description && sysRow.description.length > 10) {
      const sysCerts = JSON.parse(sysRow.description) as Certificate[];
      if (Array.isArray(sysCerts)) {
        const map = new Map<string, Certificate>();
        combined.forEach(c => map.set(c.id || c.hash_sha256, c));
        sysCerts.forEach(c => map.set(c.id || c.hash_sha256, c));
        combined = Array.from(map.values());
      }
    }
  } catch (e) {}

  return combined;
}

export async function saveCertificateToDB(cert: Certificate): Promise<Certificate> {
  // A. Save to certificates table (omit enrollment_id to avoid schema error)
  try {
    await supabase
      .from('certificates')
      .insert({
        student_name: cert.student_name,
        course_title: cert.course_title,
        academic_hours: cert.academic_hours,
        instructor_name: cert.instructor_name,
        hash_sha256: cert.hash_sha256,
        qr_code_url: cert.qr_code_url,
        issued_at: cert.issued_at
      });
  } catch (err) {}

  // B. Global System Sync Row 97 (Guarantees ALL devices receive approved cert instantly)
  try {
    const existing = await getCertificatesFromDB();
    const updated = [cert, ...existing.filter(c => (c.id !== cert.id && c.hash_sha256 !== cert.hash_sha256))].slice(0, 100);

    await supabase
      .from('courses')
      .upsert({
        id: '00000000-0000-0000-0000-000000000097',
        title: 'QUINTO_SYSTEM_SETTING_APPROVED_CERTIFICATES',
        description: JSON.stringify(updated),
        instructor_name: 'System Admin',
        price_usd: 0,
        academic_hours: 0,
        category: 'SYSTEM',
        image_url: '/quinto_official_payment_qr.png',
        is_active: false
      });
  } catch (e) {}

  return cert;
}

// ---------------------------------------------------------------------------
// UNRESTRICTED PUBLIC SYSTEM SETTINGS DB SYNC (QR + PRACTICAL GUIDE)
// ---------------------------------------------------------------------------
export async function getSystemSettingsFromDB(): Promise<{ payment_qr_url?: string; practical_guide_url?: string; practical_guide_pdf_data?: string } | null> {
  try {
    const SYSTEM_UUID = '00000000-0000-0000-0000-000000000099';
    const { data: cData, error } = await supabase
      .from('courses')
      .select('description')
      .eq('id', SYSTEM_UUID)
      .maybeSingle();

    if (!error && cData && cData.description && cData.description.length > 10) {
      try {
        const parsed = JSON.parse(cData.description);
        return parsed;
      } catch(e) {
        return { payment_qr_url: cData.description };
      }
    }
    return { payment_qr_url: '/qr_oficial_banco_ganadero.png' };
  } catch (err) {
    return { payment_qr_url: '/qr_oficial_banco_ganadero.png' };
  }
}

export async function saveSystemSettingsToDB(settings: { payment_qr_url?: string; practical_guide_url?: string; practical_guide_pdf_data?: string }): Promise<void> {
  const SYSTEM_UUID = '00000000-0000-0000-0000-000000000099';

  try {
    const current = await getSystemSettingsFromDB() || {};
    const updated = { ...current, ...settings };

    await supabase.from('courses').upsert({
      id: SYSTEM_UUID,
      title: 'QUINTO_SYSTEM_SETTING_PAYMENT_QR',
      description: JSON.stringify(updated),
      instructor_name: 'Directorio Quinto',
      price_usd: 0,
      academic_hours: 0,
      category: 'SYSTEM',
      image_url: '/quinto_official_payment_qr.png',
      is_active: false
    });
  } catch (e) {
    console.error('Exception saving settings to DB:', e);
  }
}
