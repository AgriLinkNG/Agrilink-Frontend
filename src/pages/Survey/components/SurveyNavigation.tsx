import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SurveyNavigationProps {
    currentSection: number;
    totalSections: number;
    onNext: () => void;
    onPrevious: () => void;
    isSubmitting?: boolean;
    canProceed?: boolean;
}

export function SurveyNavigation({
    currentSection,
    totalSections,
    onNext,
    onPrevious,
    isSubmitting = false,
    canProceed = true,
}: SurveyNavigationProps) {
    const isFirstSection = currentSection === 1;
    const isLastSection = currentSection === totalSections;

    return (
        <div className="flex justify-between items-center gap-4 pt-6">
            {/* Back button */}
            <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isFirstSection || isSubmitting}
                className={cn(
                    'h-12 px-6 rounded-full border-2 border-gray-200',
                    'hover:border-primary hover:bg-brand-colors-HarvestMist',
                    'transition-all duration-200',
                    isFirstSection && 'invisible'
                )}
                style={{ fontFamily: 'MadaniArabic-Medium' }}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {/* Next/Submit button */}
            <Button
                type="button"
                onClick={onNext}
                disabled={!canProceed || isSubmitting}
                className={cn(
                    'h-12 px-8 rounded-full',
                    'bg-primary hover:bg-[hsl(var(--brand-colors-SoilBlush))]',
                    'text-white shadow-md',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                style={{ fontFamily: 'MadaniArabic-Bold' }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : isLastSection ? (
                    <>
                        Submit Survey
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                ) : (
                    <>
                        Next Section
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                )}
            </Button>
        </div>
    );
}

export default SurveyNavigation;
