import { Course, PaymentReceipt, Certificate, SystemSettings } from '@/types';

export const MOCK_COURSES: Course[] = [
  {
    id: 'a1b2c3d4-0002-0000-0000-000000000002',
    title: 'CURSO 2 GOBERNANZA Y ETICA APLICADA A IA',
    description: 'Capacitación profesional oficial en marcos normativos, responsabilidad algorítmica, cumplimiento regulatorio y ética aplicada a la Inteligencia Artificial (Brochure Oficial Quinto CRM).',
    academic_hours: 50,
    instructor_name: 'Directorio Técnico Quinto Eje',
    price_usd: 50.00,
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    category: 'Gobernanza y IA',
    is_active: true
  },
  {
    id: 'a1b2c3d4-0003-0000-0000-000000000003',
    title: 'CURSO 3 AGENTES IA PARA EMPRESAS Y NEGOCIOS',
    description: 'Desarrollo de agentes inteligentes autónomos, automatización de procesos corporativos e ingeniería de IA para empresas y negocios (Brochure Oficial Quinto CRM).',
    academic_hours: 40,
    instructor_name: 'Directorio Ejecutivo Quinto',
    price_usd: 50.00,
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    category: 'Agentes y Negocios',
    is_active: true
  },
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    title: 'CURSO 1 IA APLICADA PARA EL ADULTO MAYOR',
    description: 'Programa oficial de formación en IA y acompañamiento integral del Adulto Mayor (Cohorte Concluida con 24 Graduados).',
    academic_hours: 60,
    instructor_name: 'Equipo Especializado Quinto Eje',
    price_usd: 45.00,
    image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600',
    category: 'Salud y Tecnologia',
    is_active: true
  }
];

export const INITIAL_RECEIPTS: PaymentReceipt[] = [];
export const INITIAL_CERTIFICATES: Certificate[] = [];

export const DEFAULT_SETTINGS: SystemSettings = {
  payment_qr_url: '/quinto_official_payment_qr.png',
  payment_instructions: 'Realiza el pago escaneando el QR oficial y sube la foto o PDF de tu comprobante.'
};
