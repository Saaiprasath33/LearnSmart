/**
 * API Route: Generate Tutorial
 * POST /api/generate-tutorial
 * 
 * Generates a comprehensive tutorial from uploaded document content
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTutorial, isGeminiConfigured } from '@/lib/gemini';

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

        console.log('Generating tutorial for document of length:', content.length);

        const tutorial = await generateTutorial(content);

        return NextResponse.json({
            tutorial,
            success: true,
        });

    } catch (error) {
        console.error('Error in generate-tutorial API:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate tutorial',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            { status: 500 }
        );
    }
}
