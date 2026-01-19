/**
 * Cloudflare Pages Function to send emails via Resend
 * This runs on the Cloudflare edge, avoiding CORS issues
 * 
 * Path: /api/send-email
 */

interface Env {
    RESEND_API_KEY: string;
    NOTIFICATION_EMAIL: string;
}

interface WaitlistEmailData {
    name: string;
    email: string;
    mobile: string;
    userType: 'buyer' | 'farmer' | 'both';
}

interface EmailRequest {
    type: 'notification' | 'welcome';
    data: WaitlistEmailData;
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request (CORS preflight)
export const onRequestOptions: PagesFunction<Env> = async () => {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
};

// Handle POST request
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    // Check for API key
    if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY environment variable is not set');
        return Response.json(
            { error: 'Email service not configured' },
            { status: 500, headers: corsHeaders }
        );
    }

    try {
        const body = await request.json() as EmailRequest;
        const { type, data } = body;

        if (!type || !data) {
            return Response.json(
                { error: 'Missing type or data in request body' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate data
        if (!data.name || !data.email || !data.mobile || !data.userType) {
            return Response.json(
                { error: 'Missing required fields in data' },
                { status: 400, headers: corsHeaders }
            );
        }

        const notificationEmail = env.NOTIFICATION_EMAIL || 'support@agrilink.com.ng';
        let emailPayload;

        if (type === 'notification') {
            // Admin notification email
            const userTypeLabel: Record<string, string> = {
                buyer: 'Buyer',
                farmer: 'Farmer',
                both: 'Both (Buyer & Farmer)'
            };

            emailPayload = {
                from: 'AgriLink Waitlist <onboarding@resend.dev>',
                to: [notificationEmail],
                subject: `🌱 New Waitlist Signup: ${data.name}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🌱 New Waitlist Signup!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Someone just joined the AgriLink waitlist!
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Name:</td>
                    <td style="padding: 10px 0; color: #111827;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Email:</td>
                    <td style="padding: 10px 0; color: #111827;">
                      <a href="mailto:${data.email}" style="color: #22c55e;">${data.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Mobile:</td>
                    <td style="padding: 10px 0; color: #111827;">${data.mobile}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">User Type:</td>
                    <td style="padding: 10px 0; color: #111827;">
                      <span style="background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                        ${userTypeLabel[data.userType] || data.userType}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 14px; color: #9ca3af; margin-top: 20px; text-align: center;">
                View all signups in your <a href="https://supabase.com/dashboard" style="color: #22c55e;">Supabase Dashboard</a>
              </p>
            </div>
          </div>
        `
            };
        } else if (type === 'welcome') {
            // Welcome email to user
            const firstName = data.name.split(' ')[0];

            emailPayload = {
                from: 'AgriLink <onboarding@resend.dev>',
                to: [data.email],
                subject: '🌱 Welcome to the AgriLink Waitlist!',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AgriLink! 🌱</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
                Hi ${firstName},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Thank you for joining the AgriLink waitlist! You're one step closer to experiencing 
                a platform that connects Nigerian farmers directly with buyers, eliminating middlemen 
                and reducing post-harvest losses.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="font-size: 16px; color: #374151; margin: 0;">
                  <strong>What's next?</strong><br>
                  We'll notify you as soon as AgriLink launches. Stay tuned!
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                In the meantime, feel free to reply to this email if you have any questions 
                or suggestions. We'd love to hear from you!
              </p>
              
              <p style="font-size: 16px; color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong style="color: #22c55e;">The AgriLink Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              © 2026 AgriLink. All rights reserved.
            </div>
          </div>
        `
            };
        } else {
            return Response.json(
                { error: 'Invalid email type. Use "notification" or "welcome"' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Send email via Resend
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailPayload)
        });

        const result = await response.json() as Record<string, unknown>;

        if (!response.ok) {
            console.error('Resend API error:', result);
            return Response.json(
                {
                    error: (result.message as string) || 'Failed to send email',
                    details: result
                },
                { status: response.status, headers: corsHeaders }
            );
        }

        return Response.json(
            {
                success: true,
                message: `${type} email sent successfully`,
                id: result.id
            },
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error('Email sending error:', error);
        return Response.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500, headers: corsHeaders }
        );
    }
};
