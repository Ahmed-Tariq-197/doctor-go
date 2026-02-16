
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'secretary', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clinics table
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view clinics" ON public.clinics FOR SELECT USING (true);

-- Doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  specialty TEXT NOT NULL DEFAULT 'General Practice',
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  clinic_id UUID REFERENCES public.clinics(id),
  clinic_name TEXT,
  clinic_address TEXT,
  lat DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng DOUBLE PRECISION NOT NULL DEFAULT 0,
  queue_length INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update own record" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL DEFAULT '',
  appointment_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id);
-- Doctors can also view appointments assigned to them
CREATE POLICY "Doctors can view their appointments" ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
);
CREATE POLICY "Doctors can update their appointments" ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
);

-- Queue entries table
CREATE TABLE public.queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL DEFAULT '',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'completed', 'cancelled')),
  position INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view queue" ON public.queue_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join queue" ON public.queue_entries FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own queue entry" ON public.queue_entries FOR UPDATE USING (auth.uid() = patient_id);
-- Doctors can manage their queue
CREATE POLICY "Doctors can update their queue" ON public.queue_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
