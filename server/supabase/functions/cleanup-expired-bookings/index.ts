// Supabase Edge Function: Cleanup Expired Bookings
// Runs daily to cancel bookings that are past their time

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

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Cancel all CONFIRMED bookings from yesterday
    const { data: cancelledBookings, error } = await supabaseClient
      .from('Booking')
      .update({ 
        status: 'CANCELLED',
        updatedAt: new Date().toISOString()
      })
      .eq('status', 'CONFIRMED')
      .lt('date', yesterdayStr)
      .select('id, guestEmail, restaurantName')

    if (error) throw error

    console.log(`Cancelled ${cancelledBookings?.length || 0} expired bookings`)

    // Optionally: Send cancellation emails
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    for (const booking of cancelledBookings || []) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Dine Security <sahith@nivixpe.com>',
          to: booking.guestEmail,
          subject: 'Booking Automatically Cancelled',
          html: `
            <p>Your booking at ${booking.restaurantName} (ID: ${booking.id}) was automatically cancelled as it has expired.</p>
          `
        })
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cancelledCount: cancelledBookings?.length || 0 
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
