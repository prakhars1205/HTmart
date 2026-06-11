-- Contact form submissions
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  company text,
  service text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table inquiries enable row level security;

-- Anyone (including visitors who aren't logged in) can submit the contact form
create policy "Anyone can submit an inquiry" on inquiries
  for insert with check (true);

-- Only logged-in editors/admins can view, update, or delete messages
create policy "Editors can view inquiries" on inquiries
  for select using (exists (select 1 from profiles where id = auth.uid()));

create policy "Editors can update inquiries" on inquiries
  for update using (exists (select 1 from profiles where id = auth.uid()));

create policy "Editors can delete inquiries" on inquiries
  for delete using (exists (select 1 from profiles where id = auth.uid()));
