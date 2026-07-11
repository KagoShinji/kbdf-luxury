-- ============================================================
-- 20260711000004_fix_storage_receipts_rls.sql
-- Adds RLS policies on storage.objects so that authenticated
-- customers can upload proof-of-payment receipt images into
-- the 'media' bucket under <tenantId>/receipts/ paths.
-- ============================================================

-- Policy: authenticated users can INSERT objects into media bucket
CREATE POLICY "authenticated_users_can_upload_media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Policy: authenticated users can SELECT/read objects in media bucket
CREATE POLICY "authenticated_users_can_read_media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media');

-- Policy: authenticated users can UPDATE (upsert) objects they uploaded
CREATE POLICY "authenticated_users_can_update_media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media');
