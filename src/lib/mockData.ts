import { Course, PaymentReceipt, Certificate, SystemSettings } from '@/types';

export const OFFICIAL_QUINTO_PAYMENT_QR_BASE64 =
  'data:image/png;base64,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';

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'AGENTES DE IA PARA EMPRESAS Y NEGOCIOS',
    category: 'Inteligencia Artificial',
    price_usd: 49,
    academic_hours: 40,
    instructor_name: 'Directorio Quinto Eje',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    description: 'Aprende a construir agentes inteligentes autónomos, automatización de workflows empresariales e integración de modelos LLM.',
    is_active: true
  },
  {
    id: 'course-2',
    title: 'INGENIERÍA DE PROMPTS Y AUTOMATIZACIÓN AVANZADA',
    category: 'Ingeniería de Software',
    price_usd: 39,
    academic_hours: 30,
    instructor_name: 'Directorio Quinto Eje',
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    description: 'Domina las técnicas avanzadas de prompt engineering, RAG, bases de datos vectoriales y orquestación con Python.',
    is_active: true
  },
  {
    id: 'course-3',
    title: 'REVOLUCIÓN IA: LA INTELIGENCIA ARTIFICIAL PARA ESTUDIANTES Y DOCENTES',
    category: 'Educación & Tecnología',
    price_usd: 29,
    academic_hours: 20,
    instructor_name: 'Directorio Quinto Eje',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    description: 'Capacitación integral de alto impacto sobre el uso de herramientas IA en la educación superior y docencia moderna.',
    is_active: true
  }
];

export const INITIAL_RECEIPTS: PaymentReceipt[] = [];

export const DEFAULT_SETTINGS: SystemSettings = {
  payment_qr_url: OFFICIAL_QUINTO_PAYMENT_QR_BASE64,
  payment_instructions: 'Realiza el pago escaneando el QR oficial y sube la foto o PDF de tu comprobante.'
};

export const INITIAL_CERTIFICATES: Certificate[] = [];
