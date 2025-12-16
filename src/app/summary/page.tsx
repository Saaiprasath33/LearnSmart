'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SummaryCard } from '@/components/SummaryCard';
import { useLearning } from '@/context/LearningContext';

export default function SummaryPage() {
    const router = useRouter();
    const {
        documentContent,
        summary,
        isLoadingSummary,
        summaryError,
        generateSummary,
    } = useLearning();

    // Redirect if no document
    useEffect(() => {
        if (!documentContent) {
            router.push('/');
        } else if (!summary && !isLoadingSummary && !summaryError) {
            generateSummary();
        }
    }, [documentContent, summary, isLoadingSummary, summaryError, generateSummary, router]);

    // Loading state
    if (isLoadingSummary) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" />
                            <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mt-6">
                            Generating Summary...
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Analyzing your document and extracting key information
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (summaryError) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 rounded-full bg-red-500/10">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mt-6">
                            Failed to Generate Summary
                        </h2>
                        <p className="text-muted-foreground mt-2 text-center max-w-md">
                            {summaryError}
                        </p>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={() => generateSummary()} variant="primary">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button onClick={() => router.push('/')} variant="secondary">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No document state
    if (!documentContent) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 rounded-full bg-muted">
                            <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mt-6">
                            No Document Found
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Upload a document first to generate a summary.
                        </p>
                        <Button onClick={() => router.push('/')} className="mt-6">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Upload Document
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Summary display
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button onClick={() => router.push('/')} variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
                <Button onClick={() => generateSummary()} variant="secondary" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                </Button>
            </div>

            {/* Summary Card */}
            {summary && <SummaryCard summary={summary} />}

            {/* Video Generation Section */}
            {summary && (
                <div className="mt-8">
                    <VideoGenerator
                        content={documentContent || summary.mainIdea}
                        title={summary.title}
                    />
                </div>
            )}
        </div>
    );
}

function VideoGenerator({ content, title }: { content: string; title: string }) {
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleGenerateVideo = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await fetch('/api/video/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate video');
            }

            const data = await response.json();
            setVideoUrl(data.videoUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-1">AI Video Summary</h3>
                        <p className="text-muted-foreground">
                            Generate a short video presentation of this summary.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 p-4 rounded-lg flex items-center gap-3 text-red-500 mb-4">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!videoUrl ? (
                    <Button
                        onClick={handleGenerateVideo}
                        disabled={isGenerating}
                        className="w-full sm:w-auto"
                        variant="primary"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Video (this may take a minute)...
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-4 h-4 mr-2" /> {/* Using generic icon as placeholder if Play not imported, adding Play import next */}
                                Generate Video
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-full"
                                poster="/video-placeholder.png"
                            />
                        </div>
                        <Button
                            onClick={handleGenerateVideo}
                            variant="secondary"
                            className="w-full sm:w-auto"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate Video
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
