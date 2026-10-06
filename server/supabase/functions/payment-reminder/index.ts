// Supabase Edge Function: Payment Reminder
// Reminds users to complete payment for bookings in PAYMENT_PENDING status

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

    // Get bookings with pending payment (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { data: pendingBookings, error } = await supabaseClient
      .from('Booking')
      .select(`
        id,
        guestName,
        guestEmail,
        date,
        time,
        guests,
        restaurantName,
        restaurantImage,
        createdAt,
        orders:BookingOrder(name, price, quantity)
      `)
      .eq('status', 'PAYMENT_PENDING')
      .lt('createdAt', tenMinutesAgo)

    if (error) throw error

    console.log(`Found ${pendingBookings?.length || 0} bookings with pending payment`)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    let remindersSent = 0
    let notificationsCreated = 0

    for (const booking of pendingBookings || []) {
      // Calculate total amount
      const subtotal = booking.orders?.reduce(
        (sum: number, order: any) => sum + (order.price * order.quantity), 
        0
      ) || 0
      const tax = subtotal * 0.05 // 5% tax
      const total = subtotal + tax

      // Create in-app notification
      const { error: notifError } = await supabaseClient
        .from('Notification')
        .insert({
          userId: booking.userId,
          type: 'warning',
          title: 'Payment Pending',
          body: `Your booking at ${booking.restaurantName} is waiting for payment. Complete it now!`,
          code: booking.id,
          read: false
        })

      if (!notifError) notificationsCreated++

      // Send email reminder
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Dine Security <sahith@nivixpe.com>',
          to: booking.guestEmail,
          subject: `⏰ Complete Your Payment - ${booking.restaurantName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">⏰ Payment Reminder</h2>
              <p>Hi ${booking.guestName},</p>
              <p>Your booking is almost complete! Just one more step - please complete your payment.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Details</h3>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Restaurant:</strong> ${booking.restaurantName}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Guests:</strong> ${booking.guests}</p>
                <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
              </div>

              <a href="https://restaurant-institution.vercel.app/bookings" 
                 style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Complete Payment Now
              </a>

              <p style="color: #ef4444; font-size: 14px;">
                ⚠️ Your booking will be automatically cancelled if payment is not completed within 30 minutes.
              </p>
            </div>
          `
        })
      })

      if (emailResponse.ok) {
        remindersSent++
        console.log(`Payment reminder sent to ${booking.guestEmail}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pendingBookings: pendingBookings?.length || 0,
        remindersSent,
        notificationsCreated
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
