'use client';

import React from 'react';
import { FileText, BookOpen, CheckCircle, List, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { SummaryResponse } from '@/lib/prompts';

interface SummaryCardProps {
    summary: SummaryResponse;
}

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    colorClass?: string;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true, colorClass = 'text-primary-500' }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

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

export function SummaryCard({ summary }: SummaryCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-border">
                <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20">
                        <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{summary.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            ~{summary.wordCount.toLocaleString()} words
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Main Idea */}
                <div className="p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Main Idea
                    </h3>
                    <p className="text-foreground leading-relaxed">{summary.mainIdea}</p>
                </div>

                {/* Key Points */}
                <CollapsibleSection
                    title="Key Points"
                    icon={<List className="w-5 h-5" />}
                    colorClass="text-green-500"
                    defaultOpen={true}
                >
                    <ul className="space-y-3">
                        {summary.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs">
                                    {index + 1}
                                </span>
                                <span className="text-foreground">{point}</span>
                            </li>
                        ))}
                    </ul>
                </CollapsibleSection>

                {/* Sections */}
                <CollapsibleSection
                    title="Document Sections"
                    icon={<BookOpen className="w-5 h-5" />}
                    colorClass="text-purple-500"
                    defaultOpen={true}
                >
                    <div className="space-y-4">
                        {summary.sections.map((section, index) => (
                            <div key={index} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    {section.heading}
                                </h4>
                                <p className="text-muted-foreground leading-relaxed pl-8">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Conclusion */}
                <div className="p-4 bg-muted rounded-xl border border-border">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Conclusion
                    </h3>
                    <p className="text-foreground leading-relaxed">{summary.conclusion}</p>
                </div>
            </CardContent>
        </Card>
    );
}
