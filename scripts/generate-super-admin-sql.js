// Generate Super Admin Setup SQL
// Run this with: node scripts/generate-super-admin-sql.js

const crypto = require("crypto");

// Generate UUIDs
const userId = crypto.randomUUID();
const accountId = crypto.randomUUID();
const accountIdField = crypto.randomUUID();

const timestamp = new Date().toISOString();

console.log(`-- Super Admin Setup Script
-- Generated: ${timestamp}
-- 
-- IMPORTANT: You need to hash the password before running this script.
-- Password to hash: process.env.SUPERADMIN_PASSWORD
-- Use bcrypt with 10 rounds
-- 
-- To generate the hash, run:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('process.env.SUPERADMIN_PASSWORD', 10, (err, hash) => console.log(hash));"
--
-- Then replace <BCRYPT_HASH_HERE> below with the generated hash

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
    '${userId}',
    'Alif Permana',
    'alifpermana',
    'superadmin@alifpustaka.web.id',
    true,
    NULL,
    'super_admin',
    'active',
    '${timestamp}',
    '${timestamp}'
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
    '${accountId}',
    '${userId}',
    '${accountIdField}',
    'credential',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '<BCRYPT_HASH_HERE>',
    '${timestamp}',
    '${timestamp}'
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

-- Instructions:
-- 1. Install bcrypt: npm install bcrypt
-- 2. Generate hash: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('process.env.SUPERADMIN_PASSWORD', 10, (err, hash) => console.log(hash));"
-- 3. Replace <BCRYPT_HASH_HERE> with the hash
-- 4. Run this SQL script in Supabase SQL Editor
-- 5. Super Admin login: superadmin@alifpustaka.web.id / process.env.SUPERADMIN_PASSWORD
`);
