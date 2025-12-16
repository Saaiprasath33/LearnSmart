'use client';

import React, { useState } from 'react';
import { HelpCircle, Send, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Question } from '@/lib/prompts';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    existingAnswer?: string;
    isEvaluating?: boolean;
    hasBeenAnswered?: boolean;
    onSubmit: (answer: string) => void;
}

export function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    existingAnswer = '',
    isEvaluating = false,
    hasBeenAnswered = false,
    onSubmit,
}: QuestionCardProps) {
    const [answer, setAnswer] = useState(existingAnswer);

    const handleSubmit = () => {
        if (answer.trim().length >= 10) {
            onSubmit(answer.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <Card className="animate-slide-up">
            <CardContent>
                {/* Question header */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                        {questionNumber}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <HelpCircle className="w-4 h-4" />
                            <span>Question {questionNumber} of {totalQuestions}</span>
                        </div>
                        <p className="text-lg font-medium text-foreground leading-relaxed">
                            {question.question}
                        </p>
                    </div>
                </div>

                {/* Answer input */}
                <div className="space-y-4">
                    <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer here... (Ctrl+Enter to submit)"
                        rows={5}
                        disabled={isEvaluating || hasBeenAnswered}
                        helperText={
                            hasBeenAnswered
                                ? 'You have already answered this question'
                                : `Minimum 10 characters (${answer.length} / 10)`
                        }
                    />

                    {!hasBeenAnswered && (
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={answer.trim().length < 10 || isEvaluating}
                                isLoading={isEvaluating}
                            >
                                {isEvaluating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Evaluating...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Answer
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
