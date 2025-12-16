'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Brain, Target, Zap, ArrowRight, FileText, MessageSquare, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { DocumentUpload } from '@/components/DocumentUpload';
import { useLearning } from '@/context/LearningContext';

export default function HomePage() {
    const router = useRouter();
    const { documentContent, generateQuestions, isLoadingQuestions, questionsError, questions, isLoadingTutorial, isLoadingSummary } = useLearning();

    const handleStartLearning = async () => {
        if (!documentContent) return;

        if (questions.length === 0) {
            await generateQuestions();
        }

        router.push('/learn');
    };

    return (
        <div className="min-h-[calc(100vh-8rem)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-12 sm:py-20">
                {/* Background gradient */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Powered by Gemini 2.5 Flash
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
                            Learn Smarter with{' '}
                            <span className="gradient-text">AI-Generated</span>{' '}
                            Questions
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Upload any document and get personalized, thought-provoking questions
                            with instant AI feedback to deepen your understanding.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card hover className="text-center">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                                    <Brain className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Deep Analysis</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI analyzes your document to create higher-order thinking questions
                                </p>
                            </CardContent>
                        </Card>

                        <Card hover className="text-center">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-accent-500/10 flex items-center justify-center mb-4">
                                    <Target className="w-6 h-6 text-accent-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Personalized Feedback</h3>
                                <p className="text-sm text-muted-foreground">
                                    Get detailed feedback on your answers with improvement tips
                                </p>
                            </CardContent>
                        </Card>

                        <Card hover className="text-center">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Fast & Free</h3>
                                <p className="text-sm text-muted-foreground">
                                    Optimized for Gemini free tier with intelligent caching
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upload Section */}
                    <div className="max-w-2xl mx-auto">
                        <Card className="p-2">
                            <CardContent>
                                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary-500" />
                                    Upload Your Document
                                </h2>

                                <DocumentUpload />

                                {questionsError && (
                                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                                        <p className="text-sm">{questionsError}</p>
                                    </div>
                                )}

                                {documentContent && (
                                    <div className="mt-6 space-y-3">
                                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                                            <Button
                                                size="lg"
                                                onClick={handleStartLearning}
                                                isLoading={isLoadingQuestions}
                                                disabled={isLoadingQuestions || isLoadingTutorial || isLoadingSummary}
                                            >
                                                {isLoadingQuestions ? (
                                                    'Generating Questions...'
                                                ) : (
                                                    <>
                                                        Start Quiz
                                                        <ArrowRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="secondary"
                                                onClick={() => router.push('/summary')}
                                                isLoading={isLoadingSummary}
                                                disabled={isLoadingQuestions || isLoadingTutorial || isLoadingSummary}
                                            >
                                                {isLoadingSummary ? (
                                                    'Generating Summary...'
                                                ) : (
                                                    <>
                                                        <FileText className="w-5 h-5" />
                                                        Summarize
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <div className="flex justify-center">
                                            <Button
                                                size="lg"
                                                variant="ghost"
                                                onClick={() => router.push('/tutorial')}
                                                isLoading={isLoadingTutorial}
                                                disabled={isLoadingQuestions || isLoadingTutorial || isLoadingSummary}
                                            >
                                                {isLoadingTutorial ? (
                                                    'Generating Tutorial...'
                                                ) : (
                                                    <>
                                                        <BookOpen className="w-5 h-5" />
                                                        Generate Tutorial
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* How it works */}
                    <div className="mt-16 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                            How It Works
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                                    1
                                </div>
                                <div className="flex items-center gap-2 text-foreground font-medium mb-2">
                                    <FileText className="w-5 h-5 text-primary-500" />
                                    Upload
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Upload your study material or paste text content
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                                    2
                                </div>
                                <div className="flex items-center gap-2 text-foreground font-medium mb-2">
                                    <MessageSquare className="w-5 h-5 text-primary-500" />
                                    Answer
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Respond to 5 AI-generated higher-order questions
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                                    3
                                </div>
                                <div className="flex items-center gap-2 text-foreground font-medium mb-2">
                                    <Award className="w-5 h-5 text-primary-500" />
                                    Improve
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Get personalized feedback and improvement tips
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
