-- ============================================
-- Fix Cron Jobs for Production (Supabase Cloud)
-- Remove localhost jobs and configure for cloud
-- ============================================

-- Step 1: Remove all existing cron jobs running on localhost
SELECT cron.unschedule('refresh-restaurant-leaderboard');
SELECT cron.unschedule('daily-analytics-snapshot');
SELECT cron.unschedule('refresh-pricing-analytics');
SELECT cron.unschedule('calculate-forecast-accuracy');

-- Step 2: Verify all jobs are removed
SELECT * FROM cron.job;

-- ============================================
-- IMPORTANT: Cron Jobs in Supabase Cloud
-- ============================================

-- NOTE: pg_cron in Supabase Free/Pro tier runs on the database server
-- For production, you should use one of these approaches:

-- OPTION 1 (RECOMMENDED): Use Supabase Edge Functions with cron triggers
-- This is the proper way to schedule tasks in Supabase Cloud
-- Configure via Supabase Dashboard: 
-- https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/functions

-- OPTION 2: Use pg_cron (Limited in Free tier)
-- If you must use pg_cron, it will run on Supabase's servers automatically
-- Re-create the jobs (they will use Supabase's nodename):

-- Refresh restaurant leaderboard daily at 4 AM UTC
SELECT cron.schedule(
  'refresh-restaurant-leaderboard',
  '0 4 * * *',
  'REFRESH MATERIALIZED VIEW restaurant_leaderboard;'
);

-- Daily analytics snapshot at 3 AM UTC
SELECT cron.schedule(
  'daily-analytics-snapshot',
  '0 3 * * *',
  $$
  INSERT INTO "AuditLog" (
    action, 
    "entityType", 
    "detailsJson",
    "createdAt"
  )
  SELECT 
    'DAILY_ANALYTICS_SNAPSHOT',
    'SYSTEM',
    json_build_object(
      'date', CURRENT_DATE - INTERVAL '1 day',
      'metrics', json_build_object(
        'totalBookings', COUNT(DISTINCT b.id),
        'completedBookings', COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END),
        'totalRevenue', COALESCE(SUM(p."totalAmount"), 0),
        'averageOrderValue', COALESCE(AVG(p."totalAmount"), 0),
        'uniqueCustomers', COUNT(DISTINCT b."userId"),
        'activeRestaurants', COUNT(DISTINCT b."restaurantId"),
        'newUsers', (
          SELECT COUNT(*) FROM "User" 
          WHERE "createdAt" >= CURRENT_DATE - INTERVAL '1 day'
          AND "createdAt" < CURRENT_DATE
        ),
        'rewardsDistributed', (
          SELECT COALESCE(SUM(points), 0) FROM "Reward"
          WHERE type = 'EARNED'
          AND "createdAt" >= CURRENT_DATE - INTERVAL '1 day'
          AND "createdAt" < CURRENT_DATE
        )
      )
    )::text,
    NOW()
  FROM "Booking" b
  LEFT JOIN "Payment" p ON p."bookingId" = b.id
  WHERE b."createdAt" >= CURRENT_DATE - INTERVAL '1 day'
    AND b."createdAt" < CURRENT_DATE;
  $$
);

-- Verify new jobs are created
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  active
FROM cron.job
ORDER BY jobid;

-- ============================================
-- PRODUCTION CONFIGURATION COMPLETE
-- ============================================

-- The jobs will now run on Supabase's infrastructure (nodename will be postgres or similar)
-- To monitor job execution:
SELECT 
  j.jobname,
  j.schedule,
  j.active,
  jr.status,
  jr.return_message,
  jr.start_time,
  jr.end_time
FROM cron.job j
LEFT JOIN cron.job_run_details jr ON jr.jobid = j.jobid
WHERE jr.start_time >= NOW() - INTERVAL '7 days'
ORDER BY jr.start_time DESC
LIMIT 20;
