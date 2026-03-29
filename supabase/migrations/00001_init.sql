-- Users table (synced from auth.users via trigger)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nickname text,
  profile_image text,
  friend_code text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Content type enum
create type content_type as enum ('MOVIE', 'BOOK');

-- Friendship status enum
create type friendship_status as enum ('PENDING', 'ACCEPTED', 'REJECTED');

-- Reviews table
create table public.reviews (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.users(id) on delete cascade,
  content_type content_type not null,
  content_id text not null,
  content_title text not null,
  content_image text,
  body text not null,
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_user_content on public.reviews(user_id, content_type);

-- Taste profiles table
create table public.taste_profiles (
  id text primary key default gen_random_uuid()::text,
  user_id uuid unique not null references public.users(id) on delete cascade,
  keywords text[] not null default '{}',
  summary text not null,
  type text not null,
  updated_at timestamptz not null default now()
);

-- Friendships table
create table public.friendships (
  id text primary key default gen_random_uuid()::text,
  requester_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  status friendship_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  unique(requester_id, receiver_id)
);

-- Trigger: auto-create public.users on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, profile_image)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at();

create trigger reviews_updated_at before update on public.reviews
  for each row execute procedure public.update_updated_at();

create trigger taste_profiles_updated_at before update on public.taste_profiles
  for each row execute procedure public.update_updated_at();

-- RLS policies
alter table public.users enable row level security;
alter table public.reviews enable row level security;
alter table public.taste_profiles enable row level security;
alter table public.friendships enable row level security;

-- Users: anyone can read, only self can update
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Reviews: public reviews readable by all, own reviews full access
create policy "Public reviews are viewable" on public.reviews for select using (is_public or auth.uid() = user_id);
create policy "Users can create own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Taste profiles: readable by all, own profile full access
create policy "Taste profiles are viewable" on public.taste_profiles for select using (true);
create policy "Users can manage own taste" on public.taste_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own taste" on public.taste_profiles for update using (auth.uid() = user_id);

-- Friendships: involved parties can read, requester can create, receiver can update
create policy "Friendships viewable by involved" on public.friendships for select using (auth.uid() = requester_id or auth.uid() = receiver_id);
create policy "Users can send requests" on public.friendships for insert with check (auth.uid() = requester_id);
create policy "Receiver can update status" on public.friendships for update using (auth.uid() = receiver_id);
create policy "Involved can delete" on public.friendships for delete using (auth.uid() = requester_id or auth.uid() = receiver_id);
