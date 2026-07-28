import { Course, PaymentReceipt, Certificate, SystemSettings } from '@/types';

export const OFFICIAL_QUINTO_PAYMENT_QR_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQMAAAC6caSPAAAABlBMVEX///8JDRYbaSPtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACJ0lEQVR4nO3cS47CMAwGYCMWLDkCR+Fo7dF6lB6BJQuEZxw/4jAjENIAHun3KqT5WJnIcVuIno+Je8wycbzSLsY2v02LriAgrycXT9CDXDoJiXRdiM/yQeY9jUFAqpK9XD0Lsekdrzq/kP4Q2lfJqhUE5D+Qtl3rNs7yozhy4wQC8kFCmr3Ux3LpQfKDgBQhFpb8y4Yjlpi/U5CAgJQgfUHUyam6SNu7BQhISXITtqVT1MmU6uffAwTkz4lnsmRsi+892cZSUeianNUgIFVJVA6U9mSioREhofwKAlKRaERtbM3hg38eWm1DgIC8kLSj2YbzvYloo5E2Injck0FACpKpzWnCz61OtuZwqi4smHWvBgEpS/SUR7fN4THagtRSAwGpRU7pGZ6TFidrbOO2vVusTYGAvJq0ykGXTTK7aKUxsVca/lWR4SAgNQkNJz6KlpqENyUkUvKDgJQjflGS3+4pp5Yap2jzw31kEJA65KKnvLZFW3PYxpz6FXvuPwQQkLcQrygu3ohY031k0qxux7ehIAEBqUa8jTaO442hviezvTEEAlKNDKFbtyd5I+c0ZhCQ95AppeqcW2fbnr1addg8gYCUJPnp9Eh4+yp/z0LnfQ0ISE3S3xiKJOd4902WWdDQiAABqUxYH5hcJd2tpZbH3EtrEJAPkFRpTNzj554MAlKEWBixU2BvqR1iuT88CQJSkHCPOZ7t4eEPHya+d0gEAalAno8vfznx2VkANyAAAAAASUVORK5CYII=';

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
