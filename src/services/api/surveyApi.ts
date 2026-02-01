import { SurveySubmission, SurveyFormData, SurveyMetadata } from '@/pages/Survey/types/survey.types';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_SURVEY_ENDPOINT;

/**
 * Flatten survey data for Google Sheets submission.
 * Arrays are joined as comma-separated strings.
 */
function flattenSurveyData(responses: SurveyFormData): Record<string, string | number> {
    const flattened: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(responses)) {
        if (Array.isArray(value)) {
            flattened[key] = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            // Handle priorityRanking object
            for (const [subKey, subValue] of Object.entries(value)) {
                flattened[`${key}_${subKey}`] = subValue as number;
            }
        } else if (value !== undefined && value !== null) {
            flattened[key] = value as string | number;
        }
    }

    return flattened;
}

/**
 * Submit survey responses to Google Sheets via Apps Script.
 * Uses form data submission since no-cors mode strips JSON headers.
 */
export async function submitSurvey(data: SurveySubmission): Promise<void> {
    if (!GOOGLE_SCRIPT_URL) {
        console.error('VITE_SURVEY_ENDPOINT is not configured');
        throw new Error('Survey endpoint not configured');
    }

    const flattenedResponses = flattenSurveyData(data.responses);

    const payload = {
        ...flattenedResponses,
        submittedAt: data.metadata.submittedAt,
        userAgent: data.metadata.userAgent,
        referrer: data.metadata.referrer,
        completionTimeSeconds: data.metadata.completionTimeSeconds || 0,
    };

    console.log('Survey payload:', payload);
    console.log('Submitting to:', GOOGLE_SCRIPT_URL);

    try {
        // Convert payload to URL-encoded form data
        // This works with no-cors mode because form submissions don't require CORS
        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
            formData.append(key, String(value));
        }

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        console.log('Survey submission sent (no-cors mode - response is opaque)');
        // Note: no-cors mode returns opaque response, can't verify success
        // We handle this optimistically
    } catch (error) {
        console.error('Survey submission error:', error);
        throw new Error('Failed to submit survey');
    }
}

/**
 * Collect survey metadata
 */
export function collectMetadata(startTime: number): SurveyMetadata {
    return {
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        completionTimeSeconds: Math.round((Date.now() - startTime) / 1000),
    };
}
