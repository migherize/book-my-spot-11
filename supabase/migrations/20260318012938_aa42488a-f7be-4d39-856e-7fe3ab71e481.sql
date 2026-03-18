
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('client', 'professional', 'admin');

-- Enum for category types
CREATE TYPE public.category_type AS ENUM ('health', 'beauty', 'wellness');

-- Enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Enum for modality
CREATE TYPE public.modality_type AS ENUM ('presencial', 'online');

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ===== CATEGORIES =====
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type category_type NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);

-- ===== SUBCATEGORIES =====
CREATE TABLE public.subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  category_type category_type NOT NULL,
  professional_count INT NOT NULL DEFAULT 0
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subcategories are public" ON public.subcategories FOR SELECT USING (true);

-- ===== PROFESSIONALS =====
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo TEXT,
  specialty TEXT NOT NULL,
  subcategory_id TEXT NOT NULL REFERENCES public.subcategories(id),
  category_type category_type NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  location TEXT,
  languages TEXT[] DEFAULT '{}',
  modality modality_type[] DEFAULT '{presencial}',
  duration INT NOT NULL DEFAULT 30,
  next_available TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals are public" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Professionals can update own profile" ON public.professionals FOR UPDATE USING (auth.uid() = user_id);

-- ===== BOOKINGS =====
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, booking_date, booking_time)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT 
  USING (auth.uid() = client_user_id OR EXISTS (
    SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid()
  ));
CREATE POLICY "Authenticated users can create bookings" ON public.bookings FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = client_user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE 
  USING (auth.uid() = client_user_id);

-- ===== TIMESTAMP TRIGGER =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== AUTO-CREATE PROFILE ON SIGNUP =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== SEED DATA: CATEGORIES =====
INSERT INTO public.categories (id, name, type, icon, description) VALUES
  ('health', 'Salud', 'health', 'Heart', 'Encuentra profesionales de salud certificados'),
  ('beauty', 'Belleza', 'beauty', 'Sparkles', 'Servicios de belleza y cuidado personal'),
  ('wellness', 'Bienestar', 'wellness', 'Leaf', 'Cuida tu mente y cuerpo');

-- ===== SEED DATA: SUBCATEGORIES =====
INSERT INTO public.subcategories (id, name, category_id, category_type, professional_count) VALUES
  ('dentistry', 'Odontología', 'health', 'health', 24),
  ('general', 'Medicina General', 'health', 'health', 38),
  ('pediatrics', 'Pediatría', 'health', 'health', 15),
  ('dermatology', 'Dermatología', 'health', 'health', 19),
  ('barbershop', 'Barbería', 'beauty', 'beauty', 31),
  ('hairdressing', 'Peluquería', 'beauty', 'beauty', 27),
  ('manicure', 'Manicure', 'beauty', 'beauty', 20),
  ('facial', 'Estética Facial', 'beauty', 'beauty', 14),
  ('massage', 'Masajes', 'wellness', 'wellness', 22),
  ('psychology', 'Psicología', 'wellness', 'wellness', 29),
  ('nutrition', 'Nutrición', 'wellness', 'wellness', 16);

-- ===== SEED DATA: PROFESSIONALS =====
INSERT INTO public.professionals (id, name, photo, specialty, subcategory_id, category_type, description, price, currency, rating, review_count, location, languages, modality, duration, next_available) VALUES
  (gen_random_uuid(), 'Dra. María González', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face', 'Odontología', 'dentistry', 'health', 'Especialista en odontología estética y restauradora con más de 12 años de experiencia.', 45, 'USD', 4.9, 127, 'Madrid, España', '{Español,Inglés}', '{presencial}', 45, 'Hoy'),
  (gen_random_uuid(), 'Dr. Carlos Ruiz', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face', 'Medicina General', 'general', 'health', 'Médico general con enfoque integral en salud preventiva.', 35, 'USD', 4.7, 89, 'Barcelona, España', '{Español,Catalán}', '{presencial,online}', 30, 'Mañana'),
  (gen_random_uuid(), 'Ana Martínez', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face', 'Peluquería', 'hairdressing', 'beauty', 'Estilista creativa especializada en colorimetría y cortes de tendencia.', 30, 'USD', 4.8, 203, 'Valencia, España', '{Español}', '{presencial}', 60, 'Hoy'),
  (gen_random_uuid(), 'Luis Fernández', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', 'Barbería', 'barbershop', 'beauty', 'Barbero profesional con estilo clásico y moderno.', 20, 'USD', 4.9, 312, 'Sevilla, España', '{Español,Inglés}', '{presencial}', 30, 'Hoy'),
  (gen_random_uuid(), 'Dra. Sofía López', 'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=300&h=300&fit=crop&crop=face', 'Psicología', 'psychology', 'wellness', 'Psicóloga clínica especializada en terapia cognitivo-conductual.', 55, 'USD', 4.9, 156, 'Madrid, España', '{Español,Inglés,Francés}', '{presencial,online}', 50, 'Hoy'),
  (gen_random_uuid(), 'Miguel Torres', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', 'Masajes', 'massage', 'wellness', 'Terapeuta corporal certificado en masaje deportivo.', 40, 'USD', 4.8, 178, 'Málaga, España', '{Español}', '{presencial}', 60, 'Mañana'),
  (gen_random_uuid(), 'Dra. Laura Sánchez', 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=300&h=300&fit=crop&crop=face', 'Dermatología', 'dermatology', 'health', 'Dermatóloga con especialización en dermatología clínica y estética.', 60, 'USD', 4.8, 94, 'Madrid, España', '{Español,Inglés}', '{presencial,online}', 30, 'Hoy'),
  (gen_random_uuid(), 'Carmen Díaz', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face', 'Nutrición', 'nutrition', 'wellness', 'Nutricionista clínica y deportiva.', 40, 'USD', 4.7, 112, 'Barcelona, España', '{Español,Inglés}', '{presencial,online}', 45, 'Mañana'),
  (gen_random_uuid(), 'Isabella Moreno', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face', 'Estética Facial', 'facial', 'beauty', 'Esteticista certificada en tratamientos faciales avanzados.', 50, 'USD', 4.9, 87, 'Madrid, España', '{Español}', '{presencial}', 60, 'Hoy'),
  (gen_random_uuid(), 'Lucía Romero', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face', 'Manicure', 'manicure', 'beauty', 'Experta en nail art, manicure y pedicure.', 25, 'USD', 4.8, 145, 'Valencia, España', '{Español}', '{presencial}', 45, 'Hoy'),
  (gen_random_uuid(), 'Dr. Andrés Vega', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face', 'Pediatría', 'pediatrics', 'health', 'Pediatra con amplia experiencia en cuidado infantil preventivo.', 40, 'USD', 4.9, 201, 'Madrid, España', '{Español,Inglés}', '{presencial,online}', 30, 'Hoy');
