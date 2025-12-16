/**
 * API Route: Generate Questions
 * POST /api/generate-questions
 * 
 * Generates 5 higher-order questions from uploaded document content
 * Uses caching to avoid repeated API calls for the same document
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions, generateDocumentSummary, isGeminiConfigured } from '@/lib/gemini';
import { hashDocument, getCachedQuestions, setCachedQuestions } from '@/lib/cache';

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
        const { content } = body;

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid document content' },
                { status: 400 }
            );
        }

        if (content.length < 100) {
            return NextResponse.json(
                { error: 'Document content too short. Please provide at least 100 characters.' },
                { status: 400 }
            );
        }

        // Generate document hash for caching
        const documentHash = await hashDocument(content);

        // Check cache for existing questions
        const cached = getCachedQuestions(documentHash);
        if (cached) {
            console.log('Returning cached questions for document:', documentHash.substring(0, 8));
            return NextResponse.json({
                questions: cached.questions.questions,
                summary: cached.summary,
                cached: true,
            });
        }

        // Generate questions and summary in parallel
        console.log('Generating new questions for document:', documentHash.substring(0, 8));

        const [questionsResponse, summary] = await Promise.all([
            generateQuestions(content),
            generateDocumentSummary(content),
        ]);

        // Cache the results
        setCachedQuestions(documentHash, questionsResponse, summary);

        return NextResponse.json({
            questions: questionsResponse.questions,
            summary,
            cached: false,
        });

    } catch (error) {
        console.error('Error in generate-questions API:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate questions',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            { status: 500 }
        );
    }
}
