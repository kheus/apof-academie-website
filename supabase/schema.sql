-- APOF Académie — schéma de base de données Supabase
-- À exécuter une seule fois dans Supabase : SQL Editor > New query > coller > Run

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- 2. TABLES
-- ============================================================

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- ex: "CM2", "6ème A"
  level text not null,                   -- Préscolaire / Élémentaire / Moyen
  school_year text not null default '2026-2027',
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null                     -- ex: "Mathématiques", "Arabe"
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('admin','teacher','student')),
  class_id uuid references public.classes(id) on delete set null, -- pour les élèves
  phone text,
  created_at timestamptz not null default now()
);

create table public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unique (teacher_id, class_id, subject_id)
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  term text not null default 'Trimestre 1',
  label text not null,                   -- ex: "Devoir 1", "Composition"
  score numeric not null,
  max_score numeric not null default 20,
  comment text,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  file_url text,
  created_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  audience text not null default 'all' check (audience in ('all','teachers','students','class')),
  class_id uuid references public.classes(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all','teachers','students','class')),
  class_id uuid references public.classes(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 4. HELPER FUNCTIONS (security definer = safe to use inside RLS
--    policies without infinite recursion on `profiles`)
-- ============================================================
create function public.my_role()
returns text
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid(); $$;

create function public.my_class_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select class_id from public.profiles where id = auth.uid(); $$;

create function public.my_taught_class_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$ select distinct class_id from public.teacher_assignments where teacher_id = auth.uid(); $$;

create function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select public.my_role() = 'admin'; $$;

create function public.is_teacher()
returns boolean
language sql stable security definer set search_path = public
as $$ select public.my_role() = 'teacher'; $$;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.profiles enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.grades enable row level security;
alter table public.courses enable row level security;
alter table public.calendar_events enable row level security;
alter table public.announcements enable row level security;

-- classes: public read (the pre-registration form needs the class list
-- before the visitor has an account), writable by admin only
create policy "classes_select_all" on public.classes for select using (true);
create policy "classes_write_admin" on public.classes for all using (public.is_admin()) with check (public.is_admin());

create policy "subjects_select_all" on public.subjects for select using (auth.role() = 'authenticated');
create policy "subjects_write_admin" on public.subjects for all using (public.is_admin()) with check (public.is_admin());

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select using (public.is_admin());
create policy "profiles_select_teacher_view_students" on public.profiles for select
  using (public.is_teacher() and role = 'student' and class_id in (select public.my_taught_class_ids()));
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_write_admin" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- teacher_assignments: admin manages; teachers can read their own assignments
create policy "assignments_select_admin" on public.teacher_assignments for select using (public.is_admin());
create policy "assignments_select_own" on public.teacher_assignments for select using (teacher_id = auth.uid());
create policy "assignments_write_admin" on public.teacher_assignments for all using (public.is_admin()) with check (public.is_admin());

-- grades: admin full access; teacher manages grades for their classes; student reads own
create policy "grades_admin_all" on public.grades for all using (public.is_admin()) with check (public.is_admin());
create policy "grades_teacher_manage" on public.grades for all
  using (public.is_teacher() and class_id in (select public.my_taught_class_ids()))
  with check (public.is_teacher() and class_id in (select public.my_taught_class_ids()));
create policy "grades_student_read_own" on public.grades for select using (student_id = auth.uid());

-- courses: admin full access; teacher manages for their classes; student reads their class's courses
create policy "courses_admin_all" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "courses_teacher_manage" on public.courses for all
  using (public.is_teacher() and class_id in (select public.my_taught_class_ids()))
  with check (public.is_teacher() and class_id in (select public.my_taught_class_ids()));
create policy "courses_student_read_own_class" on public.courses for select using (class_id = public.my_class_id());

-- calendar_events: admin full access; everyone signed-in can read events meant for them
create policy "events_admin_all" on public.calendar_events for all using (public.is_admin()) with check (public.is_admin());
create policy "events_read_relevant" on public.calendar_events for select
  using (
    audience = 'all'
    or (audience = 'teachers' and public.is_teacher())
    or (audience = 'students' and public.my_role() = 'student')
    or (audience = 'class' and class_id = public.my_class_id())
    or (audience = 'class' and class_id in (select public.my_taught_class_ids()))
  );
create policy "events_teacher_manage_own" on public.calendar_events for all
  using (public.is_teacher() and created_by = auth.uid())
  with check (public.is_teacher() and created_by = auth.uid());

-- announcements: same pattern as calendar_events
create policy "announcements_admin_all" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "announcements_read_relevant" on public.announcements for select
  using (
    audience = 'all'
    or (audience = 'teachers' and public.is_teacher())
    or (audience = 'students' and public.my_role() = 'student')
    or (audience = 'class' and class_id = public.my_class_id())
    or (audience = 'class' and class_id in (select public.my_taught_class_ids()))
  );

-- ============================================================
-- 6. SEED DATA (facultatif — quelques classes et matières de base)
-- ============================================================
insert into public.classes (name, level) values
  ('Petite Section', 'Préscolaire'),
  ('Moyenne Section', 'Préscolaire'),
  ('Grande Section', 'Préscolaire'),
  ('CI', 'Élémentaire'),
  ('CP', 'Élémentaire'),
  ('CE1', 'Élémentaire'),
  ('CE2', 'Élémentaire'),
  ('CM1', 'Élémentaire'),
  ('CM2', 'Élémentaire'),
  ('6ème', 'Moyen'),
  ('5ème', 'Moyen'),
  ('4ème', 'Moyen'),
  ('3ème', 'Moyen');

insert into public.subjects (name) values
  ('Français'), ('Mathématiques'), ('Arabe'), ('Anglais'),
  ('Sciences'), ('Histoire-Géographie'), ('Éducation Civique'),
  ('EPS'), ('Éveil');

-- ============================================================
-- 7. DEVENIR ADMIN
-- ============================================================
-- 1) Créez votre compte depuis le site (page /connexion > Créer un compte)
--    avec VOTRE email, ou ajoutez-le depuis Authentication > Add user.
-- 2) Puis exécutez (en remplaçant l'e-mail) :
--
-- update public.profiles set role = 'admin' where email = 'votre-email@exemple.com';
