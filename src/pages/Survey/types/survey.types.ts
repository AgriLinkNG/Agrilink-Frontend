// Survey form data types

export type QuestionType =
    | 'single_choice'
    | 'multiple_choice'
    | 'scale'
    | 'ranking'
    | 'text'
    | 'conditional';

export interface QuestionOption {
    value: string;
    label: string;
}

export interface ScaleLabels {
    min: string;
    max: string;
}

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    description?: string;
    required: boolean;
    options?: QuestionOption[];
    scaleLabels?: ScaleLabels;
    scaleMin?: number;
    scaleMax?: number;
    minLength?: number;
    placeholder?: string;
    conditionalTrigger?: {
        values: string[];
        showFields: string[];
    };
}

export interface SurveySection {
    id: number;
    title: string;
    description?: string;
    questions: Question[];
}

// Form data structure matching all survey questions
export interface SurveyFormData {
    // Section 1: Current Market Experience
    purchaseFrequency: string;
    shoppingLocations: string[];
    timeSpent: string;
    painPoints: string[];
    freshnessSatisfaction: number;
    priceSatisfaction: number;

    // Section 2: Online Shopping Behavior
    onlineShoppingExperience: string;
    platformsUsed: string[];
    hesitations: string[];

    // Section 3: AgriLink Concept Validation
    interestLevel: number;
    willingnessToUse: number;
    convincingFactors: string[];
    concerns: string;
    otherProducts: string[];

    // Section 4: Pricing & Value Perception
    weeklySpend: string;
    platformFeeAcceptance: number;
    priorityRanking: {
        price: number;
        quality: number;
        convenience: number;
    };

    // Section 5: Demographics & Contact
    ageRange: string;
    livingSituation: string;
    betaTesting: 'yes' | 'maybe' | 'no' | '';
    contactEmail?: string;
    contactPhone?: string;

    // Bonus questions (optional)
    oneChange?: string;
    additionalThoughts?: string;

    otherResponses: Record<string, string>;
}

export interface SurveyMetadata {
    submittedAt: string;
    userAgent: string;
    referrer: string;
    completionTimeSeconds?: number;
}

export interface SurveySubmission {
    responses: SurveyFormData;
    metadata: SurveyMetadata;
}

// Default form values
export const defaultSurveyFormData: SurveyFormData = {
    purchaseFrequency: '',
    shoppingLocations: [],
    timeSpent: '',
    painPoints: [],
    freshnessSatisfaction: 0,
    priceSatisfaction: 0,
    onlineShoppingExperience: '',
    platformsUsed: [],
    hesitations: [],
    interestLevel: 0,
    willingnessToUse: 0,
    convincingFactors: [],
    concerns: '',
    otherProducts: [],
    weeklySpend: '',
    platformFeeAcceptance: 0,
    priorityRanking: {
        price: 0,
        quality: 0,
        convenience: 0,
    },
    ageRange: '',
    livingSituation: '',
    betaTesting: '',
    contactEmail: '',
    contactPhone: '',
    oneChange: '',
    additionalThoughts: '',
    otherResponses: {},
};
