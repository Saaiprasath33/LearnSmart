'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
    current: number;
    total: number;
    answeredQuestions: Set<number>;
}

export function ProgressIndicator({ current, total, answeredQuestions }: ProgressIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: total }, (_, i) => {
                const questionNum = i + 1;
                const isAnswered = answeredQuestions.has(questionNum);
                const isCurrent = current === i;

                return (
                    <div
                        key={questionNum}
                        className={`
              w-10 h-10 rounded-xl flex items-center justify-center font-medium
              transition-all duration-300
              ${isCurrent && !isAnswered
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110'
                                : isAnswered
                                    ? 'bg-green-500 text-white'
                                    : 'bg-muted text-muted-foreground'
                            }
            `}
                    >
                        {isAnswered ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            questionNum
                        )}
                    </div>
                );
            })}
        </div>
    );
}
