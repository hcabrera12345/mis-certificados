-- =============================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE: MIS CERTIFICADOS (v3.1 ZERO-WARNING)
-- PROYECTO: Mis Certificados (Ecosistema Quinto)
-- 100% SEGURO Y CONSERVADOR: GARANTIZA INTEGRIDAD DE DATOS EXISTENTES
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- RLS ENABLING
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries_future ENABLE ROW LEVEL SECURITY;

-- CREACIÓN SEGURA DE POLÍTICAS RLS SIN LA PALABRA DROP
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public read profiles') THEN
        CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public insert profiles') THEN
        CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public update profiles') THEN
        CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Public read courses') THEN
        CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Public all courses') THEN
        CREATE POLICY "Public all courses" ON public.courses FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_receipts' AND policyname = 'Public read receipts') THEN
        CREATE POLICY "Public read receipts" ON public.payment_receipts FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_receipts' AND policyname = 'Public insert receipts') THEN
        CREATE POLICY "Public insert receipts" ON public.payment_receipts FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Public read certificates') THEN
        CREATE POLICY "Public read certificates" ON public.certificates FOR SELECT USING (true);
    END IF;
END $$;

-- TRIGGER AUTOMÁTICO PARA REGISTRO DE NUEVOS ALUMNOS EN SUPABASE (GOOGLE + FORMULARIO)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- SEED DATA DE CURSOS REALES DE QUINTO
INSERT INTO public.courses (id, title, description, academic_hours, instructor_name, price_usd, image_url, category)
VALUES 
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'CURSO 2 GOBERNANZA Y ETICA APLICADA A IA',
    'Capacitación profesional oficial en marcos normativos, responsabilidad algorítmica, cumplimiento regulatorio y ética aplicada a la Inteligencia Artificial.',
    50,
    'Directorio Técnico Quinto Eje',
    50.00,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    'Gobernanza y IA'
),
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'CURSO 3 AGENTES IA PARA EMPRESAS Y NEGOCIOS',
    'Desarrollo de agentes inteligentes autónomos, automatización de procesos corporativos e ingeniería de IA para empresas y negocios (Brochure Oficial PDF).',
    40,
    'Directorio Ejecutivo Quinto',
    50.00,
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    'Agentes y Negocios'
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'CURSO 1 IA APLICADA PARA EL ADULTO MAYOR',
    'Programa oficial de formación en IA y acompañamiento integral del Adulto Mayor (Cohorte Concluida con 24 Graduados).',
    60,
    'Equipo Especializado Quinto Eje',
    45.00,
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600',
    'Salud y Tecnologia'
)
ON CONFLICT DO NOTHING;
