-- ============================================
-- Supabase Compute Functions
-- Advanced SQL functions leveraging database compute
-- ============================================

-- ===================================
-- 1. RESTAURANT ANALYTICS COMPUTATION
-- ===================================

CREATE OR REPLACE FUNCTION calculate_restaurant_analytics(restaurant_id_param INT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'restaurantId', restaurant_id_param,
    'restaurantName', r.name,
    'totalBookings', COUNT(DISTINCT b.id),
    'completedBookings', COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END),
    'totalRevenue', COALESCE(SUM(p."totalAmount"), 0),
    'averageOrderValue', COALESCE(AVG(p."totalAmount"), 0),
    'averageRating', COALESCE(AVG(rev.rating), 0),
    'totalReviews', COUNT(DISTINCT rev.id),
    'uniqueCustomers', COUNT(DISTINCT b."userId"),
    'popularDishes', (
      SELECT json_agg(dish_data)
      FROM (
        SELECT 
          bo.name,
          COUNT(*) as order_count,
          SUM(bo.quantity) as total_quantity
        FROM "BookingOrder" bo
        JOIN "Booking" b2 ON b2.id = bo."bookingId"
        WHERE b2."restaurantId" = restaurant_id_param
        GROUP BY bo.name
        ORDER BY COUNT(*) DESC
        LIMIT 5
      ) dish_data
    ),
    'peakHours', (
      SELECT json_agg(hour_data)
      FROM (
        SELECT 
          b3.time as booking_time,
          COUNT(*) as booking_count
        FROM "Booking" b3
        WHERE b3."restaurantId" = restaurant_id_param
        GROUP BY b3.time
        ORDER BY COUNT(*) DESC
        LIMIT 5
      ) hour_data
    ),
    'customerRetention', (
      SELECT COALESCE(
        ROUND(
          COUNT(DISTINCT CASE WHEN booking_count > 1 THEN user_id END)::numeric / 
          NULLIF(COUNT(DISTINCT user_id), 0) * 100, 
          2
        ),
        0
      )
      FROM (
        SELECT "userId" as user_id, COUNT(*) as booking_count
        FROM "Booking"
        WHERE "restaurantId" = restaurant_id_param AND "userId" IS NOT NULL
        GROUP BY "userId"
      ) retention_data
    )
  ) INTO result
  FROM "Restaurant" r
  LEFT JOIN "Booking" b ON b."restaurantId" = r.id
  LEFT JOIN "Payment" p ON p."bookingId" = b.id
  LEFT JOIN "Review" rev ON rev."restaurantId" = r.id
  WHERE r.id = restaurant_id_param
  GROUP BY r.id, r.name;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_restaurant_analytics IS 'Computes comprehensive analytics for a restaurant';

-- ===================================
-- 2. REAL-TIME SEAT AVAILABILITY
-- ===================================

CREATE OR REPLACE FUNCTION get_available_seats(
  restaurant_id_param INT,
  date_param TEXT,
  time_param TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'restaurantId', restaurant_id_param,
    'restaurantName', r.name,
    'date', date_param,
    'time', time_param,
    'totalCapacity', r.capacity,
    'bookedSeats', COALESCE(SUM(b.guests), 0),
    'availableSeats', r.capacity - COALESCE(SUM(b.guests), 0),
    'isAvailable', (r.capacity - COALESCE(SUM(b.guests), 0)) > 0,
    'bookingsCount', COUNT(b.id),
    'bookings', COALESCE(
      json_agg(
        json_build_object(
          'id', b.id,
          'guests', b.guests,
          'status', b.status,
          'guestName', b."guestName"
        )
      ) FILTER (WHERE b.id IS NOT NULL),
      '[]'::json
    )
  ) INTO result
  FROM "Restaurant" r
  LEFT JOIN "Booking" b ON b."restaurantId" = r.id 
    AND b.date = date_param 
    AND b.time = time_param
    AND b.status IN ('CONFIRMED', 'SEATED')
  WHERE r.id = restaurant_id_param
  GROUP BY r.id, r.name, r.capacity;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_seats IS 'Computes real-time seat availability for a specific date/time';

-- ===================================
-- 3. SMART RECOMMENDATION ENGINE
-- ===================================

CREATE OR REPLACE FUNCTION get_restaurant_recommendations(user_id_param TEXT)
RETURNS TABLE (
  restaurant_id INT,
  restaurant_name TEXT,
  cuisine TEXT,
  rating FLOAT,
  recommendation_score FLOAT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      ARRAY_AGG(DISTINCT r.cuisine) as preferred_cuisines,
      AVG(p."totalAmount") as avg_spend,
      COUNT(DISTINCT b."restaurantId") as visited_count
    FROM "Booking" b
    JOIN "Restaurant" r ON r.id = b."restaurantId"
    LEFT JOIN "Payment" p ON p."bookingId" = b.id
    WHERE b."userId" = user_id_param
  ),
  restaurant_scores AS (
    SELECT 
      r.id,
      r.name,
      r.cuisine,
      r.rating,
      r.price,
      COUNT(DISTINCT b.id) as popularity,
      -- Score calculation (0-100)
      (
        -- Cuisine match (40 points)
        CASE WHEN r.cuisine = ANY((SELECT preferred_cuisines FROM user_preferences)) THEN 40 ELSE 0 END +
        -- Rating (30 points max)
        (r.rating * 6) +
        -- Popularity (20 points max, capped)
        LEAST(COUNT(DISTINCT b.id) * 0.1, 20) +
        -- New to user bonus (10 points)
        CASE WHEN NOT EXISTS (
          SELECT 1 FROM "Booking" b2 
          WHERE b2."userId" = user_id_param AND b2."restaurantId" = r.id
        ) THEN 10 ELSE 0 END
      ) as score
    FROM "Restaurant" r
    LEFT JOIN "Booking" b ON b."restaurantId" = r.id AND b.status = 'COMPLETED'
    WHERE r."isDeleted" = false AND r."isOpen" = true
    GROUP BY r.id, r.name, r.cuisine, r.rating, r.price
  )
  SELECT 
    rs.id,
    rs.name,
    rs.cuisine,
    rs.rating,
    ROUND(rs.score::numeric, 2)::float,
    CASE 
      WHEN rs.cuisine = ANY((SELECT preferred_cuisines FROM user_preferences)) 
        THEN '❤️ Your favorite cuisine'
      WHEN rs.rating >= 4.5 THEN '⭐ Highly rated'
      WHEN rs.popularity > 50 THEN '🔥 Popular choice'
      WHEN NOT EXISTS (
        SELECT 1 FROM "Booking" b 
        WHERE b."userId" = user_id_param AND b."restaurantId" = rs.id
      ) THEN '✨ New for you'
      ELSE '👍 Recommended'
    END
  FROM restaurant_scores rs
  ORDER BY rs.score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_restaurant_recommendations IS 'AI-powered restaurant recommendations based on user history';

-- ===================================
-- 4. DYNAMIC PRICING CALCULATOR
-- ===================================

CREATE OR REPLACE FUNCTION calculate_dynamic_price(
  restaurant_id_param INT,
  date_param TEXT,
  time_param TEXT,
  base_price FLOAT
)
RETURNS JSON AS $$
DECLARE
  booking_count INT;
  capacity INT;
  occupancy_rate FLOAT;
  surge_multiplier FLOAT;
  final_price FLOAT;
  demand_level TEXT;
BEGIN
  -- Get restaurant capacity
  SELECT r.capacity INTO capacity
  FROM "Restaurant" r
  WHERE r.id = restaurant_id_param;
  
  -- Get current bookings for this slot
  SELECT COALESCE(SUM(b.guests), 0) INTO booking_count
  FROM "Booking" b
  WHERE b."restaurantId" = restaurant_id_param
    AND b.date = date_param
    AND b.time = time_param
    AND b.status IN ('CONFIRMED', 'SEATED');
  
  -- Calculate occupancy rate
  occupancy_rate := booking_count::float / NULLIF(capacity, 0);
  
  -- Determine surge multiplier based on occupancy
  surge_multiplier := CASE 
    WHEN occupancy_rate >= 0.9 THEN 1.5  -- 50% surge (almost full)
    WHEN occupancy_rate >= 0.75 THEN 1.3 -- 30% surge (high demand)
    WHEN occupancy_rate >= 0.5 THEN 1.15 -- 15% surge (medium demand)
    WHEN occupancy_rate <= 0.2 THEN 0.85 -- 15% discount (low demand)
    ELSE 1.0                              -- No adjustment
  END;
  
  final_price := base_price * surge_multiplier;
  
  -- Determine demand level
  demand_level := CASE 
    WHEN occupancy_rate >= 0.75 THEN 'HIGH'
    WHEN occupancy_rate >= 0.5 THEN 'MEDIUM'
    ELSE 'LOW'
  END;
  
  RETURN json_build_object(
    'restaurantId', restaurant_id_param,
    'date', date_param,
    'time', time_param,
    'basePrice', ROUND(base_price::numeric, 2),
    'surgeMultiplier', surge_multiplier,
    'finalPrice', ROUND(final_price::numeric, 2),
    'discount', CASE WHEN surge_multiplier < 1.0 THEN ROUND((1.0 - surge_multiplier) * 100) ELSE 0 END,
    'surcharge', CASE WHEN surge_multiplier > 1.0 THEN ROUND((surge_multiplier - 1.0) * 100) ELSE 0 END,
    'bookedSeats', booking_count,
    'totalCapacity', capacity,
    'availableSeats', capacity - booking_count,
    'occupancyRate', ROUND((occupancy_rate * 100)::numeric, 2),
    'demandLevel', demand_level
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_dynamic_price IS 'Calculates dynamic pricing based on real-time demand';

-- ===================================
-- 5. USER LIFETIME VALUE (LTV)
-- ===================================

CREATE OR REPLACE FUNCTION calculate_user_ltv(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'userId', user_id_param,
    'userName', u.name,
    'totalBookings', COUNT(DISTINCT b.id),
    'completedBookings', COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END),
    'totalSpent', COALESCE(SUM(p."totalAmount"), 0),
    'averageOrderValue', COALESCE(AVG(p."totalAmount"), 0),
    'rewardPointsEarned', COALESCE(u."rewardPoints", 0),
    'favoriteRestaurant', (
      SELECT r.name
      FROM "Booking" b2
      JOIN "Restaurant" r ON r.id = b2."restaurantId"
      WHERE b2."userId" = user_id_param
      GROUP BY r.id, r.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    'visitFrequency', CASE 
      WHEN COUNT(DISTINCT b.id) >= 10 THEN 'Frequent'
      WHEN COUNT(DISTINCT b.id) >= 5 THEN 'Regular'
      WHEN COUNT(DISTINCT b.id) >= 2 THEN 'Occasional'
      ELSE 'New'
    END,
    'customerSegment', CASE 
      WHEN COALESCE(SUM(p."totalAmount"), 0) >= 10000 THEN 'Premium'
      WHEN COALESCE(SUM(p."totalAmount"), 0) >= 5000 THEN 'High Value'
      WHEN COALESCE(SUM(p."totalAmount"), 0) >= 2000 THEN 'Medium Value'
      ELSE 'Starter'
    END,
    'daysSinceFirstBooking', EXTRACT(DAY FROM NOW() - MIN(b."createdAt")),
    'daysSinceLastBooking', EXTRACT(DAY FROM NOW() - MAX(b."createdAt")),
    'churnRisk', CASE 
      WHEN EXTRACT(DAY FROM NOW() - MAX(b."createdAt")) > 90 THEN 'High'
      WHEN EXTRACT(DAY FROM NOW() - MAX(b."createdAt")) > 30 THEN 'Medium'
      ELSE 'Low'
    END
  ) INTO result
  FROM "User" u
  LEFT JOIN "Booking" b ON b."userId" = u.id
  LEFT JOIN "Payment" p ON p."bookingId" = b.id
  WHERE u.id = user_id_param
  GROUP BY u.id, u.name, u."rewardPoints";
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_user_ltv IS 'Calculates user lifetime value and customer segment';

-- ===================================
-- 6. MATERIALIZED VIEW: RESTAURANT LEADERBOARD
-- ===================================

CREATE MATERIALIZED VIEW IF NOT EXISTS restaurant_leaderboard AS
SELECT 
  r.id,
  r.name,
  r.cuisine,
  r.rating,
  r.price,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END) as completed_bookings,
  COALESCE(SUM(p."totalAmount"), 0) as total_revenue,
  COALESCE(AVG(p."totalAmount"), 0) as avg_order_value,
  COALESCE(AVG(rev.rating), 0) as avg_review_rating,
  COUNT(DISTINCT rev.id) as review_count,
  COUNT(DISTINCT b."userId") as unique_customers,
  ROUND(
    (
      -- Revenue weight (40%)
      (LEAST(COALESCE(SUM(p."totalAmount"), 0) / 100000, 1) * 40) +
      -- Rating weight (30%)
      ((r.rating / 5) * 30) +
      -- Popularity weight (20%)
      (LEAST(COUNT(DISTINCT b.id) / 100.0, 1) * 20) +
      -- Reviews weight (10%)
      (LEAST(COUNT(DISTINCT rev.id) / 50.0, 1) * 10)
    )::numeric,
    2
  ) as leaderboard_score
FROM "Restaurant" r
LEFT JOIN "Booking" b ON b."restaurantId" = r.id AND b.status = 'COMPLETED'
LEFT JOIN "Payment" p ON p."bookingId" = b.id
LEFT JOIN "Review" rev ON rev."restaurantId" = r.id
WHERE r."isDeleted" = false
GROUP BY r.id, r.name, r.cuisine, r.rating, r.price
ORDER BY leaderboard_score DESC;

CREATE INDEX IF NOT EXISTS idx_restaurant_leaderboard_score 
ON restaurant_leaderboard(leaderboard_score DESC);

COMMENT ON MATERIALIZED VIEW restaurant_leaderboard IS 'Pre-computed restaurant rankings for fast queries';

-- ===================================
-- 7. SCHEDULE MATERIALIZED VIEW REFRESH
-- ===================================

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily refresh at 4 AM
SELECT cron.schedule(
  'refresh-restaurant-leaderboard',
  '0 4 * * *',
  'REFRESH MATERIALIZED VIEW restaurant_leaderboard;'
);

-- ===================================
-- 8. DAILY ANALYTICS COMPUTATION
-- ===================================

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

-- ===================================
-- 9. QUERY PERFORMANCE MONITORING
-- ===================================

-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create view for slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(max_exec_time::numeric, 2) as max_time_ms,
  ROUND((100 * total_exec_time / SUM(total_exec_time) OVER ())::numeric, 2) AS percentage
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- Queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ===================================
-- 10. VIEW ALL SCHEDULED JOBS
-- ===================================

-- View all cron jobs
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
ORDER BY jobid;

-- View recent job runs
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- ===================================
-- USAGE EXAMPLES
-- ===================================

-- Example 1: Get restaurant analytics
-- SELECT calculate_restaurant_analytics(1);

-- Example 2: Check seat availability
-- SELECT get_available_seats(1, '2026-10-15', '19:00');

-- Example 3: Get recommendations for user
-- SELECT * FROM get_restaurant_recommendations('user-uuid-here');

-- Example 4: Calculate dynamic pricing
-- SELECT calculate_dynamic_price(1, '2026-10-15', '20:00', 500.00);

-- Example 5: Get user lifetime value
-- SELECT calculate_user_ltv('user-uuid-here');

-- Example 6: View restaurant leaderboard
-- SELECT * FROM restaurant_leaderboard LIMIT 10;

-- Example 7: View slow queries
-- SELECT * FROM slow_queries;

-- Example 8: Manual refresh of leaderboard
-- REFRESH MATERIALIZED VIEW restaurant_leaderboard;
