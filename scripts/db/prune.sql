-- Prune Database: Clean all user data but keep Roles structure
BEGIN;

-- 1. Disable triggers to speed up and avoid some constraint issues during mass delete
SET CONSTRAINTS ALL DEFERRED;

-- 2. Truncate tables (Delete all data)
-- We truncate in order of dependency
TRUNCATE TABLE "refresh_tokens" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "users_roles" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "profiles" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;

-- Note: We DO NOT truncate the "roles" table as per request to keep it as structure.
-- If roles were deleted, we would need to re-seed them.

COMMIT;

-- Verification
SELECT 'Users' as table, count(*) FROM "users"
UNION ALL
SELECT 'Products', count(*) FROM "products"
UNION ALL
SELECT 'Roles', count(*) FROM "roles";
