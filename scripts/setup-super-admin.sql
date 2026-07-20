-- Super Admin Setup Script
-- Generated: 2026-07-20T10:21:02.797Z
-- 
-- IMPORTANT: You need to hash the password before running this script.
-- Password to hash: process.env.SUPERADMIN_PASSWORD
-- Use bcrypt with 10 rounds
-- 
-- To generate the hash, you can:
-- 1. Install bcrypt: npm install bcrypt
-- 2. Run: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('process.env.SUPERADMIN_PASSWORD', 10, (err, hash) => console.log(hash));"
-- 3. Replace <BCRYPT_HASH_HERE> below with the generated hash
--
-- Or use an online bcrypt generator (ensure you trust the source)

-- Insert Super Admin User
INSERT INTO "user" (
    "id",
    "name",
    "username",
    "email",
    "emailVerified",
    "image",
    "role",
    "status",
    "createdAt",
    "updatedAt"
) VALUES (
    'd6f4c0c1-d6c1-44f3-a8ee-7d53e22e863c',
    'Alif Permana',
    'alifpermana',
    'superadmin@alifpustaka.web.id',
    true,
    NULL,
    'super_admin',
    'active',
    '2026-07-20T10:21:02.797Z',
    '2026-07-20T10:21:02.797Z'
);

-- Insert Account for Super Admin (credential provider)
INSERT INTO "account" (
    "id",
    "userId",
    "accountId",
    "providerId",
    "accessToken",
    "refreshToken",
    "accessTokenExpiresAt",
    "refreshTokenExpiresAt",
    "scope",
    "idToken",
    "password",
    "createdAt",
    "updatedAt"
) VALUES (
    '532e5054-4b87-4ed2-adc9-3eb9c30ebab0',
    'd6f4c0c1-d6c1-44f3-a8ee-7d53e22e863c',
    'e795bacf-114a-4db7-8b76-51d70896746f',
    'credential',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '$2b$10$1ySUDlih8252e5R0COotmev4NT83dKqr7ntIpu1U8WNKrzFlGzH/G',
    '2026-07-20T10:21:02.797Z',
    '2026-07-20T10:21:02.797Z'
);

-- Verify Super Admin was created
SELECT 
    u.id,
    u.name,
    u.username,
    u.email,
    u.role,
    u.status,
    u."emailVerified"
FROM "user" u
WHERE u.email = 'superadmin@alifpustaka.web.id';

-- Instructions for use:
-- 1. Generate bcrypt hash for password: process.env.SUPERADMIN_PASSWORD
-- 2. Replace <BCRYPT_HASH_HERE> with the actual hash
-- 3. Run this SQL script in Supabase SQL Editor
-- 4. Super Admin login credentials:
--    Email: superadmin@alifpustaka.web.id
--    Password: process.env.SUPERADMIN_PASSWORD
