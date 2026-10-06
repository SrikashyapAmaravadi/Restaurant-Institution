// Supabase Edge Function: Send Booking Reminders
// Triggers: Scheduled (cron) or webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current time + 1 hour (for reminders)
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    const reminderTime = oneHourLater.toISOString().split('T')[1].substring(0, 5) // HH:MM format

    // Fetch bookings that are 1 hour away
    const { data: bookings, error } = await supabaseClient
      .from('Booking')
      .select(`
        id,
        guestName,
        guestEmail,
        date,
        time,
        guests,
        restaurantName,
        status
      `)
      .eq('status', 'CONFIRMED')
      .eq('time', reminderTime)

    if (error) throw error

    console.log(`Found ${bookings?.length || 0} bookings to remind`)

    // Send reminders using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    for (const booking of bookings || []) {
      // Send email via Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Dine Security <sahith@nivixpe.com>',
          to: booking.guestEmail,
          subject: `Reminder: Your booking at ${booking.restaurantName}`,
          html: `
            <h2>Booking Reminder</h2>
            <p>Hi ${booking.guestName},</p>
            <p>This is a reminder that your booking is in 1 hour:</p>
            <ul>
              <li><strong>Restaurant:</strong> ${booking.restaurantName}</li>
              <li><strong>Date:</strong> ${booking.date}</li>
              <li><strong>Time:</strong> ${booking.time}</li>
              <li><strong>Guests:</strong> ${booking.guests}</li>
              <li><strong>Booking ID:</strong> ${booking.id}</li>
            </ul>
            <p>See you soon!</p>
          `
        })
      })

      if (emailResponse.ok) {
        console.log(`Reminder sent to ${booking.guestEmail}`)
      } else {
        console.error(`Failed to send reminder to ${booking.guestEmail}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent: bookings?.length || 0 
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
