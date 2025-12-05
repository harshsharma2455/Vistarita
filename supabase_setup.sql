-- 1. Create Canvases table (if it doesn't exist)
create table if not exists canvases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  content jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Security (RLS)
alter table canvases enable row level security;

-- 3. Create Policies (Drop existing ones first to avoid errors)
drop policy if exists "Users can select own canvases" on canvases;
drop policy if exists "Users can insert own canvases" on canvases;
drop policy if exists "Users can update own canvases" on canvases;

create policy "Users can select own canvases" on canvases for select using (auth.uid() = user_id);
create policy "Users can insert own canvases" on canvases for insert with check (auth.uid() = user_id);
create policy "Users can update own canvases" on canvases for update using (auth.uid() = user_id);

-- 4. Setup Storage for Images/PDFs
insert into storage.buckets (id, name) values ('canvas-assets', 'canvas-assets')
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'canvas-assets' );
create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'canvas-assets' and auth.role() = 'authenticated' );
