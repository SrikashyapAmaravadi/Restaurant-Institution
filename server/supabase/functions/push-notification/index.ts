// Supabase Edge Function: Push Notifications
// Sends push notifications via Firebase Cloud Messaging (FCM) or Web Push API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushRequest {
  userId?: string
  userIds?: string[]
  title: string
  body: string
  icon?: string
  image?: string
  actionUrl?: string
  data?: Record<string, any>
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

    // Parse request
    const pushRequest: PushRequest = await req.json()
    const { userId, userIds, title, body, icon, image, actionUrl, data } = pushRequest

    // Get target user IDs
    const targetUserIds = userId ? [userId] : (userIds || [])

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No target users specified' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log(`Sending push notifications to ${targetUserIds.length} users`)

    // Get user push tokens from database
    // Note: You'll need to add a PushToken table to store FCM tokens
    const { data: pushTokens, error: tokenError } = await supabaseClient
      .from('User')
      .select('id, email, name')
      .in('id', targetUserIds)

    if (tokenError) throw tokenError

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
    let notificationsSent = 0
    let inAppNotificationsCreated = 0

    for (const user of pushTokens || []) {
      // Create in-app notification
      const { error: notifError } = await supabaseClient
        .from('Notification')
        .insert({
          userId: user.id,
          type: 'info',
          title,
          body,
          read: false
        })

      if (!notifError) inAppNotificationsCreated++

      // Send FCM push notification (if FCM is configured)
      if (fcmServerKey && user.fcmToken) {
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: user.fcmToken,
            notification: {
              title,
              body,
              icon: icon || '/favicon.svg',
              image: image,
              click_action: actionUrl || 'https://restaurant-institution.vercel.app'
            },
            data: data || {}
          })
        })

        if (fcmResponse.ok) {
          notificationsSent++
          console.log(`Push notification sent to user ${user.id}`)
        } else {
          console.error(`Failed to send push to user ${user.id}`)
        }
      }

      // Send email notification as fallback
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Dine Security <sahith@nivixpe.com>',
            to: user.email,
            subject: title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>${title}</h2>
                <p>${body}</p>
                ${actionUrl 
                  ? `<a href="${actionUrl}" style="display: inline-block; background: #f97316; 
                       color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                       View Details
                     </a>`
                  : ''
                }
              </div>
            `
          })
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        targetUsers: targetUserIds.length,
        pushNotificationsSent: notificationsSent,
        inAppNotificationsCreated
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

/* Example Usage:

POST /push-notification
{
  "userId": "user-uuid",
  "title": "🎉 New Offer Available!",
  "body": "Get 20% off on your next booking at The Spice Garden",
  "actionUrl": "https://restaurant-institution.vercel.app/offers",
  "icon": "/offer-icon.png",
  "data": {
    "offerId": "offer-123",
    "restaurantId": "1"
  }
}

OR send to multiple users:

{
  "userIds": ["user-1", "user-2", "user-3"],
  "title": "Weekend Special!",
  "body": "Book now for the weekend and get free dessert"
}

*/
