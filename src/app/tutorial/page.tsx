'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { TutorialCard } from '@/components/TutorialCard';
import { useLearning } from '@/context/LearningContext';

export default function TutorialPage() {
    const router = useRouter();
    const {
        documentContent,
        tutorial,
        isLoadingTutorial,
        tutorialError,
        generateTutorial,
    } = useLearning();

    // Redirect if no document
    useEffect(() => {
        if (!documentContent) {
            router.push('/');
        } else if (!tutorial && !isLoadingTutorial && !tutorialError) {
            generateTutorial();
        }
    }, [documentContent, tutorial, isLoadingTutorial, tutorialError, generateTutorial, router]);

    // Loading state
    if (isLoadingTutorial) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-500/10 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Generating Your Tutorial
                        </h2>
                        <p className="text-muted-foreground">
                            Gemini AI is analyzing your document and creating a personalized learning experience...
                        </p>
                        <div className="mt-6 flex justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (tutorialError) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Failed to Generate Tutorial
                        </h2>
                        <p className="text-muted-foreground mb-6">{tutorialError}</p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="secondary" onClick={() => router.push('/')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                            <Button onClick={() => generateTutorial()}>
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No tutorial yet
    if (!tutorial) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            No Tutorial Available
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Upload a document first to generate a tutorial.
                        </p>
                        <Button onClick={() => router.push('/')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Upload Document
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Tutorial display
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <span>AI-Generated Tutorial</span>
                </div>
            </div>

            {/* Tutorial Card */}
            <TutorialCard tutorial={tutorial} />

            {/* Actions */}
            <div className="mt-8 flex justify-center gap-4">
                <Button variant="secondary" onClick={() => router.push('/learn')}>
                    Take Quiz Instead
                </Button>
                <Button onClick={() => generateTutorial()}>
                    Regenerate Tutorial
                </Button>
            </div>
        </div>
    );
}
