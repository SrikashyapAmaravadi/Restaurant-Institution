# 🖥️ Supabase Compute - Complete Guide

## What is Supabase Compute?

**Supabase Compute** refers to the computational resources allocated to your Supabase project, including:

1. **Database Compute** - PostgreSQL database instance resources
2. **Edge Functions Compute** - Serverless function execution resources
3. **Realtime Compute** - WebSocket connections and broadcast resources
4. **Storage Compute** - File storage processing

---

## 🎯 Key Difference: Edge Functions vs Compute

| Feature | Edge Functions | Compute Add-ons |
|---------|---------------|-----------------|
| **Purpose** | Serverless code execution | Dedicated computational tasks |
| **Runtime** | Deno runtime (JavaScript/TypeScript) | Python, ML models, heavy processing |
| **Use Case** | API endpoints, webhooks, cron jobs | Data analysis, ML inference, batch jobs |
| **Pricing** | Pay per invocation | Reserved capacity |
| **Cold Start** | Yes (~50-200ms) | Minimal (always warm) |

---

## 📊 Your Current Compute Usage

### Database Compute (PostgreSQL)

Your project uses: **Shared-CPU-2X** (Free tier)

View settings: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/addons

**Current Specs:**
- **CPU**: Shared (burstable)
- **RAM**: 1 GB
- **Connections**: 200 max
- **Storage**: 8 GB included
- **Backups**: Daily (7 days retention)

### Upgrade Options:

| Tier | CPU | RAM | Connections | Price |
|------|-----|-----|-------------|-------|
| Starter (Free) | Shared | 1 GB | 200 | $0/month |
| Small | 2 vCPU | 4 GB | 400 | ~$25/month |
| Medium | 4 vCPU | 8 GB | 800 | ~$100/month |
| Large | 8 vCPU | 16 GB | 1600 | ~$200/month |
| XL | 16 vCPU | 32 GB | 3200 | ~$400/month |

---

## 🚀 Compute Features You Can Use

### 1. **Database Functions (SQL Functions)**

PostgreSQL compute for complex calculations inside the database.

#### Example: Calculate Restaurant Analytics

```sql
-- Create a compute-intensive function
CREATE OR REPLACE FUNCTION calculate_restaurant_analytics(restaurant_id_param INT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'restaurantId', restaurant_id_param,
    'totalBookings', COUNT(DISTINCT b.id),
    'totalRevenue', COALESCE(SUM(p."totalAmount"), 0),
    'averageRating', COALESCE(AVG(r.rating), 0),
    'popularDishes', (
      SELECT json_agg(json_build_object('name', bo.name, 'orders', COUNT(*)))
      FROM "BookingOrder" bo
      JOIN "Booking" b2 ON b2.id = bo."bookingId"
      WHERE b2."restaurantId" = restaurant_id_param
      GROUP BY bo.name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    ),
    'peakHours', (
      SELECT json_agg(json_build_object('hour', EXTRACT(HOUR FROM b3."createdAt"), 'bookings', COUNT(*)))
      FROM "Booking" b3
      WHERE b3."restaurantId" = restaurant_id_param
      GROUP BY EXTRACT(HOUR FROM b3."createdAt")
      ORDER BY COUNT(*) DESC
      LIMIT 3
    ),
    'customerRetention', (
      SELECT ROUND(
        COUNT(DISTINCT CASE WHEN booking_count > 1 THEN user_id END)::numeric / 
        NULLIF(COUNT(DISTINCT user_id), 0) * 100, 
        2
      )
      FROM (
        SELECT "userId" as user_id, COUNT(*) as booking_count
        FROM "Booking"
        WHERE "restaurantId" = restaurant_id_param AND "userId" IS NOT NULL
        GROUP BY "userId"
      ) retention_data
    )
  ) INTO result
  FROM "Booking" b
  LEFT JOIN "Payment" p ON p."bookingId" = b.id
  LEFT JOIN "Review" r ON r."restaurantId" = restaurant_id_param
  WHERE b."restaurantId" = restaurant_id_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Use it
SELECT calculate_restaurant_analytics(1);
```

### 2. **pg_cron - Scheduled Database Jobs**

Run compute tasks directly in PostgreSQL on a schedule.

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a daily analytics computation
SELECT cron.schedule(
  'daily-analytics-computation',
  '0 3 * * *', -- Daily at 3 AM
  $$
  INSERT INTO "AuditLog" (
    action, 
    "entityType", 
    "detailsJson"
  )
  SELECT 
    'DAILY_ANALYTICS',
    'SYSTEM',
    json_build_object(
      'date', CURRENT_DATE,
      'totalBookings', COUNT(*),
      'totalRevenue', SUM(p."totalAmount"),
      'activeRestaurants', COUNT(DISTINCT b."restaurantId")
    )::text
  FROM "Booking" b
  LEFT JOIN "Payment" p ON p."bookingId" = b.id
  WHERE b."createdAt" >= CURRENT_DATE - INTERVAL '1 day';
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### 3. **PostGIS - Geospatial Compute**

Calculate distances, find nearby restaurants using database compute.

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to Restaurant table
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS location GEOMETRY(Point, 4326);

-- Update locations based on lat/lng
UPDATE "Restaurant"
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Create spatial index for fast queries
CREATE INDEX IF NOT EXISTS idx_restaurant_location ON "Restaurant" USING GIST (location);

-- Function: Find nearby restaurants
CREATE OR REPLACE FUNCTION find_nearby_restaurants(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT DEFAULT 5
)
RETURNS TABLE (
  id INT,
  name TEXT,
  distance_km FLOAT,
  lat FLOAT,
  lng FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    ROUND(
      ST_Distance(
        location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      )::numeric / 1000, 
      2
    )::float as distance_km,
    r.lat,
    r.lng
  FROM "Restaurant" r
  WHERE r.location IS NOT NULL
    AND r."isDeleted" = false
    AND r."isOpen" = true
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY location <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326);
END;
$$ LANGUAGE plpgsql;

-- Use it: Find restaurants within 5km of Bennett University
SELECT * FROM find_nearby_restaurants(28.4509, 77.5847, 5);
```

### 4. **pg_stat_statements - Query Performance Analytics**

Monitor and optimize compute-intensive queries.

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slowest queries
SELECT 
  query,
  calls,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(max_exec_time::numeric, 2) as max_time_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Reset statistics
SELECT pg_stat_statements_reset();
```

### 5. **Materialized Views - Pre-computed Results**

Store compute results for fast queries.

```sql
-- Create materialized view for restaurant leaderboard
CREATE MATERIALIZED VIEW restaurant_leaderboard AS
SELECT 
  r.id,
  r.name,
  r.rating,
  COUNT(DISTINCT b.id) as total_bookings,
  COALESCE(SUM(p."totalAmount"), 0) as total_revenue,
  COALESCE(AVG(rev.rating), 0) as avg_review_rating,
  COUNT(DISTINCT rev.id) as review_count,
  COUNT(DISTINCT b."userId") as unique_customers
FROM "Restaurant" r
LEFT JOIN "Booking" b ON b."restaurantId" = r.id AND b.status = 'COMPLETED'
LEFT JOIN "Payment" p ON p."bookingId" = b.id
LEFT JOIN "Review" rev ON rev."restaurantId" = r.id
WHERE r."isDeleted" = false
GROUP BY r.id, r.name, r.rating
ORDER BY total_revenue DESC;

-- Create index on materialized view
CREATE INDEX idx_restaurant_leaderboard_revenue ON restaurant_leaderboard(total_revenue DESC);

-- Refresh materialized view (run daily via pg_cron)
REFRESH MATERIALIZED VIEW restaurant_leaderboard;

-- Schedule auto-refresh
SELECT cron.schedule(
  'refresh-restaurant-leaderboard',
  '0 4 * * *', -- Daily at 4 AM
  'REFRESH MATERIALIZED VIEW restaurant_leaderboard;'
);

-- Query the materialized view (super fast!)
SELECT * FROM restaurant_leaderboard LIMIT 10;
```

---

## 🔥 Advanced Compute Use Cases for Your Project

### 1. **Real-time Seat Availability Computation**

```sql
-- Function to check real-time seat availability
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
    'date', date_param,
    'time', time_param,
    'totalCapacity', r.capacity,
    'bookedSeats', COALESCE(SUM(b.guests), 0),
    'availableSeats', r.capacity - COALESCE(SUM(b.guests), 0),
    'bookings', json_agg(
      json_build_object(
        'id', b.id,
        'guests', b.guests,
        'status', b.status
      )
    )
  ) INTO result
  FROM "Restaurant" r
  LEFT JOIN "Booking" b ON b."restaurantId" = r.id 
    AND b.date = date_param 
    AND b.time = time_param
    AND b.status IN ('CONFIRMED', 'SEATED')
  WHERE r.id = restaurant_id_param
  GROUP BY r.id, r.capacity;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Use it
SELECT get_available_seats(1, '2026-10-15', '19:00');
```

### 2. **Smart Recommendation Engine**

```sql
-- Compute personalized restaurant recommendations
CREATE OR REPLACE FUNCTION get_restaurant_recommendations(user_id_param TEXT)
RETURNS TABLE (
  restaurant_id INT,
  restaurant_name TEXT,
  recommendation_score FLOAT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    -- Learn from user's past bookings
    SELECT 
      ARRAY_AGG(DISTINCT r.cuisine) as preferred_cuisines,
      AVG(p."totalAmount") as avg_spend
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
      COUNT(b.id) as popularity,
      -- Score calculation
      (
        CASE WHEN r.cuisine = ANY((SELECT preferred_cuisines FROM user_preferences)) THEN 50 ELSE 0 END +
        (r.rating * 10) +
        (COUNT(b.id) * 0.1)
      ) as score
    FROM "Restaurant" r
    LEFT JOIN "Booking" b ON b."restaurantId" = r.id AND b.status = 'COMPLETED'
    WHERE r."isDeleted" = false AND r."isOpen" = true
    GROUP BY r.id, r.name, r.cuisine, r.rating, r.price
  )
  SELECT 
    rs.id,
    rs.name,
    ROUND(rs.score::numeric, 2)::float,
    CASE 
      WHEN rs.cuisine = ANY((SELECT preferred_cuisines FROM user_preferences)) 
      THEN 'Based on your favorite cuisine'
      WHEN rs.rating >= 4.5 THEN 'Highly rated by others'
      WHEN rs.popularity > 50 THEN 'Popular choice'
      ELSE 'New for you'
    END
  FROM restaurant_scores rs
  ORDER BY rs.score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Use it
SELECT * FROM get_restaurant_recommendations('user-uuid-here');
```

### 3. **Dynamic Pricing Calculator**

```sql
-- Compute dynamic pricing based on demand
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
BEGIN
  -- Get capacity
  SELECT r.capacity INTO capacity
  FROM "Restaurant" r
  WHERE r.id = restaurant_id_param;
  
  -- Get current bookings
  SELECT COUNT(*) INTO booking_count
  FROM "Booking" b
  WHERE b."restaurantId" = restaurant_id_param
    AND b.date = date_param
    AND b.time = time_param
    AND b.status IN ('CONFIRMED', 'SEATED');
  
  -- Calculate occupancy
  occupancy_rate := booking_count::float / NULLIF(capacity, 0);
  
  -- Determine surge multiplier
  surge_multiplier := CASE 
    WHEN occupancy_rate >= 0.9 THEN 1.5  -- 50% surge
    WHEN occupancy_rate >= 0.75 THEN 1.3 -- 30% surge
    WHEN occupancy_rate >= 0.5 THEN 1.15 -- 15% surge
    ELSE 1.0                              -- No surge
  END;
  
  final_price := base_price * surge_multiplier;
  
  RETURN json_build_object(
    'basePrice', base_price,
    'surgeMultiplier', surge_multiplier,
    'finalPrice', ROUND(final_price::numeric, 2),
    'occupancyRate', ROUND((occupancy_rate * 100)::numeric, 2),
    'demand', CASE 
      WHEN occupancy_rate >= 0.75 THEN 'HIGH'
      WHEN occupancy_rate >= 0.5 THEN 'MEDIUM'
      ELSE 'LOW'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Use it
SELECT calculate_dynamic_price(1, '2026-10-15', '20:00', 500.00);
```

---

## 📈 Monitoring Compute Usage

### View Database CPU & Memory

```sql
-- Current connections
SELECT COUNT(*) as active_connections FROM pg_stat_activity;

-- Database size
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active queries
SELECT 
  pid,
  usename,
  application_name,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

### Dashboard Monitoring

https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/reports

Track:
- CPU usage
- Memory usage
- Disk I/O
- Active connections
- Query performance

---

## 💡 When to Upgrade Compute

### Signs You Need More Compute:

1. **Database connections maxed out** (200/200)
2. **Slow query performance** (>1 second average)
3. **CPU usage consistently >80%**
4. **Memory pressure warnings**
5. **Connection timeout errors**

### Your Current Needs:

**Free Tier is sufficient if:**
- ✅ <100 concurrent users
- ✅ <500 bookings per day
- ✅ <1,000 total users
- ✅ Simple queries (<100ms)

**Upgrade to Small ($25/mo) when:**
- 100-500 concurrent users
- 500-2,000 bookings per day
- 1,000-10,000 total users
- Complex analytics queries

---

## ✅ Quick Implementation Checklist

**Database Functions:**
- [ ] Create `calculate_restaurant_analytics()` function
- [ ] Create `find_nearby_restaurants()` function (if using maps)
- [ ] Create `get_available_seats()` function
- [ ] Create `get_restaurant_recommendations()` function

**Scheduled Jobs (pg_cron):**
- [ ] Daily analytics computation
- [ ] Refresh materialized views
- [ ] Cleanup old data

**Performance:**
- [ ] Enable `pg_stat_statements`
- [ ] Create materialized views
- [ ] Add spatial indexes (if using PostGIS)
- [ ] Monitor slow queries

**Monitoring:**
- [ ] Set up database alerts
- [ ] Track connection pool usage
- [ ] Monitor query performance
- [ ] Check disk space regularly

---

## 🚀 Next Steps

1. **Run the SQL functions** - Copy and paste into Supabase SQL Editor
2. **Schedule pg_cron jobs** - Automate daily tasks
3. **Monitor performance** - Check Reports dashboard weekly
4. **Optimize queries** - Use `pg_stat_statements` to find slow queries

---

## 📚 Resources

- **Database Functions**: https://supabase.com/docs/guides/database/functions
- **pg_cron**: https://github.com/citusdata/pg_cron
- **PostGIS**: https://postgis.net/documentation/
- **Performance**: https://supabase.com/docs/guides/database/query-performance

---

**Your current setup (Free tier) is perfect for getting started!** Upgrade when you see performance metrics indicating the need. 📊
