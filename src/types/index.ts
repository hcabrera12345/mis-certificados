export type UserRole = 'student' | 'admin' | 'public';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
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
  total_students: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  progress_percentage: number;
  completed_at?: string;
  status: 'enrolled' | 'completed';
}

export interface PaymentReceipt {
  id: string;
  student_id: string;
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
  course_title: string;
  academic_hours: number;
  instructor_name: string;
  hash_sha256: string;
  qr_code_url: string;
  issued_at: string;
  pdf_url?: string;
}

export interface CertificateTemplate {
  id: string;
  title: string;
  background_url: string;
  fields_config: {
    student_name: { x: number; y: number; fontSize: number; fontColor: string };
    course_title: { x: number; y: number; fontSize: number; fontColor: string };
    issue_date: { x: number; y: number; fontSize: number; fontColor: string };
    qr_code: { x: number; y: number; size: number };
  };
  is_active: boolean;
}
