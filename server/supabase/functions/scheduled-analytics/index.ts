// Supabase Edge Function: Scheduled Analytics
// Replaces pg_cron for daily analytics computation
// Schedule this via Supabase Dashboard Cron

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Starting scheduled analytics computation...')

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString()
    const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString()

    // Fetch yesterday's bookings
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('Booking')
      .select(`
        id,
        status,
        userId,
        restaurantId,
        createdAt,
        payment:Payment(totalAmount)
      `)
      .gte('createdAt', yesterdayStart)
      .lt('createdAt', yesterdayEnd)

    if (bookingsError) throw bookingsError

    // Count new users yesterday
    const { count: newUsersCount, error: usersError } = await supabaseClient
      .from('User')
      .select('id', { count: 'exact', head: true })
      .gte('createdAt', yesterdayStart)
      .lt('createdAt', yesterdayEnd)

    if (usersError) throw usersError

    // Count rewards distributed yesterday
    const { data: rewards, error: rewardsError } = await supabaseClient
      .from('Reward')
      .select('points')
      .eq('type', 'EARNED')
      .gte('createdAt', yesterdayStart)
      .lt('createdAt', yesterdayEnd)

    if (rewardsError) throw rewardsError

    // Calculate metrics
    const totalBookings = bookings?.length || 0
    const completedBookings = bookings?.filter(b => b.status === 'COMPLETED').length || 0
    const totalRevenue = bookings?.reduce((sum, b) => {
      return sum + (b.payment?.[0]?.totalAmount || 0)
    }, 0) || 0
    const avgOrderValue = completedBookings > 0 ? totalRevenue / completedBookings : 0
    const uniqueCustomers = new Set(bookings?.map(b => b.userId).filter(Boolean)).size
    const activeRestaurants = new Set(bookings?.map(b => b.restaurantId)).size
    const rewardsDistributed = rewards?.reduce((sum, r) => sum + r.points, 0) || 0

    const analytics = {
      date: yesterday.toISOString().split('T')[0],
      metrics: {
        totalBookings,
        completedBookings,
        cancelledBookings: bookings?.filter(b => b.status === 'CANCELLED').length || 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(avgOrderValue * 100) / 100,
        uniqueCustomers,
        activeRestaurants,
        newUsers: newUsersCount || 0,
        rewardsDistributed,
        conversionRate: totalBookings > 0 
          ? Math.round((completedBookings / totalBookings) * 100 * 100) / 100
          : 0
      }
    }

    // Save analytics snapshot to AuditLog
    const { error: auditError } = await supabaseClient
      .from('AuditLog')
      .insert({
        action: 'DAILY_ANALYTICS_SNAPSHOT',
        entityType: 'SYSTEM',
        detailsJson: JSON.stringify(analytics)
      })

    if (auditError) throw auditError

    console.log('Analytics computed:', analytics)

    // Refresh materialized view (restaurant leaderboard)
    const { error: refreshError } = await supabaseClient.rpc('refresh_materialized_views')
    
    if (refreshError) {
      console.warn('Could not refresh materialized views:', refreshError.message)
      // Don't throw - this is not critical
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily analytics computed successfully',
        analytics,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Scheduled Analytics Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
