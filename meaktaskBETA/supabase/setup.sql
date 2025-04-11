-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  full_name text,
  avatar_url text,
  constraint profiles_email_key unique (email)
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Create policy to allow users to read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Create policy to allow users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create policy to allow users to insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Create policy to allow the trigger to create profiles
create policy "Trigger can create profiles"
  on public.profiles for insert
  with check ( true );

-- Create tasks table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  status text default 'pending'::text,
  user_id uuid references auth.users on delete cascade not null,
  due_date timestamp with time zone,
  priority text default 'medium'::text
);

-- Enable RLS (Row Level Security)
alter table public.tasks enable row level security;

-- Create policy to allow users to read their own tasks
create policy "Users can view own tasks"
  on public.tasks for select
  using ( auth.uid() = user_id );

-- Create policy to allow users to insert their own tasks
create policy "Users can insert own tasks"
  on public.tasks for insert
  with check ( auth.uid() = user_id );

-- Create policy to allow users to update their own tasks
create policy "Users can update own tasks"
  on public.tasks for update
  using ( auth.uid() = user_id );

-- Create policy to allow users to delete their own tasks
create policy "Users can delete own tasks"
  on public.tasks for delete
  using ( auth.uid() = user_id );

-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create a trigger to create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Check if profile already exists
  if not exists (select 1 from public.profiles where id = new.id) then
    begin
      insert into public.profiles (id, email, full_name)
      values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
      );
    exception when others then
      -- Log the error (you can check the logs in Supabase)
      raise notice 'Error creating profile for user %: %', new.id, SQLERRM;
    end;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to check if a user exists
create or replace function public.user_exists(email text)
returns boolean as $$
begin
  return exists (select 1 from auth.users where auth.users.email = email);
end;
$$ language plpgsql security definer;

-- Create a function to get user profile
create or replace function public.get_user_profile(user_id uuid)
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone
) as $$
begin
  return query
  select p.id, p.email, p.full_name, p.avatar_url, p.created_at
  from public.profiles p
  where p.id = user_id;
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
grant all on public.tasks to anon, authenticated;
grant execute on function public.user_exists to anon, authenticated;
grant execute on function public.get_user_profile to anon, authenticated; 