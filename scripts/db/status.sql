-- Database Status Report
SELECT 'Roles' as table_name, count(*) as row_count FROM "roles"
UNION ALL
SELECT 'Users', count(*) FROM "users"
UNION ALL
SELECT 'Users_Roles (Junction)', count(*) FROM "users_roles"
UNION ALL
SELECT 'Profiles', count(*) FROM "profiles"
UNION ALL
SELECT 'Products', count(*) FROM "products"
UNION ALL
SELECT 'Refresh_Tokens', count(*) FROM "refresh_tokens";
