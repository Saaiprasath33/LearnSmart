'use client';

/**
 * Learning Context
 * Global state management for document, questions, answers, feedback, and summaries
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Question, EvaluationResponse, TutorialResponse, SummaryResponse } from '@/lib/prompts';

// Answer with evaluation feedback
interface AnswerWithFeedback {
    questionId: number;
    answer: string;
    feedback: EvaluationResponse | null;
    isEvaluating: boolean;
}

// Learning session state
interface LearningState {
    // Document
    documentContent: string | null;
    documentSummary: string | null;

    // Questions
    questions: Question[];
    isLoadingQuestions: boolean;
    questionsError: string | null;

    // Answers and feedback
    answers: Map<number, AnswerWithFeedback>;
    currentQuestionIndex: number;

    // Tutorial
    tutorial: TutorialResponse | null;
    isLoadingTutorial: boolean;
    tutorialError: string | null;

    // Summary
    summary: SummaryResponse | null;
    isLoadingSummary: boolean;
    summaryError: string | null;

    // Session
    isSessionComplete: boolean;
}

// Context actions
interface LearningActions {
    // Document
    setDocument: (content: string) => void;
    clearDocument: () => void;

    // Questions
    generateQuestions: () => Promise<void>;

    // Tutorial
    generateTutorial: () => Promise<void>;

    // Summary
    generateSummary: () => Promise<void>;

    // Answers
    submitAnswer: (questionId: number, answer: string) => Promise<void>;
    goToNextQuestion: () => void;
    goToPreviousQuestion: () => void;

    // Session
    resetSession: () => void;
    completeSession: () => void;
}

type LearningContextType = LearningState & LearningActions;

const LearningContext = createContext<LearningContextType | null>(null);

// Initial state
const initialState: LearningState = {
    documentContent: null,
    documentSummary: null,
    questions: [],
    isLoadingQuestions: false,
    questionsError: null,
    answers: new Map(),
    currentQuestionIndex: 0,
    tutorial: null,
    isLoadingTutorial: false,
    tutorialError: null,
    summary: null,
    isLoadingSummary: false,
    summaryError: null,
    isSessionComplete: false,
};

export function LearningProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<LearningState>(initialState);

    // Set document content
    const setDocument = useCallback((content: string) => {
        setState(prev => ({
            ...prev,
            documentContent: content,
            documentSummary: null,
            questions: [],
            questionsError: null,
            answers: new Map(),
            currentQuestionIndex: 0,
            isSessionComplete: false,
        }));
    }, []);

    // Clear document and reset
    const clearDocument = useCallback(() => {
        setState(initialState);
    }, []);

    // Generate questions from document
    const generateQuestions = useCallback(async () => {
        if (!state.documentContent) {
            setState(prev => ({ ...prev, questionsError: 'No document uploaded' }));
            return;
        }

        setState(prev => ({ ...prev, isLoadingQuestions: true, questionsError: null }));

        try {
            const response = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: state.documentContent }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate questions');
            }

            setState(prev => ({
                ...prev,
                questions: data.questions,
                documentSummary: data.summary,
                isLoadingQuestions: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoadingQuestions: false,
                questionsError: error instanceof Error ? error.message : 'Failed to generate questions',
            }));
        }
    }, [state.documentContent]);

    // Submit and evaluate an answer
    const submitAnswer = useCallback(async (questionId: number, answer: string) => {
        if (!state.documentSummary) return;

        const question = state.questions.find(q => q.id === questionId);
        if (!question) return;

        // Set evaluating state
        setState(prev => {
            const newAnswers = new Map(prev.answers);
            newAnswers.set(questionId, {
                questionId,
                answer,
                feedback: null,
                isEvaluating: true,
            });
            return { ...prev, answers: newAnswers };
        });

        try {
            const response = await fetch('/api/evaluate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.question,
                    answer,
                    context: state.documentSummary,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to evaluate answer');
            }

            setState(prev => {
                const newAnswers = new Map(prev.answers);
                newAnswers.set(questionId, {
                    questionId,
                    answer,
                    feedback: {
                        score: data.score,
                        strengths: data.strengths,
                        gaps: data.gaps,
                        personalized_feedback: data.personalized_feedback,
                        improvement_tip: data.improvement_tip,
                    },
                    isEvaluating: false,
                });
                return { ...prev, answers: newAnswers };
            });
        } catch (error) {
            setState(prev => {
                const newAnswers = new Map(prev.answers);
                newAnswers.set(questionId, {
                    questionId,
                    answer,
                    feedback: null,
                    isEvaluating: false,
                });
                return { ...prev, answers: newAnswers };
            });
            console.error('Error evaluating answer:', error);
        }
    }, [state.documentSummary, state.questions]);

    // Navigation
    const goToNextQuestion = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1),
        }));
    }, []);

    const goToPreviousQuestion = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
        }));
    }, []);

    // Session management
    const resetSession = useCallback(() => {
        setState(initialState);
    }, []);

    const completeSession = useCallback(() => {
        setState(prev => ({ ...prev, isSessionComplete: true }));
    }, []);

    // Generate tutorial from document
    const generateTutorial = useCallback(async () => {
        if (!state.documentContent) {
            setState(prev => ({ ...prev, tutorialError: 'No document uploaded' }));
            return;
        }

        setState(prev => ({ ...prev, isLoadingTutorial: true, tutorialError: null }));

        try {
            const response = await fetch('/api/generate-tutorial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: state.documentContent }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate tutorial');
            }

            setState(prev => ({
                ...prev,
                tutorial: data.tutorial,
                isLoadingTutorial: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoadingTutorial: false,
                tutorialError: error instanceof Error ? error.message : 'Failed to generate tutorial',
            }));
        }
    }, [state.documentContent]);

    // Generate summary from document
    const generateSummary = useCallback(async () => {
        if (!state.documentContent) {
            setState(prev => ({ ...prev, summaryError: 'No document uploaded' }));
            return;
        }

        setState(prev => ({ ...prev, isLoadingSummary: true, summaryError: null }));

        try {
            const response = await fetch('/api/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: state.documentContent }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate summary');
            }

            setState(prev => ({
                ...prev,
                summary: data.summary,
                isLoadingSummary: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoadingSummary: false,
                summaryError: error instanceof Error ? error.message : 'Failed to generate summary',
            }));
        }
    }, [state.documentContent]);

    const value: LearningContextType = {
        ...state,
        setDocument,
        clearDocument,
        generateQuestions,
        generateTutorial,
        generateSummary,
        submitAnswer,
        goToNextQuestion,
        goToPreviousQuestion,
        resetSession,
        completeSession,
    };

    return (
        <LearningContext.Provider value={value}>
            {children}
        </LearningContext.Provider>
    );
}

export function useLearning() {
    const context = useContext(LearningContext);
    if (!context) {
        throw new Error('useLearning must be used within a LearningProvider');
    }
    return context;
}
