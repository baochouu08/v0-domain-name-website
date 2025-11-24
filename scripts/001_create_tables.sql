-- Create domains table
create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  price numeric(10, 2) not null,
  tld text not null,
  status text default 'available',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create cart items table
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain_id uuid not null references public.domains(id) on delete cascade,
  added_at timestamp default now(),
  unique(user_id, domain_id)
);

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_amount numeric(10, 2) not null,
  status text default 'pending',
  payment_intent_id text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create order items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  domain_id uuid not null references public.domains(id),
  price_at_purchase numeric(10, 2) not null,
  created_at timestamp default now()
);

-- Create user profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  phone text,
  address text,
  city text,
  country text,
  postal_code text,
  is_admin boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS on all tables
alter table public.domains enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;

-- Domains: Everyone can view, only admins can create/update/delete
create policy "domains_select_all" on public.domains for select using (true);
create policy "domains_insert_admin" on public.domains for insert with check (
  exists(select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "domains_update_admin" on public.domains for update using (
  exists(select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "domains_delete_admin" on public.domains for delete using (
  exists(select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Cart items: Users can only manage their own
create policy "cart_items_select_own" on public.cart_items for select using (auth.uid() = user_id);
create policy "cart_items_insert_own" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "cart_items_update_own" on public.cart_items for update using (auth.uid() = user_id);
create policy "cart_items_delete_own" on public.cart_items for delete using (auth.uid() = user_id);

-- Orders: Users can only view their own
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own" on public.orders for update using (auth.uid() = user_id);

-- Order items: Users can view their own order's items
create policy "order_items_select_own" on public.order_items for select using (
  exists(select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Profiles: Users can only manage their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Create trigger for new user profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Insert sample domains
insert into public.domains (name, description, price, tld, status) values
  ('techvision', 'Perfect for tech startups and innovators', 49.99, 'com', 'available'),
  ('cloudwave', 'Great for cloud services and tech solutions', 39.99, 'com', 'available'),
  ('innovate', 'Ideal for innovation-focused companies', 59.99, 'com', 'available'),
  ('digital', 'Perfect for digital agencies and studios', 44.99, 'com', 'available'),
  ('nexus', 'Connect your business with nexus domain', 54.99, 'com', 'available'),
  ('velocity', 'Fast-growing business domain', 49.99, 'com', 'available'),
  ('fusion', 'Merge ideas and technology', 44.99, 'com', 'available'),
  ('horizon', 'Expand your business horizons', 39.99, 'com', 'available'),
  ('spectrum', 'Full spectrum business solutions', 64.99, 'com', 'available'),
  ('zenith', 'Reach the peak of success', 59.99, 'com', 'available')
on conflict do nothing;
