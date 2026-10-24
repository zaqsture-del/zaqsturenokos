-- Jalankan di Supabase SQL Editor sebelum deploy.
create extension if not exists pgcrypto;
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text unique,
  email text unique,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  provider_order_id text,
  service text not null,
  phone_number text,
  status text not null default 'pending',
  price numeric(12,2) not null default 0,
  provider_response jsonb,
  admin_note text,
  created_at timestamptz not null default now()
);
alter table public.users enable row level security;
alter table public.orders enable row level security;
-- Akses database dari route server memakai service-role key yang hanya disimpan di environment server.
-- Jangan masukkan SUPABASE_SERVICE_ROLE_KEY ke variabel NEXT_PUBLIC_*.
