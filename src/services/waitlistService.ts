import { supabase, WaitlistEntry } from '@/lib/supabase';
import { sendWaitlistNotification, sendWelcomeEmail } from './emailService';

export interface WaitlistFormData {
    name: string;
    email: string;
    mobile: string;
    userType: 'buyer' | 'farmer' | 'both';
}

export interface WaitlistResponse {
    success: boolean;
    message: string;
    data?: WaitlistEntry;
}

/**
 * Submit a new waitlist entry to Supabase
 */
export async function submitWaitlistEntry(formData: WaitlistFormData): Promise<WaitlistResponse> {
    try {
        // Check if email already exists
        const { data: existingEntry } = await supabase
            .from('waitlist')
            .select('email')
            .eq('email', formData.email.toLowerCase().trim())
            .single();

        if (existingEntry) {
            return {
                success: false,
                message: 'This email is already on our waitlist. We\'ll notify you when we launch!'
            };
        }

        // Insert new entry
        const { data, error } = await supabase
            .from('waitlist')
            .insert([
                {
                    name: formData.name.trim(),
                    email: formData.email.toLowerCase().trim(),
                    mobile: formData.mobile.trim(),
                    user_type: formData.userType
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);

            // Handle unique constraint violation
            if (error.code === '23505') {
                return {
                    success: false,
                    message: 'This email is already on our waitlist. We\'ll notify you when we launch!'
                };
            }

            return {
                success: false,
                message: 'Something went wrong. Please try again later.'
            };
        }

        // Send email notifications in the background (don't block the response)
        const emailData = {
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            mobile: formData.mobile.trim(),
            userType: formData.userType
        };

        // Send notification to admin
        sendWaitlistNotification(emailData).catch(err =>
            console.error('Failed to send admin notification:', err)
        );

        // Send welcome email to user
        sendWelcomeEmail(emailData).catch(err =>
            console.error('Failed to send welcome email:', err)
        );

        return {
            success: true,
            message: 'Successfully joined the waitlist!',
            data: data as WaitlistEntry
        };
    } catch (error) {
        console.error('Waitlist submission error:', error);
        return {
            success: false,
            message: 'Unable to connect. Please check your internet connection and try again.'
        };
    }
}

/**
 * Get waitlist count (optional - useful for social proof)
 */
export async function getWaitlistCount(): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error fetching waitlist count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Waitlist count error:', error);
        return 0;
    }
}
