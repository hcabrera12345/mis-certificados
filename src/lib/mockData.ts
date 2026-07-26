import { Profile, Course, PaymentReceipt, Certificate } from '@/types';
import { QUINTO_ACTIVE_COURSES } from './quintoClient';

export const MOCK_PROFILE: Profile = {
  id: 'usr-101',
  full_name: 'María Elena Rodríguez',
  email: 'maria.rodriguez@quinto.app',
  role: 'student',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  created_at: '2026-01-15T10:00:00Z'
};

export const MOCK_COURSES: Course[] = QUINTO_ACTIVE_COURSES;

export const INITIAL_RECEIPTS: PaymentReceipt[] = [
  {
    id: 'rec-8801',
    student_id: 'usr-101',
    student_name: 'María Elena Rodríguez',
    course_id: 'quinto-course-1',
    course_title: 'Curso Adulto Mayor',
    receipt_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    receipt_hash: 'a8f9c2d1e4b5c6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    extracted_op_code: 'OP-98421056',
    extracted_amount: 45.00,
    extracted_date: '25/07/2026',
    extracted_sender: 'María E. Rodríguez',
    ocr_status: 'parsed',
    admin_approval_status: 'approved',
    created_at: '2026-07-25T18:30:00Z'
  },
  {
    id: 'rec-8802',
    student_id: 'usr-102',
    student_name: 'Gabriel Morales',
    course_id: 'quinto-course-2',
    course_title: 'Servicios de Quinto Eje',
    receipt_image_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400',
    receipt_hash: 'b9e0d3f2a1c4b5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    extracted_op_code: 'OP-77341902',
    extracted_amount: 50.00,
    extracted_date: '25/07/2026',
    extracted_sender: 'Gabriel Morales S.',
    ocr_status: 'parsed',
    admin_approval_status: 'pending',
    created_at: '2026-07-25T19:45:00Z'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-2026-9842',
    enrollment_id: 'enr-1',
    student_name: 'María Elena Rodríguez',
    course_title: 'Curso Adulto Mayor',
    academic_hours: 60,
    instructor_name: 'Equipo Especializado Quinto Eje',
    hash_sha256: 'a8f9c2d1e4b5c6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://miscertificados.quinto.app/validar/a8f9c2d1e4b5c6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    issued_at: '25 de Julio, 2026'
  }
];
