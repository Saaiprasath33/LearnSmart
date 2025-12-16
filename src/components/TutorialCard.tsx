'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Route, Dumbbell, Lightbulb, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { TutorialResponse, TutorialSection } from '@/lib/prompts';

interface TutorialCardProps {
    tutorial: TutorialResponse;
}

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    colorClass?: string;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true, colorClass = 'text-primary-500' }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
            >
                <span className={colorClass}>{icon}</span>
                <span className="font-semibold text-foreground flex-1">{title}</span>
                {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 bg-card animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
}

function ConceptCard({ concept, index }: { concept: TutorialSection; index: number }) {
    return (
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                </span>
                <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2">{concept.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{concept.content}</p>
                    {concept.keyPoints && concept.keyPoints.length > 0 && (
                        <div className="space-y-1">
                            {concept.keyPoints.map((point, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground">{point}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border-b border-border">
                <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-500/20">
                        <BookOpen className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{tutorial.title}</h2>
                        <p className="text-sm text-muted-foreground font-normal mt-1">
                            AI-Generated Tutorial
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Overview */}
                <div className="p-4 bg-primary-500/5 rounded-xl border border-primary-500/20">
                    <p className="text-foreground leading-relaxed">{tutorial.overview}</p>
                </div>

                {/* Concepts */}
                <CollapsibleSection
                    title={`Key Concepts (${tutorial.concepts.length})`}
                    icon={<Lightbulb className="w-5 h-5" />}
                    colorClass="text-yellow-500"
                >
                    <div className="space-y-4">
                        {tutorial.concepts.map((concept, index) => (
                            <ConceptCard key={index} concept={concept} index={index} />
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Learning Path */}
                <CollapsibleSection
                    title="Learning Path"
                    icon={<Route className="w-5 h-5" />}
                    colorClass="text-blue-500"
                >
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                        <div className="space-y-6">
                            {tutorial.learningPath.map((step, index) => (
                                <div key={index} className="relative pl-12">
                                    <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
                                        <p className="text-muted-foreground text-sm">{step.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Practice Exercises */}
                <CollapsibleSection
                    title={`Practice Exercises (${tutorial.exercises.length})`}
                    icon={<Dumbbell className="w-5 h-5" />}
                    colorClass="text-green-500"
                    defaultOpen={false}
                >
                    <div className="space-y-4">
                        {tutorial.exercises.map((exercise, index) => (
                            <div key={index} className="p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                                <p className="font-medium text-foreground mb-2">
                                    <span className="text-green-500 mr-2">Q{index + 1}:</span>
                                    {exercise.question}
                                </p>
                                <details className="group">
                                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        💡 Show hint
                                    </summary>
                                    <p className="mt-2 text-sm text-muted-foreground pl-4 border-l-2 border-green-500/30">
                                        {exercise.hint}
                                    </p>
                                </details>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Summary */}
                <div className="p-4 bg-muted rounded-xl border border-border">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary-500" />
                        Key Takeaways
                    </h3>
                    <p className="text-muted-foreground">{tutorial.summary}</p>
                </div>
            </CardContent>
        </Card>
    );
}
