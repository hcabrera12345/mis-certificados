import { Course } from '@/types';

export async function fetchVigentesCoursesFromQuinto(): Promise<Course[]> {
  return [
    {
      id: 'a1b2c3d4-0001-0000-0000-000000000001',
      title: 'Curso 1: IA Aplicada para el Adulto Mayor',
      description: 'Programa oficial de formación en IA y acompañamiento integral del Adulto Mayor (Edición Concluida con 24 Graduados).',
      academic_hours: 60,
      instructor_name: 'Equipo Especializado Quinto Eje',
      price_usd: 45.00,
      image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600',
      category: 'Salud & Tecnología',
      total_students: 24,
      is_active: true
    },
    {
      id: 'a1b2c3d4-0002-0000-0000-000000000002',
      title: 'Curso 2: Inteligencia Artificial Aplicada & Herramientas Avanzadas',
      description: 'Capacitación profesional en automatización con IA, agentes inteligentes y modelos generativos.',
      academic_hours: 50,
      instructor_name: 'Directorio Técnico Quinto Eje',
      price_usd: 50.00,
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      category: 'Inteligencia Artificial',
      total_students: 45,
      is_active: true
    },
    {
      id: 'a1b2c3d4-0003-0000-0000-000000000003',
      title: 'Curso 3: Formación Profesional & Servicios de Quinto Eje',
      description: 'Gestión estratégica de proyectos corporativos, ingeniería de IA y consultoría especializada de Quinto Eje (Brochure Oficial /curso_3_brochure.pdf).',
      academic_hours: 40,
      instructor_name: 'Directorio Ejecutivo Quinto',
      price_usd: 50.00,
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
      category: 'Ingeniería & Estrategia',
      total_students: 30,
      is_active: true
    }
  ];
}
