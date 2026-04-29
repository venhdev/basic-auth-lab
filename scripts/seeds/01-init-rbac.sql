-- 1. Seed Roles
INSERT INTO "roles" ("name") VALUES ('user') ON CONFLICT DO NOTHING;
INSERT INTO "roles" ("name") VALUES ('admin') ON CONFLICT DO NOTHING;

-- 2. Seed Users (Password is 'test123' for both)
-- Admin
INSERT INTO "users" ("id", "email", "password_hash", "created_at")
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'admin@test.com', 
    '$2b$10$fV2F2S4Y1Yp3.vS8.qU1.ORk9Rz8TzR7k9mO1oO1eO1eO1eO1eO1e', 
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Regular User
INSERT INTO "users" ("id", "email", "password_hash", "created_at")
VALUES (
    '550e8400-e29b-41d4-a716-446655440001', 
    'user@test.com', 
    '$2b$10$fV2F2S4Y1Yp3.vS8.qU1.ORk9Rz8TzR7k9mO1oO1eO1eO1eO1eO1e', 
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. Seed Users-Roles Junction
-- Link admin@test.com to both 'user' and 'admin' roles
INSERT INTO "users_roles" ("user_id", "role_id")
SELECT '550e8400-e29b-41d4-a716-446655440000', id FROM "roles"
ON CONFLICT DO NOTHING;

-- Link user@test.com to 'user' role only
INSERT INTO "users_roles" ("user_id", "role_id")
SELECT '550e8400-e29b-41d4-a716-446655440001', id FROM "roles" WHERE name = 'user'
ON CONFLICT DO NOTHING;

-- 4. Seed Profiles (Required for OneToOne)
INSERT INTO "profiles" ("id", "user_id", "bio")
VALUES (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'I am the Boss.')
ON CONFLICT DO NOTHING;

INSERT INTO "profiles" ("id", "user_id", "bio")
VALUES (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Just a regular lab user.')
ON CONFLICT DO NOTHING;

-- 5. Seed Products
INSERT INTO "products" ("name", "price", "description") VALUES
('Vulnerable MacBook', 2500.00, 'Comes with default admin:admin'),
('Security Key', 50.00, 'Universal 2FA hardware'),
('Exploit Manual', 99.00, 'Handwritten by a gray hat'),
('Bug Bounty Juice', 5.99, 'Energy for long nights')
ON CONFLICT DO NOTHING;

-- Verification
SELECT 'Roles count' as label, count(*) FROM "roles"
UNION ALL
SELECT 'Users count', count(*) FROM "users"
UNION ALL
SELECT 'Products count', count(*) FROM "products";
