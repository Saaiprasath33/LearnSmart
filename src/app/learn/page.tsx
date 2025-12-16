'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { QuestionCard } from '@/components/QuestionCard';
import { FeedbackCard } from '@/components/FeedbackCard';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { useLearning } from '@/context/LearningContext';

export default function LearnPage() {
    const router = useRouter();
    const {
        questions,
        isLoadingQuestions,
        answers,
        currentQuestionIndex,
        submitAnswer,
        goToNextQuestion,
        goToPreviousQuestion,
        completeSession,
        documentContent,
        generateQuestions,
    } = useLearning();

    // Redirect if no document
    useEffect(() => {
        if (!documentContent) {
            router.push('/');
        } else if (questions.length === 0 && !isLoadingQuestions) {
            generateQuestions();
        }
    }, [documentContent, questions.length, isLoadingQuestions, router, generateQuestions]);

    // Get answered question IDs
    const answeredQuestions = useMemo(() => {
        const answered = new Set<number>();
        answers.forEach((_, questionId) => {
            answered.add(questionId);
        });
        return answered;
    }, [answers]);

    // Current question
    const currentQuestion = questions[currentQuestionIndex];

    // Current answer and feedback
    const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;

    // Check if all questions are answered
    const allAnswered = questions.length > 0 && answeredQuestions.size === questions.length;

    // Progress percentage
    const progressValue = questions.length > 0
        ? (answeredQuestions.size / questions.length) * 100
        : 0;

    const handleSubmitAnswer = async (answer: string) => {
        if (currentQuestion) {
            await submitAnswer(currentQuestion.id, answer);
        }
    };

    const handleComplete = () => {
        completeSession();
        router.push('/results');
    };

    // Loading state
    if (isLoadingQuestions) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 mb-4">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Analyzing Your Document
                    </h2>
                    <p className="text-muted-foreground">
                        Generating personalized questions...
                    </p>
                </div>
            </div>
        );
    }

    // No questions yet
    if (questions.length === 0) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">No questions available.</p>
                    <Button className="mt-4" onClick={() => router.push('/')}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Test Your Understanding
                    </h1>
                    <p className="text-muted-foreground">
                        Answer each question to receive personalized feedback
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-8 space-y-4">
                    <Progress value={progressValue} max={100} showLabel />
                    <ProgressIndicator
                        current={currentQuestionIndex}
                        total={questions.length}
                        answeredQuestions={answeredQuestions}
                    />
                </div>

                {/* Current Question */}
                {currentQuestion && (
                    <div className="space-y-6">
                        <QuestionCard
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={questions.length}
                            existingAnswer={currentAnswer?.answer || ''}
                            isEvaluating={currentAnswer?.isEvaluating || false}
                            hasBeenAnswered={!!currentAnswer?.feedback}
                            onSubmit={handleSubmitAnswer}
                        />

                        {/* Feedback */}
                        {currentAnswer?.feedback && (
                            <FeedbackCard
                                feedback={currentAnswer.feedback}
                                questionNumber={currentQuestionIndex + 1}
                            />
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                    <Button
                        variant="secondary"
                        onClick={goToPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    {allAnswered ? (
                        <Button onClick={handleComplete}>
                            <CheckCircle className="w-4 h-4" />
                            View Results
                        </Button>
                    ) : currentQuestionIndex < questions.length - 1 ? (
                        <Button
                            onClick={goToNextQuestion}
                            disabled={!currentAnswer?.feedback}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            {!currentAnswer?.feedback && 'Answer this question to continue'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
