-- APOF Académie — pré-inscription en ligne, rendez-vous, contrats & paie
-- À exécuter une seule fois dans Supabase (SQL Editor), après schema.sql

-- ============================================================
-- 1. TABLES — Pré-inscription & rendez-vous
-- ============================================================

create table public.enrollment_fields (
  id uuid primary key default gen_random_uuid(),
  field_key text not null unique,
  label text not null,
  field_type text not null default 'text' check (field_type in ('text','textarea','number','date','tel','email','select')),
  options text[],
  required boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  location text not null default 'Secrétariat — Parcelles Assainies, Thiès',
  capacity int not null default 3,
  booked_count int not null default 0,
  created_at timestamptz not null default now()
);

create table public.admission_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  child_full_name text not null,
  child_birthdate date,
  desired_class_id uuid references public.classes(id) on delete set null,
  parent_name text not null,
  parent_phone text not null,
  parent_email text,
  responses jsonb not null default '{}'::jsonb,
  slot_id uuid references public.appointment_slots(id) on delete set null,
  status text not null default 'nouveau' check (status in ('nouveau','contacte','rdv_confirme','inscrit','refuse')),
  admin_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. TABLES — RH : contrats & paie des enseignants
-- ============================================================

create table public.teacher_contracts (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  contract_type text not null default 'CDI' check (contract_type in ('CDI','CDD','Vacataire')),
  position text not null default 'Enseignant',
  start_date date not null,
  end_date date,
  monthly_salary numeric not null default 0,
  file_url text,
  status text not null default 'actif' check (status in ('actif','termine','suspendu')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.payroll (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  contract_id uuid references public.teacher_contracts(id) on delete set null,
  period text not null,                  -- ex: '2026-10'
  base_salary numeric not null default 0,
  bonuses numeric not null default 0,
  deductions numeric not null default 0,
  net_pay numeric not null default 0,
  status text not null default 'en_attente' check (status in ('en_attente','paye')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (teacher_id, period)
);

-- ============================================================
-- 3. FONCTION : soumission sécurisée d'une pré-inscription
--    (contourne RLS via security definer — seul point d'écriture
--    autorisé pour un visiteur anonyme)
-- ============================================================
create function public.submit_admission_request(
  p_child_full_name text,
  p_child_birthdate date,
  p_desired_class_id uuid,
  p_parent_name text,
  p_parent_phone text,
  p_parent_email text,
  p_responses jsonb,
  p_slot_id uuid
)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_reference text;
  v_remaining int;
begin
  if p_slot_id is not null then
    select (capacity - booked_count) into v_remaining
      from public.appointment_slots where id = p_slot_id for update;

    if v_remaining is null then
      raise exception 'Créneau introuvable';
    end if;
    if v_remaining <= 0 then
      raise exception 'Ce créneau est déjà complet';
    end if;

    update public.appointment_slots
      set booked_count = booked_count + 1
      where id = p_slot_id;
  end if;

  v_reference := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.admission_requests (
    reference, child_full_name, child_birthdate, desired_class_id,
    parent_name, parent_phone, parent_email, responses, slot_id
  ) values (
    v_reference, p_child_full_name, p_child_birthdate, p_desired_class_id,
    p_parent_name, p_parent_phone, p_parent_email, coalesce(p_responses, '{}'::jsonb), p_slot_id
  );

  return v_reference;
end;
$$;

grant execute on function public.submit_admission_request(
  text, date, uuid, text, text, text, jsonb, uuid
) to anon, authenticated;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
alter table public.enrollment_fields enable row level security;
alter table public.appointment_slots enable row level security;
alter table public.admission_requests enable row level security;
alter table public.teacher_contracts enable row level security;
alter table public.payroll enable row level security;

-- Le formulaire public doit pouvoir lire les champs et les créneaux
create policy "enrollment_fields_select_public" on public.enrollment_fields for select using (true);
create policy "enrollment_fields_write_admin" on public.enrollment_fields for all using (public.is_admin()) with check (public.is_admin());

create policy "slots_select_public" on public.appointment_slots for select using (true);
create policy "slots_write_admin" on public.appointment_slots for all using (public.is_admin()) with check (public.is_admin());

-- admission_requests : aucun accès direct pour anon (passage obligé par la fonction
-- security definer ci-dessus) ; l'administration seule peut lire/gérer les demandes.
create policy "admission_requests_admin_all" on public.admission_requests for all
  using (public.is_admin()) with check (public.is_admin());

-- contrats & paie : admin a tout accès ; l'enseignant ne voit que ses propres données
create policy "contracts_admin_all" on public.teacher_contracts for all using (public.is_admin()) with check (public.is_admin());
create policy "contracts_select_own" on public.teacher_contracts for select using (teacher_id = auth.uid());

create policy "payroll_admin_all" on public.payroll for all using (public.is_admin()) with check (public.is_admin());
create policy "payroll_select_own" on public.payroll for select using (teacher_id = auth.uid());

-- ============================================================
-- 5. DONNÉES DE DÉPART
-- ============================================================
insert into public.enrollment_fields (field_key, label, field_type, options, required, sort_order) values
  ('classe_precedente', 'Classe / école précédente (si applicable)', 'text', null, false, 1),
  ('redoublant', 'Élève redoublant ?', 'select', array['Oui','Non'], true, 2),
  ('adresse', 'Adresse du domicile', 'text', null, true, 3),
  ('informations_complementaires', 'Informations complémentaires', 'textarea', null, false, 4);

insert into public.appointment_slots (start_at, capacity) values
  (date_trunc('day', now()) + interval '3 days' + interval '9 hours', 3),
  (date_trunc('day', now()) + interval '3 days' + interval '11 hours', 3),
  (date_trunc('day', now()) + interval '5 days' + interval '9 hours', 3),
  (date_trunc('day', now()) + interval '5 days' + interval '11 hours', 3),
  (date_trunc('day', now()) + interval '7 days' + interval '9 hours', 3),
  (date_trunc('day', now()) + interval '7 days' + interval '11 hours', 3),
  (date_trunc('day', now()) + interval '10 days' + interval '9 hours', 3),
  (date_trunc('day', now()) + interval '10 days' + interval '11 hours', 3);
