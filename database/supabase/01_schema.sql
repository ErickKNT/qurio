-- ==============================================================================
-- Qurio: Esquema DDL para la Base de Datos de Aplicación (Supabase)
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Perfiles de usuario vinculados a auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    level INT NOT NULL DEFAULT 1,
    xp INT NOT NULL DEFAULT 0,
    current_streak_days INT NOT NULL DEFAULT 0,
    max_streak_days INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Rutas de Aprendizaje
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Principiante', 'Intermedio', 'Avanzado')),
    estimated_hours INT NOT NULL DEFAULT 6,
    badge_reward VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Módulos de cada ruta
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id VARCHAR(50) NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    module_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(path_id, module_number)
);

-- 5. Lecciones teóricas/explicativas
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    lesson_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content_markdown TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(module_id, lesson_number)
);

-- 6. Ejercicios Prácticos
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    prompt TEXT NOT NULL,
    initial_code TEXT NOT NULL DEFAULT '-- Escribe tu consulta SQL aquí\n',
    solution_query TEXT NOT NULL,
    target_database VARCHAR(50) NOT NULL DEFAULT 'ecommerce_sandbox',
    xp_reward INT NOT NULL DEFAULT 45,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Principiante',
    check_order BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Pistas progresivas por ejercicio
CREATE TABLE IF NOT EXISTS public.exercise_hints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    hint_order INT NOT NULL CHECK (hint_order IN (1, 2, 3)),
    content TEXT NOT NULL,
    xp_penalty_percent INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(exercise_id, hint_order)
);

-- 8. Registro de Intentos y Ejecuciones de los Estudiantes
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    submitted_sql TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PASSED', 'FAILED', 'ERROR')),
    execution_time_ms INT NOT NULL DEFAULT 0,
    error_message TEXT,
    hints_used INT NOT NULL DEFAULT 0,
    xp_awarded INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Progreso agregado por usuario y módulo
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    exercises_completed_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, module_id)
);

-- 10. Catálogo de Logros e Insignias
CREATE TABLE IF NOT EXISTS public.achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    xp_reward INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, achievement_id)
);

-- 11. Actividad diaria y cálculo de rachas
CREATE TABLE IF NOT EXISTS public.user_daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercises_solved INT NOT NULL DEFAULT 0,
    xp_earned INT NOT NULL DEFAULT 0,
    UNIQUE(user_id, activity_date)
);

-- ==============================================================================
-- Seguridad y Políticas de Acceso (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_activity ENABLE ROW LEVEL SECURITY;

-- Catálogo de estudio accesible públicamente en lectura
CREATE POLICY "Public Read Learning Paths" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Public Read Modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Public Read Lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Public Read Exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Public Read Hints" ON public.exercise_hints FOR SELECT USING (true);
CREATE POLICY "Public Read Achievements" ON public.achievements FOR SELECT USING (true);

-- Perfiles de usuario: lectura pública, modificación solo por el propietario
CREATE POLICY "Public Read Profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "User Update Own Profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Intentos y actividad: usuario solo accede a sus propios registros
CREATE POLICY "User Read Own Attempts" ON public.exercise_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Insert Own Attempts" ON public.exercise_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User Read Own Progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Read Own Achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Read Own Daily Activity" ON public.user_daily_activity FOR SELECT USING (auth.uid() = user_id);
