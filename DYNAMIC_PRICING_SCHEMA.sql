-- ============================================
-- Dynamic Pricing & Demand Prediction Schema
-- ML-powered pricing and forecasting tables
-- ============================================

-- Create PricingRule table for dynamic pricing configuration
CREATE TABLE IF NOT EXISTS "PricingRule" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "restaurantId" INT REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- DEMAND_BASED | TIME_BASED | DAY_BASED | EVENT_BASED | WEATHER_BASED
  condition TEXT NOT NULL, -- JSON condition e.g. {"occupancyRate": ">= 0.8"}
  multiplier FLOAT NOT NULL, -- e.g. 1.3 for 30% increase
  priority INT DEFAULT 0, -- Higher priority rules applied first
  "isActive" BOOLEAN DEFAULT true,
  "validFrom" TIMESTAMP,
  "validUntil" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_pricingrule_restaurantId" ON "PricingRule"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_pricingrule_type" ON "PricingRule"(type);
CREATE INDEX IF NOT EXISTS "idx_pricingrule_isActive" ON "PricingRule"("isActive");

-- Create PricingHistory table to track pricing decisions
CREATE TABLE IF NOT EXISTS "PricingHistory" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "restaurantId" INT NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  "bookingId" TEXT REFERENCES "Booking"(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  "basePrice" FLOAT NOT NULL,
  "finalPrice" FLOAT NOT NULL,
  "priceMultiplier" FLOAT NOT NULL,
  strategy TEXT NOT NULL, -- SURGE_HIGH | SURGE_MEDIUM | STANDARD | DISCOUNT_LOW | DISCOUNT_HIGH
  "factorsJson" TEXT, -- JSON with all pricing factors
  "occupancyRate" FLOAT,
  "demandLevel" TEXT, -- LOW | MEDIUM | HIGH | VERY_HIGH
  "wasBooked" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_pricinghistory_restaurantId" ON "PricingHistory"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_pricinghistory_date" ON "PricingHistory"(date);
CREATE INDEX IF NOT EXISTS "idx_pricinghistory_strategy" ON "PricingHistory"(strategy);
CREATE INDEX IF NOT EXISTS "idx_pricinghistory_createdAt" ON "PricingHistory"("createdAt");

-- Create DemandForecast table for ML predictions
CREATE TABLE IF NOT EXISTS "DemandForecast" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "restaurantId" INT NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  "forecastDate" DATE NOT NULL,
  "forecastHour" INT, -- NULL for daily forecast, 0-23 for hourly
  "predictedBookings" INT NOT NULL,
  "predictedRevenue" FLOAT,
  confidence FLOAT, -- 0.0 to 1.0
  "demandLevel" TEXT NOT NULL, -- LOW | MEDIUM | HIGH | VERY_HIGH
  "recommendationsJson" TEXT, -- JSON array of recommended actions
  "actualBookings" INT, -- Filled after the day passes
  "actualRevenue" FLOAT, -- Filled after the day passes
  accuracy FLOAT, -- Calculated after actual data available
  "generatedAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("restaurantId", "forecastDate", "forecastHour")
);

CREATE INDEX IF NOT EXISTS "idx_demandforecast_restaurantId" ON "DemandForecast"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_demandforecast_date" ON "DemandForecast"("forecastDate");
CREATE INDEX IF NOT EXISTS "idx_demandforecast_demandLevel" ON "DemandForecast"("demandLevel");

-- Create WeatherData table (for weather-based pricing)
CREATE TABLE IF NOT EXISTS "WeatherData" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  location TEXT NOT NULL, -- City name or coordinates
  date DATE NOT NULL,
  condition TEXT, -- SUNNY | RAINY | CLOUDY | STORMY | SNOWY
  temperature FLOAT,
  precipitation FLOAT, -- mm
  "weatherScore" FLOAT, -- 0-100, higher = better for dining out
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE(location, date)
);

CREATE INDEX IF NOT EXISTS "idx_weatherdata_location_date" ON "WeatherData"(location, date);

-- Create EventCalendar table (for event-based pricing)
CREATE TABLE IF NOT EXISTS "EventCalendar" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  category TEXT, -- CONCERT | SPORTS | FESTIVAL | CONFERENCE | HOLIDAY
  "expectedAttendees" INT,
  "impactRadius" FLOAT, -- km radius of impact
  "demandImpact" TEXT DEFAULT 'MEDIUM', -- LOW | MEDIUM | HIGH | VERY_HIGH
  "pricingMultiplier" FLOAT DEFAULT 1.0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_eventcalendar_dates" ON "EventCalendar"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "idx_eventcalendar_location" ON "EventCalendar"(location);

-- Add dynamic pricing fields to Restaurant table
ALTER TABLE "Restaurant"
ADD COLUMN IF NOT EXISTS "dynamicPricingEnabled" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "basePricePerPerson" FLOAT DEFAULT 500,
ADD COLUMN IF NOT EXISTS "minPrice" FLOAT DEFAULT 300,
ADD COLUMN IF NOT EXISTS "maxPrice" FLOAT DEFAULT 1500,
ADD COLUMN IF NOT EXISTS "surgeThreshold" FLOAT DEFAULT 0.75, -- Occupancy rate to trigger surge
ADD COLUMN IF NOT EXISTS "discountThreshold" FLOAT DEFAULT 0.25; -- Occupancy rate to trigger discount

-- Create function to calculate optimal price
CREATE OR REPLACE FUNCTION calculate_optimal_price(
  restaurant_id_param INT,
  date_param DATE,
  time_param TEXT,
  seats_param INT DEFAULT 2
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  base_price FLOAT;
  final_price FLOAT;
  occupancy_rate FLOAT;
  demand_level TEXT;
BEGIN
  -- Get restaurant pricing config
  SELECT "basePricePerPerson" INTO base_price
  FROM "Restaurant"
  WHERE id = restaurant_id_param;
  
  -- Calculate current occupancy
  SELECT 
    COALESCE(SUM(b.guests), 0)::FLOAT / r.capacity
  INTO occupancy_rate
  FROM "Restaurant" r
  LEFT JOIN "Booking" b ON b."restaurantId" = r.id 
    AND b.date = date_param::TEXT 
    AND b.time = time_param
    AND b.status IN ('CONFIRMED', 'SEATED')
  WHERE r.id = restaurant_id_param
  GROUP BY r.capacity;
  
  -- Apply dynamic pricing logic
  final_price := CASE
    WHEN occupancy_rate >= 0.9 THEN base_price * 1.5
    WHEN occupancy_rate >= 0.75 THEN base_price * 1.3
    WHEN occupancy_rate >= 0.5 THEN base_price * 1.1
    WHEN occupancy_rate <= 0.2 THEN base_price * 0.8
    ELSE base_price
  END;
  
  demand_level := CASE
    WHEN occupancy_rate >= 0.75 THEN 'HIGH'
    WHEN occupancy_rate >= 0.5 THEN 'MEDIUM'
    ELSE 'LOW'
  END;
  
  result := json_build_object(
    'basePrice', base_price * seats_param,
    'finalPrice', ROUND(final_price * seats_param),
    'occupancyRate', ROUND((occupancy_rate * 100)::numeric, 1),
    'demandLevel', demand_level,
    'savings', CASE WHEN final_price < base_price 
                    THEN ROUND((base_price - final_price) * seats_param)
                    ELSE 0 END,
    'surge', CASE WHEN final_price > base_price 
                  THEN ROUND((final_price - base_price) * seats_param)
                  ELSE 0 END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_optimal_price IS 'Calculates optimal price based on real-time demand';

-- Create function to get demand forecast
CREATE OR REPLACE FUNCTION get_demand_forecast(
  restaurant_id_param INT,
  days_ahead INT DEFAULT 7
)
RETURNS TABLE (
  "forecastDate" DATE,
  day_of_week TEXT,
  "predictedBookings" INT,
  "demandLevel" TEXT,
  confidence FLOAT,
  "recommendedPrice" FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    df."forecastDate",
    TO_CHAR(df."forecastDate", 'Day') as day_of_week,
    df."predictedBookings",
    df."demandLevel",
    df.confidence,
    CASE 
      WHEN df."demandLevel" = 'VERY_HIGH' THEN r."basePricePerPerson" * 1.4
      WHEN df."demandLevel" = 'HIGH' THEN r."basePricePerPerson" * 1.2
      WHEN df."demandLevel" = 'MEDIUM' THEN r."basePricePerPerson"
      ELSE r."basePricePerPerson" * 0.85
    END as "recommendedPrice"
  FROM "DemandForecast" df
  JOIN "Restaurant" r ON r.id = df."restaurantId"
  WHERE df."restaurantId" = restaurant_id_param
    AND df."forecastDate" >= CURRENT_DATE
    AND df."forecastDate" <= CURRENT_DATE + days_ahead
    AND df."forecastHour" IS NULL
  ORDER BY df."forecastDate";
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_demand_forecast IS 'Retrieves demand forecast for upcoming days';

-- Create materialized view for pricing analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS pricing_analytics AS
SELECT 
  r.id as "restaurantId",
  r.name as "restaurantName",
  DATE_TRUNC('day', ph."createdAt") as date,
  COUNT(DISTINCT ph.id) as "pricingChecks",
  AVG(ph."finalPrice") as "avgFinalPrice",
  AVG(ph."basePrice") as "avgBasePrice",
  AVG(ph."priceMultiplier") as "avgMultiplier",
  AVG(ph."occupancyRate") as "avgOccupancy",
  COUNT(CASE WHEN ph."wasBooked" THEN 1 END) as "successfulBookings",
  ROUND(
    (COUNT(CASE WHEN ph."wasBooked" THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100)::numeric, 
    2
  ) as "conversionRate",
  COUNT(CASE WHEN ph.strategy LIKE 'SURGE%' THEN 1 END) as "surgeCount",
  COUNT(CASE WHEN ph.strategy LIKE 'DISCOUNT%' THEN 1 END) as "discountCount"
FROM "PricingHistory" ph
JOIN "Restaurant" r ON r.id = ph."restaurantId"
WHERE ph."createdAt" >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY r.id, r.name, DATE_TRUNC('day', ph."createdAt")
ORDER BY date DESC;

CREATE INDEX IF NOT EXISTS idx_pricing_analytics_date ON pricing_analytics(date DESC);

-- Schedule pricing analytics refresh
SELECT cron.schedule(
  'refresh-pricing-analytics',
  '0 5 * * *', -- Daily at 5 AM
  'REFRESH MATERIALIZED VIEW pricing_analytics;'
);

-- Schedule demand forecast accuracy calculation
SELECT cron.schedule(
  'calculate-forecast-accuracy',
  '0 6 * * *', -- Daily at 6 AM
  $$
  UPDATE "DemandForecast" df
  SET 
    "actualBookings" = (
      SELECT COUNT(*)
      FROM "Booking" b
      WHERE b."restaurantId" = df."restaurantId"
        AND b.date = df."forecastDate"::TEXT
        AND b.status IN ('CONFIRMED', 'COMPLETED', 'SEATED')
    ),
    accuracy = CASE 
      WHEN "predictedBookings" > 0 THEN
        1.0 - (ABS("predictedBookings" - (
          SELECT COUNT(*)
          FROM "Booking" b
          WHERE b."restaurantId" = df."restaurantId"
            AND b.date = df."forecastDate"::TEXT
            AND b.status IN ('CONFIRMED', 'COMPLETED', 'SEATED')
        ))::FLOAT / "predictedBookings")
      ELSE 0
    END,
    "updatedAt" = NOW()
  WHERE df."forecastDate" = CURRENT_DATE - INTERVAL '1 day'
    AND df."actualBookings" IS NULL;
  $$
);

-- Insert sample pricing rules (only if restaurants exist)
DO $$
DECLARE
  first_restaurant_id INT;
BEGIN
  -- Get the first restaurant ID
  SELECT id INTO first_restaurant_id FROM "Restaurant" LIMIT 1;
  
  -- Only insert if restaurant exists
  IF first_restaurant_id IS NOT NULL THEN
    INSERT INTO "PricingRule" ("restaurantId", name, type, condition, multiplier, priority) VALUES
    (first_restaurant_id, 'High Demand Surge', 'DEMAND_BASED', '{"occupancyRate": ">= 0.8"}', 1.4, 10),
    (first_restaurant_id, 'Peak Hours Premium', 'TIME_BASED', '{"hours": [19, 20, 21]}', 1.2, 8),
    (first_restaurant_id, 'Weekend Boost', 'DAY_BASED', '{"days": [0, 6]}', 1.25, 7),
    (first_restaurant_id, 'Off-Peak Discount', 'DEMAND_BASED', '{"occupancyRate": "<= 0.25"}', 0.80, 5)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample pricing rules created for restaurant ID: %', first_restaurant_id;
  ELSE
    RAISE NOTICE 'No restaurants found. Skipping sample pricing rules.';
  END IF;
END $$;

-- Insert sample events
INSERT INTO "EventCalendar" (name, location, "startDate", "endDate", category, "demandImpact", "pricingMultiplier") VALUES
('Bennett University Annual Fest', 'Greater Noida', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 'FESTIVAL', 'VERY_HIGH', 1.5),
('Tech Conference', 'Noida', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 'CONFERENCE', 'HIGH', 1.3)
ON CONFLICT DO NOTHING;

-- View pricing effectiveness
CREATE OR REPLACE VIEW pricing_effectiveness AS
SELECT 
  strategy,
  COUNT(*) as occurrences,
  AVG("priceMultiplier") as "avgMultiplier",
  COUNT(CASE WHEN "wasBooked" THEN 1 END) as bookings,
  ROUND(
    (COUNT(CASE WHEN "wasBooked" THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100)::numeric,
    2
  ) as "conversionRate"
FROM "PricingHistory"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY strategy
ORDER BY bookings DESC;

-- Verify tables created
SELECT 
  'Dynamic Pricing Tables' as category,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_name IN ('PricingRule', 'PricingHistory', 'DemandForecast', 'WeatherData', 'EventCalendar');

COMMENT ON TABLE "PricingRule" IS 'Dynamic pricing rules configuration';
COMMENT ON TABLE "PricingHistory" IS 'Historical record of all pricing decisions';
COMMENT ON TABLE "DemandForecast" IS 'ML-generated demand predictions';
COMMENT ON TABLE "WeatherData" IS 'Weather data for weather-based pricing';
COMMENT ON TABLE "EventCalendar" IS 'Events that impact restaurant demand';
