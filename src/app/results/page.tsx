'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, RotateCcw, Home, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FeedbackCard } from '@/components/FeedbackCard';
import { useLearning } from '@/context/LearningContext';

export default function ResultsPage() {
    const router = useRouter();
    const { questions, answers, resetSession, isSessionComplete } = useLearning();

    // Redirect if no completed session
    useEffect(() => {
        if (!isSessionComplete || questions.length === 0) {
            router.push('/');
        }
    }, [isSessionComplete, questions.length, router]);

    // Calculate overall stats
    const stats = useMemo(() => {
        let totalScore = 0;
        let answeredCount = 0;

        answers.forEach((answer) => {
            if (answer.feedback) {
                const scoreMatch = answer.feedback.score.match(/(\d+)/);
                if (scoreMatch) {
                    totalScore += parseInt(scoreMatch[1], 10);
                    answeredCount++;
                }
            }
        });

        const averageScore = answeredCount > 0 ? totalScore / answeredCount : 0;
        const maxPossible = answeredCount * 10;

        return {
            totalScore,
            answeredCount,
            averageScore,
            maxPossible,
            percentage: maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0,
        };
    }, [answers]);

    // Get performance level
    const getPerformanceLevel = (percentage: number) => {
        if (percentage >= 80) return { label: 'Excellent!', color: 'text-green-500', bgColor: 'bg-green-500/10' };
        if (percentage >= 60) return { label: 'Good Job!', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
        if (percentage >= 40) return { label: 'Keep Practicing', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
        return { label: 'Needs Improvement', color: 'text-red-500', bgColor: 'bg-red-500/10' };
    };

    const performance = getPerformanceLevel(stats.percentage);

    const handleRestart = () => {
        resetSession();
        router.push('/');
    };

    if (!isSessionComplete || questions.length === 0) {
        return null;
    }

    return (
        <div className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white mb-4">
                        <Trophy className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Session Complete!
                    </h1>
                    <p className="text-muted-foreground">
                        Here&apos;s a summary of your learning session
                    </p>
                </div>

                {/* Overall Score Card */}
                <Card className="mb-8">
                    <CardContent className="py-8">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            {/* Score Circle */}
                            <div className="relative">
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        className="stroke-muted"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        className="stroke-primary-500"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - stats.percentage / 100)}`}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-foreground">
                                            {Math.round(stats.percentage)}%
                                        </span>
                                        <p className="text-sm text-muted-foreground">Score</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-4">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bgColor} ${performance.color} font-medium`}>
                                    <TrendingUp className="w-4 h-4" />
                                    {performance.label}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 rounded-xl bg-muted">
                                        <p className="text-2xl font-bold text-foreground">
                                            {stats.totalScore}/{stats.maxPossible}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Total Points</p>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-muted">
                                        <p className="text-2xl font-bold text-foreground">
                                            {stats.averageScore.toFixed(1)}/10
                                        </p>
                                        <p className="text-sm text-muted-foreground">Avg Score</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Question by Question Review */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                            Detailed Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {questions.map((question, index) => {
                                const answer = answers.get(question.id);
                                const scoreMatch = answer?.feedback?.score.match(/(\d+)/);
                                const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
                                const isGood = score >= 7;

                                return (
                                    <div key={question.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                                        {/* Question Summary */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`
                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                        ${isGood ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}
                      `}>
                                                {isGood ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        Question {index + 1}
                                                    </span>
                                                    <span className={`
                            px-2 py-1 rounded text-sm font-medium
                            ${isGood ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}
                          `}>
                                                        {answer?.feedback?.score}
                                                    </span>
                                                </div>
                                                <p className="text-foreground">{question.question}</p>
                                            </div>
                                        </div>

                                        {/* Your Answer */}
                                        {answer?.answer && (
                                            <div className="ml-12 mb-4">
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Your Answer:</p>
                                                <p className="text-foreground bg-muted p-3 rounded-xl text-sm">
                                                    {answer.answer}
                                                </p>
                                            </div>
                                        )}

                                        {/* Feedback Preview */}
                                        {answer?.feedback && (
                                            <div className="ml-12">
                                                <FeedbackCard
                                                    feedback={answer.feedback}
                                                    questionNumber={index + 1}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button variant="secondary" onClick={handleRestart}>
                        <RotateCcw className="w-4 h-4" />
                        Start New Session
                    </Button>
                    <Button onClick={() => router.push('/')}>
                        <Home className="w-4 h-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
