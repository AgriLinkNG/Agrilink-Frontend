/**
 * Email notification service
 * Uses Vercel serverless function to send emails via Resend
 * This avoids CORS issues by making server-to-server API calls
 */

interface WaitlistEmailData {
  name: string;
  email: string;
  mobile: string;
  userType: 'buyer' | 'farmer' | 'both';
}

interface EmailResponse {
  success: boolean;
  error?: string;
}

/**
 * Get the API base URL based on environment
 * In development: use localhost or production URL
 * In production: use the deployed Vercel URL
 */
function getApiBaseUrl(): string {
  // Check if we're in production (deployed on Vercel)
  if (import.meta.env.PROD) {
    // In production, use relative URL (same domain)
    return '/api';
  }

  // In development, check if there's a custom API URL configured
  const customApiUrl = import.meta.env.VITE_API_URL;
  if (customApiUrl) {
    return customApiUrl;
  }

  // Default: use relative URL which works if running on same port
  // For local development with Vercel, you'd run `vercel dev`
  return '/api';
}

/**
 * Send notification email when someone joins the waitlist
 */
export async function sendWaitlistNotification(data: WaitlistEmailData): Promise<EmailResponse> {
  try {
    const apiUrl = getApiBaseUrl();

    const response = await fetch(`${apiUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'notification',
        data
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Email API error:', result);
      return { success: false, error: result.error || 'Failed to send email' };
    }

    console.log('Waitlist notification email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send welcome email to the user who just signed up
 */
export async function sendWelcomeEmail(data: WaitlistEmailData): Promise<EmailResponse> {
  try {
    const apiUrl = getApiBaseUrl();

    const response = await fetch(`${apiUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'welcome',
        data
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Email API error:', result);
      return { success: false, error: result.error || 'Failed to send email' };
    }

    console.log('Welcome email sent successfully to', data.email);
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send both notification and welcome emails
 * Convenience function that handles both in parallel
 */
export async function sendWaitlistEmails(data: WaitlistEmailData): Promise<{
  notification: EmailResponse;
  welcome: EmailResponse;
}> {
  const [notification, welcome] = await Promise.all([
    sendWaitlistNotification(data),
    sendWelcomeEmail(data)
  ]);

  return { notification, welcome };
}
