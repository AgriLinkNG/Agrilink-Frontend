import { cn } from '@/lib/utils';

interface ProgressBarProps {
    currentSection: number;
    totalSections: number;
    className?: string;
}

export function ProgressBar({ currentSection, totalSections, className }: ProgressBarProps) {
    const progress = (currentSection / totalSections) * 100;

    return (
        <div className={cn('w-full', className)}>
            {/* Section indicator */}
            <div className="flex justify-between items-center mb-2">
                <span
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'MadaniArabic-Medium' }}
                >
                    Section {currentSection} of {totalSections}
                </span>
                <span
                    className="text-sm text-primary font-semibold"
                    style={{ fontFamily: 'MadaniArabic-Bold' }}
                >
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-brand-colors-HarvestMist rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={currentSection}
                    aria-valuemin={1}
                    aria-valuemax={totalSections}
                    aria-label={`Survey progress: section ${currentSection} of ${totalSections}`}
                />
            </div>

            {/* Section dots */}
            <div className="flex justify-between mt-3">
                {Array.from({ length: totalSections }, (_, i) => i + 1).map((section) => (
                    <div
                        key={section}
                        className={cn(
                            'w-3 h-3 rounded-full transition-all duration-300',
                            section < currentSection
                                ? 'bg-primary'
                                : section === currentSection
                                    ? 'bg-primary ring-2 ring-primary ring-offset-2'
                                    : 'bg-brand-colors-HarvestMist'
                        )}
                        aria-hidden="true"
                    />
                ))}
            </div>
        </div>
    );
}

export default ProgressBar;
