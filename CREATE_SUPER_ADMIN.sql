-- ============================================
-- Create Super Admin User: sahith@nivixpe.com
-- Password: Sahi@0045
-- ============================================

-- Insert Super Admin User
INSERT INTO "User" (
  id,
  email,
  "passwordHash",
  name,
  role,
  verified,
  institution,
  "homePath",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'sahith@nivixpe.com',
  '$2b$10$H08ffxEgBIaPpzwsdgZ.dOr5MQkkS0DooWFkf3x6mfMtGr8iSok0C',
  'Sahith Nivixpe',
  'SUPER_ADMIN',
  true,
  'Nivixpe',
  '/management/super-admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  role = EXCLUDED.role,
  verified = true,
  "homePath" = '/management/super-admin',
  "updatedAt" = NOW();

-- Verify the user was created
SELECT 
  id,
  email,
  name,
  role,
  verified,
  institution,
  "homePath",
  "createdAt"
FROM "User"
WHERE email = 'sahith@nivixpe.com';
