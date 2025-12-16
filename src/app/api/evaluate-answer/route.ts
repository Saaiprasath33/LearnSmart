/**
 * API Route: Evaluate Answer
 * POST /api/evaluate-answer
 * 
 * Evaluates a user's answer to a question and provides personalized feedback
 * Single API call per answer - optimized for free tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer, isGeminiConfigured } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        // Check API configuration
        if (!isGeminiConfigured()) {
            return NextResponse.json(
                { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { question, answer, context } = body;

        // Validate required fields
        if (!question || typeof question !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid question' },
                { status: 400 }
            );
        }

        if (!answer || typeof answer !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid answer' },
                { status: 400 }
            );
        }

        if (!context || typeof context !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid context (document summary)' },
                { status: 400 }
            );
        }

        if (answer.trim().length < 10) {
            return NextResponse.json(
                { error: 'Answer too short. Please provide a more detailed response.' },
                { status: 400 }
            );
        }

        // Evaluate the answer
        console.log('Evaluating answer for question:', question.substring(0, 50) + '...');

        const evaluation = await evaluateAnswer(question, answer, context);

        return NextResponse.json({
            ...evaluation,
            success: true,
        });

    } catch (error) {
        console.error('Error in evaluate-answer API:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to evaluate answer',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            { status: 500 }
        );
    }
}
