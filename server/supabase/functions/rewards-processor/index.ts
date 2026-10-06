// Supabase Edge Function: Rewards Processor
// Calculates and awards points/rewards based on bookings and payments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Reward rules
const REWARD_RULES = {
  BOOKING_COMPLETED: 50,        // 50 points per completed booking
  PAYMENT_COMPLETED: 100,       // 100 points per payment
  FIRST_BOOKING_BONUS: 200,     // 200 points for first booking
  REVIEW_SUBMITTED: 75,         // 75 points for submitting review
  REFERRAL_BONUS: 150,          // 150 points for successful referral
  SPEND_MULTIPLIER: 0.01,       // 1% of spend as points (₹100 = 1 point)
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

    // Get recently completed bookings (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: completedBookings, error } = await supabaseClient
      .from('Booking')
      .select(`
        id,
        userId,
        guestName,
        guestEmail,
        restaurantName,
        status,
        updatedAt,
        payment:Payment(totalAmount)
      `)
      .eq('status', 'COMPLETED')
      .gte('updatedAt', fiveMinutesAgo)

    if (error) throw error

    console.log(`Processing rewards for ${completedBookings?.length || 0} completed bookings`)

    let rewardsProcessed = 0
    const rewardsSummary = []

    for (const booking of completedBookings || []) {
      if (!booking.userId) continue

      // Check if user already got rewards for this booking
      const { data: existingReward } = await supabaseClient
        .from('AuditLog')
        .select('id')
        .eq('action', 'REWARD_GRANTED')
        .eq('entityId', booking.id)
        .single()

      if (existingReward) {
        console.log(`Rewards already granted for booking ${booking.id}`)
        continue
      }

      // Calculate rewards
      let totalPoints = REWARD_RULES.BOOKING_COMPLETED + REWARD_RULES.PAYMENT_COMPLETED
      
      // Add spend-based points
      if (booking.payment?.[0]?.totalAmount) {
        const spendPoints = Math.floor(booking.payment[0].totalAmount * REWARD_RULES.SPEND_MULTIPLIER)
        totalPoints += spendPoints
      }

      // Check if this is user's first booking
      const { count: bookingCount } = await supabaseClient
        .from('Booking')
        .select('id', { count: 'exact', head: true })
        .eq('userId', booking.userId)
        .eq('status', 'COMPLETED')

      if (bookingCount === 1) {
        totalPoints += REWARD_RULES.FIRST_BOOKING_BONUS
      }

      // Create reward notification
      const { error: notifError } = await supabaseClient
        .from('Notification')
        .insert({
          userId: booking.userId,
          type: 'success',
          title: '🎉 Rewards Earned!',
          body: `You earned ${totalPoints} points for your booking at ${booking.restaurantName}!`,
          code: booking.id,
          read: false
        })

      // Log reward grant in audit log
      const { error: auditError } = await supabaseClient
        .from('AuditLog')
        .insert({
          userId: booking.userId,
          userName: booking.guestName,
          action: 'REWARD_GRANTED',
          entityType: 'BOOKING',
          entityId: booking.id,
          detailsJson: JSON.stringify({
            points: totalPoints,
            breakdown: {
              bookingCompleted: REWARD_RULES.BOOKING_COMPLETED,
              paymentCompleted: REWARD_RULES.PAYMENT_COMPLETED,
              spendBonus: booking.payment?.[0]?.totalAmount 
                ? Math.floor(booking.payment[0].totalAmount * REWARD_RULES.SPEND_MULTIPLIER)
                : 0,
              firstBookingBonus: bookingCount === 1 ? REWARD_RULES.FIRST_BOOKING_BONUS : 0
            }
          })
        })

      if (!notifError && !auditError) {
        rewardsProcessed++
        rewardsSummary.push({
          bookingId: booking.id,
          userId: booking.userId,
          points: totalPoints,
          isFirstBooking: bookingCount === 1
        })

        // Send congratulations email
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Dine Security <sahith@nivixpe.com>',
            to: booking.guestEmail,
            subject: `🎉 You Earned ${totalPoints} Reward Points!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">🎉 Congratulations!</h2>
                <p>Hi ${booking.guestName},</p>
                <p>Thank you for dining at ${booking.restaurantName}!</p>
                
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; 
                            border-radius: 12px; text-align: center; color: white; margin: 20px 0;">
                  <h1 style="font-size: 48px; margin: 0;">${totalPoints}</h1>
                  <p style="font-size: 20px; margin: 10px 0;">Reward Points Earned</p>
                </div>

                <h3>Points Breakdown:</h3>
                <ul>
                  <li>Booking Completed: ${REWARD_RULES.BOOKING_COMPLETED} points</li>
                  <li>Payment Completed: ${REWARD_RULES.PAYMENT_COMPLETED} points</li>
                  ${booking.payment?.[0]?.totalAmount 
                    ? `<li>Spend Bonus: ${Math.floor(booking.payment[0].totalAmount * REWARD_RULES.SPEND_MULTIPLIER)} points</li>`
                    : ''
                  }
                  ${bookingCount === 1 
                    ? `<li>🌟 First Booking Bonus: ${REWARD_RULES.FIRST_BOOKING_BONUS} points</li>`
                    : ''
                  }
                </ul>

                <p>Redeem your points on your next booking for exclusive discounts!</p>
                
                <a href="https://restaurant-institution.vercel.app/profile" 
                   style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  View My Rewards
                </a>
              </div>
            `
          })
        })

        console.log(`Rewards processed for user ${booking.userId}: ${totalPoints} points`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        completedBookings: completedBookings?.length || 0,
        rewardsProcessed,
        rewardsSummary
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
