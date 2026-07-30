export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  academic_hours: number;
  instructor_name: string;
  price_usd: number;
  image_url: string;
  category: string;
  total_students?: number;
  is_active?: boolean;
}

export interface PaymentReceipt {
  id: string;
  student_id: string;
  student_email?: string;
  student_name: string;
  course_id: string;
  course_title: string;
  receipt_image_url: string;
  receipt_hash: string;
  extracted_op_code: string;
  extracted_amount: number;
  extracted_date: string;
  extracted_sender: string;
  ocr_status: 'pending' | 'parsed' | 'failed';
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Certificate {
  id: string;
  enrollment_id: string;
  student_name: string;
  student_email?: string;
  course_title: string;
  academic_hours: number;
  instructor_name: string;
  hash_sha256: string;
  qr_code_url: string;
  issued_at: string;
  background_template_url?: string;
  practical_guide_url?: string;
}

export interface CertificateTemplate {
  id: string;
  course_id: string;
  background_url: string;
  fields_config: {
    student_name: { x: number; y: number; fontSize: number };
    course_title: { x: number; y: number; fontSize: number };
    issued_at: { x: number; y: number; fontSize: number };
    qr_code: { x: number; y: number; size: number };
  };
  is_active: boolean;
}

export interface SystemSettings {
  payment_qr_url: string;
  payment_instructions: string;
  practical_guide_url?: string;
}
