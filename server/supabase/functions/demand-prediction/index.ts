// Supabase Edge Function: Demand Prediction
// ML-powered demand forecasting for restaurants

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionRequest {
  restaurantId: number
  forecastDays?: number // Number of days to forecast (default: 7)
  includeHourly?: boolean
}

interface DemandPrediction {
  date: string
  dayOfWeek: string
  predictedBookings: number
  confidence: number
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  recommendedActions: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const request: PredictionRequest = await req.json()
    const { restaurantId, forecastDays = 7, includeHourly = false } = request

    // Get restaurant data
    const { data: restaurant } = await supabaseClient
      .from('Restaurant')
      .select('name, capacity, rating, cuisine')
      .eq('id', restaurantId)
      .single()

    if (!restaurant) throw new Error('Restaurant not found')

    // Get historical booking data (last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: historicalBookings } = await supabaseClient
      .from('Booking')
      .select('date, time, guests, status, createdAt')
      .eq('restaurantId', restaurantId)
      .gte('createdAt', ninetyDaysAgo.toISOString())

    if (!historicalBookings || historicalBookings.length < 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Insufficient historical data for prediction (minimum 10 bookings required)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Analyze historical patterns
    const dayOfWeekStats: Record<number, number[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    }

    const timeSlotStats: Record<string, number> = {}

    historicalBookings.forEach(booking => {
      const bookingDate = new Date(booking.date)
      const dayOfWeek = bookingDate.getDay()
      
      // Track bookings by day of week
      dayOfWeekStats[dayOfWeek].push(booking.guests)
      
      // Track bookings by time slot
      const hour = parseInt(booking.time.split(':')[0])
      const timeSlot = `${hour}:00`
      timeSlotStats[timeSlot] = (timeSlotStats[timeSlot] || 0) + 1
    })

    // Calculate average bookings per day of week
    const avgBookingsByDay = Object.entries(dayOfWeekStats).map(([day, bookings]) => ({
      day: parseInt(day),
      avgBookings: bookings.length > 0 
        ? bookings.reduce((sum, guests) => sum + guests, 0) / bookings.length
        : 0,
      count: bookings.length
    }))

    // Calculate trend (growing, stable, declining)
    const recentBookings = historicalBookings.slice(-30).length // Last 30 bookings
    const olderBookings = historicalBookings.slice(0, 30).length // First 30 bookings
    const trendMultiplier = recentBookings > olderBookings 
      ? 1.1  // Growing trend
      : recentBookings < olderBookings 
      ? 0.9  // Declining trend
      : 1.0  // Stable

    // Generate predictions for next N days
    const predictions: DemandPrediction[] = []
    const today = new Date()

    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(today)
      forecastDate.setDate(today.getDate() + i)
      const dayOfWeek = forecastDate.getDay()
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
      
      // Base prediction from historical average
      const dayStats = avgBookingsByDay.find(d => d.day === dayOfWeek)
      let basePrediction = dayStats?.avgBookings || 0

      // Apply trend
      basePrediction *= trendMultiplier

      // Weekend boost
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        basePrediction *= 1.3
      }

      // Rating impact
      basePrediction *= (restaurant.rating / 4.5)

      // Round and ensure within capacity
      const predictedBookings = Math.min(
        Math.round(basePrediction),
        restaurant.capacity
      )

      // Calculate confidence based on historical data points
      const dataPoints = dayStats?.count || 0
      const confidence = Math.min(
        (dataPoints / 10) * 100, // 10+ data points = 100% confidence
        100
      )

      // Determine demand level
      const capacityUsage = predictedBookings / restaurant.capacity
      const demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' = 
        capacityUsage >= 0.8 ? 'VERY_HIGH' :
        capacityUsage >= 0.6 ? 'HIGH' :
        capacityUsage >= 0.3 ? 'MEDIUM' :
        'LOW'

      // Generate recommendations
      const recommendedActions: string[] = []
      
      if (demandLevel === 'VERY_HIGH') {
        recommendedActions.push('⚡ Enable surge pricing (+30-40%)')
        recommendedActions.push('📧 Send reminder to waitlist customers')
        recommendedActions.push('👥 Consider increasing table sharing')
      } else if (demandLevel === 'HIGH') {
        recommendedActions.push('📈 Enable moderate surge pricing (+15-25%)')
        recommendedActions.push('🎯 Focus marketing on premium menu items')
      } else if (demandLevel === 'MEDIUM') {
        recommendedActions.push('✅ Standard pricing recommended')
        recommendedActions.push('📱 Light promotional push to fill remaining slots')
      } else {
        recommendedActions.push('💰 Enable discounts (-15-20%)')
        recommendedActions.push('📢 Launch targeted marketing campaign')
        recommendedActions.push('🎁 Offer combo deals and group packages')
      }

      // Special day considerations
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday/Saturday
        recommendedActions.push('🎉 Weekend special offers ready')
      }

      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        dayOfWeek: dayName,
        predictedBookings,
        confidence: Math.round(confidence),
        demandLevel,
        recommendedActions
      })
    }

    // Calculate hourly predictions if requested
    let hourlyPredictions = null
    if (includeHourly) {
      hourlyPredictions = Object.entries(timeSlotStats)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([time, count]) => ({
          time,
          predictedBookings: Math.round(count / 7), // Average per week
          demandLevel: count > 30 ? 'HIGH' : count > 15 ? 'MEDIUM' : 'LOW'
        }))
    }

    // Calculate overall metrics
    const totalPredictedBookings = predictions.reduce((sum, p) => sum + p.predictedBookings, 0)
    const avgDailyPrediction = Math.round(totalPredictedBookings / forecastDays)
    const peakDay = predictions.reduce((max, p) => 
      p.predictedBookings > max.predictedBookings ? p : max
    )
    const lowDay = predictions.reduce((min, p) => 
      p.predictedBookings < min.predictedBookings ? p : min
    )

    // Log prediction for future ML model training
    await supabaseClient.from('AuditLog').insert({
      action: 'DEMAND_PREDICTION_GENERATED',
      entityType: 'RESTAURANT',
      entityId: restaurantId.toString(),
      detailsJson: JSON.stringify({
        forecastDays,
        avgDailyPrediction,
        trendMultiplier,
        peakDay: peakDay.date,
        lowDay: lowDay.date
      })
    })

    const response = {
      success: true,
      restaurant: {
        id: restaurantId,
        name: restaurant.name,
        capacity: restaurant.capacity,
        rating: restaurant.rating
      },
      insights: {
        trend: trendMultiplier > 1.0 ? 'GROWING' : trendMultiplier < 1.0 ? 'DECLINING' : 'STABLE',
        trendPercentage: Math.round((trendMultiplier - 1.0) * 100),
        avgDailyBookings: avgDailyPrediction,
        peakDay: {
          date: peakDay.date,
          dayOfWeek: peakDay.dayOfWeek,
          predictedBookings: peakDay.predictedBookings
        },
        slowestDay: {
          date: lowDay.date,
          dayOfWeek: lowDay.dayOfWeek,
          predictedBookings: lowDay.predictedBookings
        },
        capacityUtilization: Math.round((avgDailyPrediction / restaurant.capacity) * 100),
        dataQuality: historicalBookings.length >= 50 ? 'EXCELLENT' : 
                     historicalBookings.length >= 30 ? 'GOOD' :
                     historicalBookings.length >= 10 ? 'FAIR' : 'LIMITED'
      },
      predictions,
      hourlyPredictions,
      strategicRecommendations: [
        totalPredictedBookings > restaurant.capacity * forecastDays * 0.7 
          ? '🎯 High demand period - perfect for premium pricing strategy'
          : '📈 Moderate demand - focus on conversion optimization',
        peakDay.demandLevel === 'VERY_HIGH'
          ? `🔥 ${peakDay.dayOfWeek} will be extremely busy - prepare staff accordingly`
          : `📅 ${peakDay.dayOfWeek} is your peak day this week`,
        lowDay.demandLevel === 'LOW'
          ? `💡 ${lowDay.dayOfWeek} needs promotional boost - consider flash sales`
          : `✅ Demand is well-distributed across the week`
      ],
      metadata: {
        forecastDays,
        generatedAt: new Date().toISOString(),
        historicalDataPoints: historicalBookings.length,
        modelVersion: '1.0.0'
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Demand Prediction Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/*
Example Request:

POST /demand-prediction
{
  "restaurantId": 1,
  "forecastDays": 7,
  "includeHourly": true
}

Example Response:
{
  "success": true,
  "restaurant": {
    "id": 1,
    "name": "The Spice Garden",
    "capacity": 40,
    "rating": 4.5
  },
  "insights": {
    "trend": "GROWING",
    "trendPercentage": 10,
    "avgDailyBookings": 28,
    "peakDay": {
      "date": "2026-10-12",
      "dayOfWeek": "Saturday",
      "predictedBookings": 38
    },
    "capacityUtilization": 70
  },
  "predictions": [
    {
      "date": "2026-10-07",
      "dayOfWeek": "Monday",
      "predictedBookings": 22,
      "confidence": 85,
      "demandLevel": "MEDIUM",
      "recommendedActions": [
        "✅ Standard pricing recommended",
        "📱 Light promotional push to fill remaining slots"
      ]
    }
    ...
  ]
}
*/
