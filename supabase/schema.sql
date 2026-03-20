create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('user', 'admin')),
  barangay text not null default 'Barangay Digital Reporting System',
  auth_id text not null,
  created_at timestamptz not null default now(),
  account_type text not null check (account_type in ('resident', 'official', 'super_admin')),
  verification_status text not null default 'approved' check (verification_status in ('pending', 'approved')),
  contact_number text,
  address text,
  position text,
  access_code text unique,
  failed_login_attempts integer not null default 0,
  locked_until timestamptz,
  is_active boolean not null default true
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  title text not null,
  category text not null,
  description text not null,
  location text not null,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'resolved', 'rejected')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  image_url text,
  assigned_official_id uuid references public.profiles(id),
  assigned_official_name text,
  escalated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  audience text not null check (audience in ('all', 'residents', 'officials')),
  created_at timestamptz not null default now(),
  created_by text not null
);

create table if not exists public.system_settings (
  id integer primary key,
  barangay_name text not null,
  report_categories text[] not null,
  report_status_types text[] not null,
  features jsonb not null
);

insert into public.system_settings (id, barangay_name, report_categories, report_status_types, features)
values (
  1,
  'Barangay Digital Reporting System',
  array['Infrastructure', 'Sanitation', 'Public Safety', 'Utilities', 'Health', 'Environment', 'Other'],
  array['Pending', 'Ongoing', 'Resolved', 'Rejected'],
  '{"reporting": true, "announcements": true, "analytics": true}'::jsonb
)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.announcements enable row level security;
alter table public.system_settings enable row level security;

create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "users can view own profile and admins can view all profiles"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.is_active = true
  )
);

create policy "users can update own profile and admins can manage profiles"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.is_active = true
  )
)
with check (
  auth.uid() = id
  or exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.is_active = true
  )
);

create policy "residents can create own reports"
on public.reports
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can view own reports and admins can view all reports"
on public.reports
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.is_active = true
  )
);

create policy "admins can update reports"
on public.reports
for update
to authenticated
using (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.is_active = true
  )
);

create policy "authenticated users can read announcements"
on public.announcements
for select
to authenticated
using (true);

create policy "admins can create announcements"
on public.announcements
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.is_active = true
  )
);

create policy "authenticated users can read system settings"
on public.system_settings
for select
to authenticated
using (true);

create policy "super admins can update system settings"
on public.system_settings
for update
to authenticated
using (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.account_type = 'super_admin'
      and admin_profile.is_active = true
  )
)
with check (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.account_type = 'super_admin'
      and admin_profile.is_active = true
  )
);
