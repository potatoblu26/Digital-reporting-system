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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  next_name text := nullif(trim(coalesce(metadata->>'name', '')), '');
  next_role text := coalesce(nullif(metadata->>'role', ''), 'user');
  next_account_type text := coalesce(nullif(metadata->>'accountType', ''), 'resident');
  next_verification_status text := coalesce(nullif(metadata->>'verificationStatus', ''), 'approved');
  next_contact_number text := nullif(trim(coalesce(metadata->>'contactNumber', '')), '');
  next_address text := nullif(trim(coalesce(metadata->>'address', '')), '');
  next_position text := nullif(trim(coalesce(metadata->>'position', '')), '');
  next_access_code text := upper(nullif(trim(coalesce(metadata->>'accessCode', '')), ''));
begin
  if next_name is null then
    next_name := split_part(coalesce(new.email, ''), '@', 1);
  end if;

  insert into public.profiles (
    id,
    email,
    name,
    role,
    barangay,
    auth_id,
    account_type,
    verification_status,
    contact_number,
    address,
    position,
    access_code,
    failed_login_attempts,
    locked_until,
    is_active
  )
  values (
    new.id,
    lower(coalesce(new.email, '')),
    next_name,
    next_role::text,
    'Barangay Digital Reporting System',
    coalesce(next_access_code, new.id::text),
    next_account_type::text,
    next_verification_status::text,
    next_contact_number,
    next_address,
    next_position,
    next_access_code,
    0,
    null,
    true
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name,
    role = excluded.role,
    barangay = excluded.barangay,
    auth_id = excluded.auth_id,
    account_type = excluded.account_type,
    verification_status = excluded.verification_status,
    contact_number = excluded.contact_number,
    address = excluded.address,
    position = excluded.position,
    access_code = excluded.access_code,
    failed_login_attempts = excluded.failed_login_attempts,
    locked_until = excluded.locked_until,
    is_active = excluded.is_active;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (
  id,
  email,
  name,
  role,
  barangay,
  auth_id,
  account_type,
  verification_status,
  contact_number,
  address,
  position,
  access_code,
  failed_login_attempts,
  locked_until,
  is_active
)
select
  u.id,
  lower(coalesce(u.email, '')),
  coalesce(nullif(trim(coalesce(u.raw_user_meta_data->>'name', '')), ''), split_part(coalesce(u.email, ''), '@', 1)),
  coalesce(nullif(u.raw_user_meta_data->>'role', ''), 'user')::text,
  'Barangay Digital Reporting System',
  coalesce(upper(nullif(trim(coalesce(u.raw_user_meta_data->>'accessCode', '')), '')), u.id::text),
  coalesce(nullif(u.raw_user_meta_data->>'accountType', ''), 'resident')::text,
  coalesce(nullif(u.raw_user_meta_data->>'verificationStatus', ''), 'approved')::text,
  nullif(trim(coalesce(u.raw_user_meta_data->>'contactNumber', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'address', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'position', '')), ''),
  upper(nullif(trim(coalesce(u.raw_user_meta_data->>'accessCode', '')), '')),
  0,
  null,
  true
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);
