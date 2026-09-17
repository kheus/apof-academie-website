-- APOF Académie — comptabilité (tarifs, paiements élèves, dépenses)
-- À exécuter une seule fois dans Supabase (SQL Editor), après schema.sql et schema2_admissions_hr.sql

-- ============================================================
-- 1. TABLES
-- ============================================================

create table public.fee_schedules (
  id uuid primary key default gen_random_uuid(),
  level text not null,                    -- Préscolaire / Élémentaire / Moyen
  school_year text not null default '2026-2027',
  registration_fee numeric not null default 0,  -- droit d'inscription
  monthly_fee numeric not null default 0,       -- mensualité
  supplies_fee numeric not null default 0,      -- tenues / fournitures
  created_at timestamptz not null default now(),
  unique (level, school_year)
);

create sequence public.receipt_seq start 1;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique default
    ('REC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.receipt_seq')::text, 5, '0')),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  payment_type text not null check (payment_type in ('inscription','mensualite','tenue','autre')),
  period text,                             -- pour une mensualité, ex: '2026-11'
  amount numeric not null,
  payment_date date not null default current_date,
  payment_method text not null default 'especes' check (payment_method in ('especes','mobile_money','virement','cheque','autre')),
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('loyer','fournitures','electricite','eau','entretien','transport','materiel','autre')),
  description text not null,
  amount numeric not null,
  expense_date date not null default current_date,
  payment_method text not null default 'especes' check (payment_method in ('especes','mobile_money','virement','cheque','autre')),
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================
alter table public.fee_schedules enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;

-- tarifs : lecture publique (affichés sur le site), écriture admin uniquement
create policy "fee_schedules_select_public" on public.fee_schedules for select using (true);
create policy "fee_schedules_write_admin" on public.fee_schedules for all using (public.is_admin()) with check (public.is_admin());

-- paiements : admin a tout accès ; un élève peut voir uniquement ses propres paiements
create policy "payments_admin_all" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "payments_select_own" on public.payments for select using (student_id = auth.uid());

-- dépenses : strictement réservées à l'administration
create policy "expenses_admin_all" on public.expenses for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 3. DONNÉES DE DÉPART — tarifs 2026-2027 (identiques à la fiche officielle)
-- ============================================================
insert into public.fee_schedules (level, school_year, registration_fee, monthly_fee, supplies_fee) values
  ('Préscolaire', '2026-2027', 23000, 10000, 12000),
  ('Élémentaire', '2026-2027', 20000, 15000, 20000),
  ('Moyen', '2026-2027', 30000, 17000, 23000);
