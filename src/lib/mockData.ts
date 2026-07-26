import { Profile, Course, PaymentReceipt, Certificate, SystemSettings } from '@/types';

export const MOCK_STUDENT: Profile = {
  id: 'usr-student-001',
  email: 'alumno@quinto.app',
  full_name: 'Hernán Cabrera',
  role: 'student',
  created_at: '2026-07-01'
};

export const MOCK_ADMIN: Profile = {
  id: 'usr-admin-001',
  email: 'admin@quinto.app',
  full_name: 'Hernán (Director Quinto)',
  role: 'admin',
  created_at: '2026-06-01'
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'c-002',
    title: 'Curso 2',
    description: 'Capacitación profesional en Inteligencia Artificial Aplicada, automatización de procesos e ingeniería Quinto Eje.',
    academic_hours: 50,
    instructor_name: 'Directorio Técnico Quinto Eje',
    price_usd: 50.00,
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    category: 'Inteligencia Artificial',
    total_students: 45,
    is_active: true
  },
  {
    id: 'c-003',
    title: 'Curso 3',
    description: 'Formación Profesional & Servicios de Quinto Eje. Ingeniería corporativa, consultoría y desarrollo técnico (Brochure /curso_3_brochure.pdf).',
    academic_hours: 40,
    instructor_name: 'Directorio Ejecutivo Quinto',
    price_usd: 50.00,
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    category: 'Ingeniería & Servicios',
    total_students: 30,
    is_active: true
  },
  {
    id: 'c-001',
    title: 'Curso 1: IA Aplicada para el Adulto Mayor',
    description: 'Programa oficial de capacitación en IA y acompañamiento integral del Adulto Mayor (Cohorte Concluida con 24 Graduados).',
    academic_hours: 60,
    instructor_name: 'Equipo Especializado Quinto Eje',
    price_usd: 45.00,
    image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600',
    category: 'Salud & Tecnología',
    total_students: 24,
    is_active: true
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  payment_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=YAPE_PLIN_QUINTO_OFICIAL_PAYMENT_QR',
  payment_instructions: 'Escanea el código QR oficial de Quinto, realiza el pago y sube la captura de tu comprobante.'
};

export const INITIAL_RECEIPTS: PaymentReceipt[] = [
  {
    id: 'rec-001',
    student_id: 'usr-student-001',
    student_name: 'Hernán Cabrera',
    course_id: 'c-002',
    course_title: 'Curso 2',
    receipt_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    receipt_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    extracted_op_code: 'YAPE-8941205',
    extracted_amount: 50.00,
    extracted_date: '2026-07-20 14:32',
    extracted_sender: 'Hernán Cabrera',
    ocr_status: 'parsed',
    admin_approval_status: 'pending',
    created_at: '2026-07-20'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-001',
    enrollment_id: 'enr-001',
    student_name: 'Hernán Cabrera',
    course_title: 'Curso 2',
    academic_hours: 50,
    instructor_name: 'Directorio Técnico Quinto Eje',
    hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://miscertificados.quinto.app/validar/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    issued_at: '20 de Julio, 2026'
  }
];
