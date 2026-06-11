-- Make sure the media bucket is public so uploaded photos/videos can be viewed
update storage.buckets set public = true where id = 'media';

-- Check results
select id, name, public from storage.buckets;
select name from storage.objects where bucket_id = 'media';
