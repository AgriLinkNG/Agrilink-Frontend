import { useState, useCallback, useEffect } from 'react';
import { SurveyFormData, defaultSurveyFormData } from '../types/survey.types';
import { surveySections, bonusQuestions, TOTAL_SECTIONS } from '../data/questions';

const STORAGE_KEY = 'agrilink_survey_progress';

interface UseSurveyFormReturn {
    formData: SurveyFormData;
    currentSection: number;
    totalSections: number;
    errors: Record<string, string>;
    isSubmitting: boolean;
    startTime: number;
    updateField: (field: keyof SurveyFormData, value: any) => void;
    validateSection: () => boolean;
    nextSection: () => boolean;
    previousSection: () => void;
    setIsSubmitting: (value: boolean) => void;
    clearProgress: () => void;
    canProceed: boolean;
}

export function useSurveyForm(): UseSurveyFormReturn {
    const [startTime] = useState(() => Date.now());
    const [currentSection, setCurrentSection] = useState(1);
    const [formData, setFormData] = useState<SurveyFormData>(() => {
        // Try to restore from localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultSurveyFormData, ...parsed.formData };
            }
        } catch (e) {
            console.warn('Failed to restore survey progress:', e);
        }
        return defaultSurveyFormData;
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Restore section from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.currentSection) {
                    setCurrentSection(parsed.currentSection);
                }
            }
        } catch (e) {
            console.warn('Failed to restore section:', e);
        }
    }, []);

    // Save progress to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ formData, currentSection })
            );
        } catch (e) {
            console.warn('Failed to save survey progress:', e);
        }
    }, [formData, currentSection]);

    const updateField = useCallback((field: keyof SurveyFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            if (field === 'otherResponses' && typeof value === 'object') {
                Object.keys(value).forEach((key) => {
                    delete newErrors[`${key}_other`];
                });
            }
            return newErrors;
        });
    }, []);

    const validateSection = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        // Get current section questions
        const sectionData = currentSection <= TOTAL_SECTIONS
            ? surveySections[currentSection - 1]
            : bonusQuestions;

        if (!sectionData) return true;

        for (const question of sectionData.questions) {
            const value = formData[question.id as keyof SurveyFormData];

            const hasOtherOption = question.options?.some((opt) => opt.value === 'other');

            if (question.required) {
                if (question.type === 'multiple_choice') {
                    if (!value || (value as string[]).length === 0) {
                        newErrors[question.id] = 'Please select at least one option';
                    }
                } else if (question.type === 'scale') {
                    if (!value || value === 0) {
                        newErrors[question.id] = 'Please select a rating';
                    }
                } else if (question.type === 'ranking') {
                    const rankingVal = value as Record<string, number> | undefined;
                    if (!rankingVal || Object.keys(rankingVal).length < 3) {
                        newErrors[question.id] = 'Please rank all options (1, 2, 3)';
                    }
                } else if (question.type === 'text') {
                    if (value && question.minLength && (value as string).length < question.minLength) {
                        newErrors[question.id] = `Please enter at least ${question.minLength} characters`;
                    }
                } else {
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        newErrors[question.id] = 'Please select an option';
                    }
                }
            }

            if (hasOtherOption) {
                const isOtherSelected = question.type === 'multiple_choice'
                    ? (value as string[])?.includes('other')
                    : value === 'other';

                if (isOtherSelected) {
                    const otherText = formData.otherResponses[question.id];
                    if (!otherText || otherText.trim() === '') {
                        newErrors[`${question.id}_other`] = 'Please specify your answer';
                    }
                }
            }

            // Validate conditional fields (email/phone)
            if (question.type === 'conditional' && question.conditionalTrigger) {
                const triggerValues = question.conditionalTrigger.values;
                if (triggerValues.includes(value as string)) {
                    // Check if at least one contact method is provided
                    const email = formData.contactEmail;
                    const phone = formData.contactPhone;
                    if (!email && !phone) {
                        newErrors['contactEmail'] = 'Please provide email or phone';
                    }
                    // Validate email format if provided
                    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        newErrors['contactEmail'] = 'Please enter a valid email address';
                    }
                    // Validate phone format if provided (Nigerian format)
                    if (phone && !/^(\+234|0)[789]\d{9}$/.test(phone.replace(/\s/g, ''))) {
                        newErrors['contactPhone'] = 'Please enter a valid Nigerian phone number';
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [currentSection, formData]);

    const nextSection = useCallback((): boolean => {
        if (!validateSection()) {
            return false;
        }

        if (currentSection < TOTAL_SECTIONS) {
            setCurrentSection((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return true;
    }, [currentSection, validateSection]);

    const previousSection = useCallback(() => {
        if (currentSection > 1) {
            setCurrentSection((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentSection]);

    const clearProgress = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setFormData(defaultSurveyFormData);
        setCurrentSection(1);
        setErrors({});
    }, []);

    // Check if current section can proceed (has all required fields)
    const canProceed = useCallback((): boolean => {
        const sectionData = currentSection <= TOTAL_SECTIONS
            ? surveySections[currentSection - 1]
            : bonusQuestions;

        if (!sectionData) return true;

        for (const question of sectionData.questions) {
            const value = formData[question.id as keyof SurveyFormData];

            const hasOtherOption = question.options?.some((opt) => opt.value === 'other');

            if (question.required) {
                if (question.type === 'multiple_choice') {
                    if (!value || (value as string[]).length === 0) return false;
                } else if (question.type === 'scale') {
                    if (!value || value === 0) return false;
                } else if (question.type === 'ranking') {
                    const rankingVal = value as Record<string, number> | undefined;
                    if (!rankingVal || Object.keys(rankingVal).length < 3) return false;
                } else {
                    if (!value || (typeof value === 'string' && value.trim() === '')) return false;
                }
            }

            if (hasOtherOption) {
                const isOtherSelected = question.type === 'multiple_choice'
                    ? (value as string[])?.includes('other')
                    : value === 'other';

                if (isOtherSelected) {
                    const otherText = formData.otherResponses[question.id];
                    if (!otherText || otherText.trim() === '') return false;
                }
            }
        }

        return true;
    }, [currentSection, formData]);

    return {
        formData,
        currentSection,
        totalSections: TOTAL_SECTIONS,
        errors,
        isSubmitting,
        startTime,
        updateField,
        validateSection,
        nextSection,
        previousSection,
        setIsSubmitting,
        clearProgress,
        canProceed: canProceed(),
    };
}

export default useSurveyForm;
