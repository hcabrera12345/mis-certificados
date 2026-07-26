-- =============================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE: MIS CERTIFICADOS (v2.2 FINAL)
-- PROYECTO: Mis Certificados (Ecosistema Quinto)
-- 100% SEGURO: Sin instrucciones DROP, compatible con base de datos existente.
-- =============================================================

-- 1. Extension Criptografica para Hashes SHA-256
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA DE PERFILES (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE CURSOS (Sincronizada con Quinto CRM)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    academic_hours INT NOT NULL DEFAULT 40,
    instructor_name TEXT NOT NULL,
    price_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'Capacitacion',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE COMPROBANTES DE PAGO (OCR Vision & Deduplicacion)
CREATE TABLE IF NOT EXISTS public.payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_title TEXT NOT NULL,
    receipt_image_url TEXT NOT NULL,
    receipt_hash VARCHAR(64) UNIQUE NOT NULL,
    extracted_op_code VARCHAR(100) UNIQUE,
    extracted_amount NUMERIC(10,2),
    extracted_date TEXT,
    extracted_sender TEXT,
    ocr_status VARCHAR(30) DEFAULT 'parsed' CHECK (ocr_status IN ('pending', 'parsed', 'failed')),
    admin_approval_status VARCHAR(30) DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA DE CERTIFICADOS (Sello SHA-256 Inmutable & QR)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    academic_hours INT NOT NULL,
    instructor_name TEXT NOT NULL,
    hash_sha256 VARCHAR(64) UNIQUE NOT NULL,
    qr_code_url TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA DE LOGISTICA A TU PUERTA (Fisica GPS)
CREATE TABLE IF NOT EXISTS public.deliveries_future (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'en_camino' CHECK (status IN ('pendiente', 'en_camino', 'entregado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA DE PLANTILLAS PERSONALIZADAS
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    background_url TEXT NOT NULL,
    fields_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries_future ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- SEED DATA DE LOS 2 CURSOS VIGENTES DE QUINTO
-- =============================================================

INSERT INTO public.courses (id, title, description, academic_hours, instructor_name, price_usd, image_url, category)
VALUES 
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Curso Adulto Mayor',
    'Programa oficial de capacitacion en Cuidado, Acompanamiento e Intervencion Integral del Adulto Mayor.',
    60,
    'Equipo Especializado Quinto Eje',
    45.00,
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600',
    'Salud y Cuidado'
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Servicios de Quinto Eje',
    'Formacion profesional en Gestion Estrategica, Operaciones de Campo y Desarrollo de Proyectos Quinto Eje.',
    40,
    'Directorio Ejecutivo Quinto',
    50.00,
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    'Estrategia y Operaciones'
)
ON CONFLICT DO NOTHING;
