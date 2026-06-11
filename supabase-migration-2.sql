-- Storage bucket for uploaded photos & videos
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public read media" on storage.objects
  for select using (bucket_id = 'media');

create policy "Editors upload media" on storage.objects
  for insert with check (bucket_id = 'media' and exists (select 1 from profiles where id = auth.uid()));

create policy "Editors update media" on storage.objects
  for update using (bucket_id = 'media' and exists (select 1 from profiles where id = auth.uid()));

create policy "Editors delete media" on storage.objects
  for delete using (bucket_id = 'media' and exists (select 1 from profiles where id = auth.uid()));

-- New media columns
alter table portfolio_items add column if not exists image_url text;
alter table portfolio_items add column if not exists video_url text;
alter table testimonials add column if not exists photo_url text;

-- New site settings: logo, hero, about text
insert into site_settings (key, value) values
('site_logo', ''),
('hero_video_url', ''),
('hero_badge', 'Digital Marketing Agency'),
('hero_heading_line1', 'Marketing'),
('hero_heading_highlight', 'That Builds'),
('hero_heading_line2', 'Brands That Sell.'),
('hero_description', 'HT Mart helps brands grow through performance marketing, content production, social media and branding — all under one roof.'),
('about_p1', 'HT Mart is a digital marketing agency built for brands that want more than just likes — we focus on strategy, content and performance working together.'),
('about_p2', 'From paid campaigns to photo and video production, social media management to brand identity — our team handles it all under one roof.'),
('about_p3', 'We work closely with every client to build a marketing approach tailored to their goals, audience and budget.')
on conflict (key) do nothing;
