-- ============================================
-- Advanced Features Database Schema
-- Rewards, Push Tokens, and Enhanced Tables
-- ============================================

-- Add rewards and push notification fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "rewardPoints" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "fcmToken" TEXT,
ADD COLUMN IF NOT EXISTS "pushEnabled" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "emailNotifications" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "smsNotifications" BOOLEAN DEFAULT false;

-- Create Rewards table for tracking point transactions
CREATE TABLE IF NOT EXISTS "Reward" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- EARNED | REDEEMED | EXPIRED
  source TEXT NOT NULL, -- BOOKING_COMPLETED | PAYMENT_COMPLETED | REVIEW | REFERRAL | FIRST_BOOKING
  points INTEGER NOT NULL,
  "bookingId" TEXT REFERENCES "Booking"(id) ON DELETE SET NULL,
  description TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_reward_userId" ON "Reward"("userId");
CREATE INDEX IF NOT EXISTS "idx_reward_type" ON "Reward"(type);
CREATE INDEX IF NOT EXISTS "idx_reward_createdAt" ON "Reward"("createdAt");

-- Create Referral table for tracking referrals
CREATE TABLE IF NOT EXISTS "Referral" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "referrerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "refereeId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  "refereeEmail" TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING | COMPLETED | EXPIRED
  "rewardPoints" INTEGER DEFAULT 0,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_referral_referrerId" ON "Referral"("referrerId");
CREATE INDEX IF NOT EXISTS "idx_referral_code" ON "Referral"(code);
CREATE INDEX IF NOT EXISTS "idx_referral_status" ON "Referral"(status);

-- Create PushSubscription table for web push notifications
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  auth TEXT NOT NULL,
  "userAgent" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "lastUsedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_pushsub_userId" ON "PushSubscription"("userId");
CREATE INDEX IF NOT EXISTS "idx_pushsub_isActive" ON "PushSubscription"("isActive");

-- Add reward-related fields to Offer table
ALTER TABLE "Offer"
ADD COLUMN IF NOT EXISTS "pointsCost" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isRewardOffer" BOOLEAN DEFAULT false;

-- Add referral tracking to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "referralCode" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "referredBy" TEXT REFERENCES "User"(id) ON DELETE SET NULL;

-- Generate referral codes for existing users
UPDATE "User" 
SET "referralCode" = UPPER(SUBSTRING(MD5(id || email) FROM 1 FOR 8))
WHERE "referralCode" IS NULL;

-- Create view for user rewards summary
CREATE OR REPLACE VIEW "UserRewardsSummary" AS
SELECT 
  u.id,
  u.email,
  u.name,
  COALESCE(u."rewardPoints", 0) as "currentPoints",
  COALESCE(SUM(CASE WHEN r.type = 'EARNED' THEN r.points ELSE 0 END), 0) as "totalEarned",
  COALESCE(SUM(CASE WHEN r.type = 'REDEEMED' THEN r.points ELSE 0 END), 0) as "totalRedeemed",
  COUNT(DISTINCT CASE WHEN r.type = 'EARNED' THEN r.id END) as "earnTransactions",
  MAX(r."createdAt") as "lastActivity"
FROM "User" u
LEFT JOIN "Reward" r ON r."userId" = u.id
GROUP BY u.id, u.email, u.name, u."rewardPoints";

-- Create function to update user reward points
CREATE OR REPLACE FUNCTION update_user_reward_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'EARNED' THEN
    UPDATE "User" 
    SET "rewardPoints" = COALESCE("rewardPoints", 0) + NEW.points
    WHERE id = NEW."userId";
  ELSIF NEW.type = 'REDEEMED' THEN
    UPDATE "User" 
    SET "rewardPoints" = COALESCE("rewardPoints", 0) - NEW.points
    WHERE id = NEW."userId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic point updates
DROP TRIGGER IF EXISTS trigger_update_reward_points ON "Reward";
CREATE TRIGGER trigger_update_reward_points
AFTER INSERT ON "Reward"
FOR EACH ROW
EXECUTE FUNCTION update_user_reward_points();

-- Insert sample rewards data for existing users
INSERT INTO "Reward" ("userId", type, source, points, description)
SELECT 
  id,
  'EARNED',
  'WELCOME_BONUS',
  100,
  'Welcome bonus - Thank you for joining!'
FROM "User"
WHERE role = 'STUDENT'
ON CONFLICT DO NOTHING;

-- Comment: Rewards System Rules
COMMENT ON TABLE "Reward" IS 'Tracks all reward point transactions';
COMMENT ON COLUMN "Reward".type IS 'EARNED: Points added | REDEEMED: Points spent | EXPIRED: Points removed';
COMMENT ON COLUMN "Reward".source IS 'Where the points came from: BOOKING_COMPLETED, PAYMENT_COMPLETED, REVIEW, REFERRAL, FIRST_BOOKING';

-- Verify the changes
SELECT 
  'Users with rewards' as metric,
  COUNT(*) as count
FROM "User"
WHERE "rewardPoints" > 0

UNION ALL

SELECT 
  'Total rewards transactions' as metric,
  COUNT(*) as count
FROM "Reward"

UNION ALL

SELECT 
  'Active push subscriptions' as metric,
  COUNT(*) as count
FROM "PushSubscription"
WHERE "isActive" = true;
