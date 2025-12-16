'use client';

import React from 'react';
import { CheckCircle, XCircle, Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { EvaluationResponse } from '@/lib/prompts';

interface FeedbackCardProps {
    feedback: EvaluationResponse;
    questionNumber: number;
}

export function FeedbackCard({ feedback, questionNumber }: FeedbackCardProps) {
    // Parse score (e.g., "8/10" -> 8)
    const scoreMatch = feedback.score.match(/(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 5;

    // Determine score color
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-500 bg-green-500/10';
        if (score >= 6) return 'text-yellow-500 bg-yellow-500/10';
        if (score >= 4) return 'text-orange-500 bg-orange-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    return (
        <Card className="animate-slide-up border-primary-500/20">
            <CardContent>
                {/* Header with score */}
                <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary-500" />
                        Feedback for Question {questionNumber}
                    </h4>
                    <div className={`px-4 py-2 rounded-xl font-bold text-lg ${getScoreColor(score)}`}>
                        {feedback.score}
                    </div>
                </div>

                {/* Feedback sections */}
                <div className="space-y-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-700 dark:text-green-400 mb-1">
                                    Strengths
                                </p>
                                <p className="text-foreground">{feedback.strengths}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gaps */}
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-orange-700 dark:text-orange-400 mb-1">
                                    Areas for Improvement
                                </p>
                                <p className="text-foreground">{feedback.gaps}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personalized Feedback */}
                    <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-primary-700 dark:text-primary-400 mb-1">
                                    Personalized Feedback
                                </p>
                                <p className="text-foreground">{feedback.personalized_feedback}</p>
                            </div>
                        </div>
                    </div>

                    {/* Improvement Tip */}
                    <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                                    💡 Improvement Tip
                                </p>
                                <p className="text-foreground">{feedback.improvement_tip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
