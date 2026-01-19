/**
 * Email notification service
 * Uses Cloudflare Pages Function to send emails via Resend
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
  skipped?: boolean;
}

/**
 * Check if we're in a development environment where the email API won't work
 */
function isLocalDevelopment(): boolean {
  // Check if we're running on localhost without Cloudflare/Wrangler
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDev = import.meta.env.DEV;

  return isLocalhost && isDev;
}

/**
 * Get the API base URL based on environment
 */
function getApiBaseUrl(): string {
  // Always use relative URL - works both in production and with wrangler dev
  return '/api';
}

/**
 * Send notification email when someone joins the waitlist
 */
export async function sendWaitlistNotification(data: WaitlistEmailData): Promise<EmailResponse> {
  // In local development without wrangler, skip email sending
  if (isLocalDevelopment()) {
    console.log('[DEV MODE] Skipping admin notification email. Deploy to Cloudflare or use `wrangler pages dev` to test emails.');
    console.log('[DEV MODE] Email would be sent to admin with data:', data);
    return { success: true, skipped: true };
  }

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

    // Handle non-JSON responses (like 403 or 404)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (response.status === 403 || response.status === 404) {
        console.warn('[EMAIL] API endpoint not available (possibly local dev). Email skipped.');
        return { success: true, skipped: true };
      }
      console.error('Email API returned non-JSON response:', response.status);
      return { success: false, error: `Server error: ${response.status}` };
    }

    const result = await response.json();

    if (!response.ok) {
      console.error('Email API error:', result);
      return { success: false, error: result.error || 'Failed to send email' };
    }

    console.log('Waitlist notification email sent successfully');
    return { success: true };
  } catch (error) {
    // Network errors in dev are expected
    if (isLocalDevelopment()) {
      console.log('[DEV MODE] Email API not available locally. Skipping.');
      return { success: true, skipped: true };
    }
    console.error('Email notification error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send welcome email to the user who just signed up
 */
export async function sendWelcomeEmail(data: WaitlistEmailData): Promise<EmailResponse> {
  // In local development without wrangler, skip email sending
  if (isLocalDevelopment()) {
    console.log('[DEV MODE] Skipping welcome email. Deploy to Cloudflare or use `wrangler pages dev` to test emails.');
    console.log('[DEV MODE] Welcome email would be sent to:', data.email);
    return { success: true, skipped: true };
  }

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

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (response.status === 403 || response.status === 404) {
        console.warn('[EMAIL] API endpoint not available. Email skipped.');
        return { success: true, skipped: true };
      }
      console.error('Email API returned non-JSON response:', response.status);
      return { success: false, error: `Server error: ${response.status}` };
    }

    const result = await response.json();

    if (!response.ok) {
      console.error('Email API error:', result);
      return { success: false, error: result.error || 'Failed to send email' };
    }

    console.log('Welcome email sent successfully to', data.email);
    return { success: true };
  } catch (error) {
    if (isLocalDevelopment()) {
      console.log('[DEV MODE] Email API not available locally. Skipping.');
      return { success: true, skipped: true };
    }
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
