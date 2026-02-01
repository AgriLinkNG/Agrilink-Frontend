import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyForm } from './hooks/useSurveyForm';
import { surveySections } from './data/questions';
import { submitSurvey, collectMetadata } from '@/services/api/surveyApi';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { SurveyNavigation } from './components/SurveyNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SurveyFormData } from './types/survey.types';

export function SurveyForm() {
    const navigate = useNavigate();
    const {
        formData,
        currentSection,
        totalSections,
        errors,
        isSubmitting,
        startTime,
        updateField,
        validateSection,
        nextSection,
        previousSection,
        setIsSubmitting,
        clearProgress,
        canProceed,
    } = useSurveyForm();

    const currentSectionData = surveySections[currentSection - 1];

    const handleNext = async () => {
        if (currentSection === totalSections) {
            // Submit the form
            if (!validateSection()) return;

            setIsSubmitting(true);

            try {
                const metadata = collectMetadata(startTime);
                await submitSurvey({
                    responses: formData,
                    metadata,
                });

                // Clear saved progress
                clearProgress();

                // Optimistic redirect with small delay
                setTimeout(() => {
                    navigate('/survey/thank-you');
                }, 500);
            } catch (error) {
                console.error('Survey submission failed:', error);
                // Still navigate to thank you (optimistic)
                setTimeout(() => {
                    navigate('/survey/thank-you');
                }, 500);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            nextSection();
        }
    };

    const handlePrevious = () => {
        previousSection();
    };

    // Check if beta testing requires contact info
    const showContactFields = formData.betaTesting === 'yes' || formData.betaTesting === 'maybe';

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress bar */}
            <ProgressBar
                currentSection={currentSection}
                totalSections={totalSections}
                className="mb-8"
            />

            {/* Section header */}
            <div className="mb-8">
                <h2
                    className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                    {currentSectionData?.title}
                </h2>
                {currentSectionData?.description && (
                    <p
                        className="text-gray-600"
                        style={{ fontFamily: 'MadaniArabic-Regular' }}
                    >
                        {currentSectionData.description}
                    </p>
                )}
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {currentSectionData?.questions.map((question) => (
                    <React.Fragment key={question.id}>
                        <QuestionCard
                            question={question}
                            value={formData[question.id as keyof SurveyFormData]}
                            onChange={(value) => updateField(question.id as keyof SurveyFormData, value)}
                            otherValue={formData.otherResponses[question.id] || ''}
                            onOtherChange={(value) => updateField('otherResponses', { ...formData.otherResponses, [question.id]: value })}
                            error={errors[question.id]}
                            otherError={errors[`${question.id}_other`]}
                        />

                        {/* Conditional contact fields for beta testing question */}
                        {question.id === 'betaTesting' && showContactFields && (
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-green-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Label
                                    className="block text-lg text-gray-900 mb-4"
                                    style={{ fontFamily: 'MadaniArabic-Bold' }}
                                >
                                    How can we reach you?
                                </Label>
                                <p
                                    className="text-sm text-gray-600 mb-6"
                                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                                >
                                    Please provide at least one contact method
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="contactEmail"
                                            className="block text-gray-700 text-sm mb-2"
                                            style={{ fontFamily: 'MadaniArabic-Medium' }}
                                        >
                                            Email Address
                                        </Label>
                                        <Input
                                            id="contactEmail"
                                            type="email"
                                            value={formData.contactEmail || ''}
                                            onChange={(e) => updateField('contactEmail', e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full h-12 px-4 rounded-2xl bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist focus:border-primary"
                                            style={{ fontFamily: 'MadaniArabic-Regular' }}
                                        />
                                        {errors.contactEmail && (
                                            <p className="mt-2 text-sm text-red-500" style={{ fontFamily: 'MadaniArabic-Medium' }}>
                                                {errors.contactEmail}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="contactPhone"
                                            className="block text-gray-700 text-sm mb-2"
                                            style={{ fontFamily: 'MadaniArabic-Medium' }}
                                        >
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="contactPhone"
                                            type="tel"
                                            value={formData.contactPhone || ''}
                                            onChange={(e) => updateField('contactPhone', e.target.value)}
                                            placeholder="+234 801 234 5678"
                                            className="w-full h-12 px-4 rounded-2xl bg-brand-colors-HarvestMist border-2 border-brand-colors-HarvestMist focus:border-primary"
                                            style={{ fontFamily: 'MadaniArabic-Regular' }}
                                        />
                                        {errors.contactPhone && (
                                            <p className="mt-2 text-sm text-red-500" style={{ fontFamily: 'MadaniArabic-Medium' }}>
                                                {errors.contactPhone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Navigation */}
            <SurveyNavigation
                currentSection={currentSection}
                totalSections={totalSections}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isSubmitting={isSubmitting}
                canProceed={canProceed}
            />
        </div>
    );
}

export default SurveyForm;
