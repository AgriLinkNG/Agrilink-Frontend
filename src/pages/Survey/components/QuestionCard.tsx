import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Question } from '../types/survey.types';

interface QuestionCardProps {
    question: Question;
    value: any;
    onChange: (value: any) => void;
    otherValue?: string;
    onOtherChange?: (value: string) => void;
    error?: string;
    otherError?: string;
    className?: string;
}

export function QuestionCard({ question, value, onChange, otherValue, onOtherChange, error, otherError, className }: QuestionCardProps) {
    const hasOtherOption = question.options?.some((opt) => opt.value === 'other');
    const isOtherSelected = question.type === 'multiple_choice'
        ? (value as string[])?.includes('other')
        : value === 'other';

    const renderInput = () => {
        switch (question.type) {
            case 'single_choice':
            case 'conditional':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => (
                            <label
                                key={option.value}
                                className={cn(
                                    'flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                                    value === option.value
                                        ? 'border-primary bg-brand-colors-HarvestMist'
                                        : 'border-brand-colors-HarvestMist hover:border-primary/50'
                                )}
                            >
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="w-5 h-5 text-primary focus:ring-primary"
                                />
                                <span
                                    className="text-gray-700"
                                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                                >
                                    {option.label}
                                </span>
                            </label>
                        ))}
                        {hasOtherOption && isOtherSelected && (
                            <div className="mt-3 ml-8">
                                <Input
                                    type="text"
                                    value={otherValue || ''}
                                    onChange={(e) => onOtherChange?.(e.target.value)}
                                    placeholder="Please specify..."
                                    className={cn(
                                        'w-full p-3 rounded-xl border-2',
                                        otherError
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-brand-colors-HarvestMist focus:border-primary'
                                    )}
                                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                                />
                                {otherError && (
                                    <p
                                        className="mt-1 text-sm text-red-500"
                                        style={{ fontFamily: 'MadaniArabic-Medium' }}
                                    >
                                        {otherError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'multiple_choice':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => (
                            <label
                                key={option.value}
                                className={cn(
                                    'flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                                    (value as string[])?.includes(option.value)
                                        ? 'border-primary bg-brand-colors-HarvestMist'
                                        : 'border-brand-colors-HarvestMist hover:border-primary/50'
                                )}
                            >
                                <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={(value as string[])?.includes(option.value) || false}
                                    onChange={(e) => {
                                        const currentValues = (value as string[]) || [];
                                        if (e.target.checked) {
                                            onChange([...currentValues, option.value]);
                                        } else {
                                            onChange(currentValues.filter((v) => v !== option.value));
                                        }
                                    }}
                                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                                />
                                <span
                                    className="text-gray-700"
                                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                                >
                                    {option.label}
                                </span>
                            </label>
                        ))}
                        {hasOtherOption && isOtherSelected && (
                            <div className="mt-3 ml-8">
                                <Input
                                    type="text"
                                    value={otherValue || ''}
                                    onChange={(e) => onOtherChange?.(e.target.value)}
                                    placeholder="Please specify..."
                                    className={cn(
                                        'w-full p-3 rounded-xl border-2',
                                        otherError
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-brand-colors-HarvestMist focus:border-primary'
                                    )}
                                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                                />
                                {otherError && (
                                    <p
                                        className="mt-1 text-sm text-red-500"
                                        style={{ fontFamily: 'MadaniArabic-Medium' }}
                                    >
                                        {otherError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'scale':
                const min = question.scaleMin || 1;
                const max = question.scaleMax || 5;
                const scaleValues = Array.from({ length: max - min + 1 }, (_, i) => min + i);

                return (
                    <div className="space-y-4">
                        <div className="flex justify-between gap-2">
                            {scaleValues.map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => onChange(num)}
                                    className={cn(
                                        'flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-200',
                                        value === num
                                            ? 'bg-primary text-white shadow-md scale-105'
                                            : 'bg-brand-colors-HarvestMist text-gray-600 hover:bg-primary/20'
                                    )}
                                    style={{ fontFamily: 'MadaniArabic-Bold' }}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        {question.scaleLabels && (
                            <div className="flex justify-between text-sm text-gray-500">
                                <span style={{ fontFamily: 'MadaniArabic-Regular' }}>
                                    {question.scaleLabels.min}
                                </span>
                                <span style={{ fontFamily: 'MadaniArabic-Regular' }}>
                                    {question.scaleLabels.max}
                                </span>
                            </div>
                        )}
                    </div>
                );

            case 'ranking':
                const rankingValue = value || {};
                const usedRanks = Object.values(rankingValue) as number[];

                return (
                    <div className="space-y-4">
                        {question.options?.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-brand-colors-HarvestMist"
                            >
                                <span
                                    className="text-gray-700 flex-1"
                                    style={{ fontFamily: 'MadaniArabic-Medium' }}
                                >
                                    {option.label}
                                </span>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((rank) => (
                                        <button
                                            key={rank}
                                            type="button"
                                            disabled={usedRanks.includes(rank) && rankingValue[option.value] !== rank}
                                            onClick={() => {
                                                const newValue = { ...rankingValue };
                                                // Clear any previous rank for this option
                                                newValue[option.value] = rank;
                                                onChange(newValue);
                                            }}
                                            className={cn(
                                                'w-10 h-10 rounded-full font-bold transition-all duration-200',
                                                rankingValue[option.value] === rank
                                                    ? 'bg-primary text-white'
                                                    : usedRanks.includes(rank)
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primary'
                                            )}
                                            style={{ fontFamily: 'MadaniArabic-Bold' }}
                                        >
                                            {rank}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'MadaniArabic-Regular' }}>
                            Click a number to assign rank. 1 = most important.
                        </p>
                    </div>
                );

            case 'text':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        rows={4}
                        className={cn(
                            'w-full p-4 rounded-2xl border-2 bg-brand-colors-HarvestMist',
                            'border-brand-colors-HarvestMist focus:border-primary focus:outline-none',
                            'resize-none transition-colors'
                        )}
                        style={{ fontFamily: 'MadaniArabic-Regular' }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                'bg-white p-6 md:p-8 rounded-3xl shadow-md border border-green-100',
                'animate-in fade-in slide-in-from-bottom-4 duration-500',
                className
            )}
        >
            {/* Question text */}
            <Label
                className="block text-lg md:text-xl text-gray-900 mb-2"
                style={{ fontFamily: 'MadaniArabic-Bold' }}
            >
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {/* Description */}
            {question.description && (
                <p
                    className="text-gray-600 text-sm mb-6 leading-relaxed"
                    style={{ fontFamily: 'MadaniArabic-Regular' }}
                >
                    {question.description}
                </p>
            )}

            {/* Input */}
            <div className="mt-4">{renderInput()}</div>

            {/* Error message */}
            {error && (
                <p
                    className="mt-3 text-sm text-red-500"
                    style={{ fontFamily: 'MadaniArabic-Medium' }}
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

export default QuestionCard;
