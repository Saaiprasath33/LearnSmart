/**
 * Gemini API Service
 * Core integration with Google's Gemini 2.0 Flash model
 * Optimized for free-tier usage with structured JSON responses
 * 
 * Set USE_MOCK_DATA = true to use demo data when API quota is exhausted
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    getQuestionGenerationPrompt,
    getAnswerEvaluationPrompt,
    getDocumentSummaryPrompt,
    getSummaryGenerationPrompt,
    QuestionsResponse,
    EvaluationResponse,
    TutorialResponse,
    SummaryResponse,
} from './prompts';

// ============================================
// MOCK MODE - Set to true when API quota is exhausted
// ============================================
const USE_MOCK_DATA = true;

// Static mock data for answer evaluation (user's answer doesn't change mock feedback)
const MOCK_EVALUATION: EvaluationResponse = {
    score: "7/10",
    strengths: "Good understanding of core concepts. Clear articulation of ideas.",
    gaps: "Could provide more specific examples. Missing some key details from the source material.",
    personalized_feedback: "You've demonstrated a solid grasp of the material. To improve, try incorporating more specific examples from the document to support your points.",
    improvement_tip: "When answering questions, always tie your response back to specific evidence from the source material."
};

// ============================================
// SMART MOCK DATA GENERATION
// Extracts real content from the document
// ============================================

/**
 * Extract sentences from text
 */
function extractSentences(text: string): string[] {
    // First, try to split by common sentence terminators
    let sentences = text
        .replace(/\r\n/g, '\n') // Normalize newlines
        .split(/(?<=[.!?])\s+|(?<=\n)\s*(?=[A-Z])/); // Split by punctuation OR newline followed by capital letter

    // Clean up sentences
    sentences = sentences
        .map(s => s.trim().replace(/\s+/g, ' '))
        .filter(s => s.length > 10); // Keep reasonably long segments

    // If we have very few sentences (likely PDF issue), try splitting by length
    if (sentences.length < 3 && text.length > 100) {
        return text.match(/.{1,200}(\s|$)/g)?.map(s => s.trim()) || [text];
    }

    return sentences;
}

/**
 * Extract the first N characters as a snippet
 */
function getSnippet(text: string, length: number = 200): string {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= length) return clean;
    return clean.substring(0, length).replace(/\s+\S*$/, '') + '...';
}

/**
 * Split document into rough sections
 */
function splitIntoSections(text: string): string[] {
    // Try to split by double newlines (paragraphs)
    let sections = text.split(/\n\s*\n/);

    // If that fails, try splitting by significant whitespace indentation or headers
    if (sections.length < 2) {
        sections = text.split(/\n(?=[A-Z][a-z]+:?)/); // Looks like a header
    }

    return sections.filter(s => s.trim().length > 50).map(s => s.replace(/\s+/g, ' ').trim());
}

/**
 * Extract potential title from document
 */
function extractTitle(text: string): string {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return 'Document Summary';

    const firstLine = lines[0].trim();
    // Check if first line looks like a title (short and no ending punctuation)
    if (firstLine.length < 100 && !firstLine.match(/[.!?]$/)) {
        return firstLine.replace(/^#+\s*/, ''); // Remove markdown headers
    }

    // Otherwise, try to extract key topic from first sentence
    const firstSentence = extractSentences(text)[0];
    if (firstSentence) {
        const words = firstSentence.split(' ').slice(0, 6).join(' ');
        return words.length > 10 ? words + '...' : 'Document Summary';
    }

    return 'Document Summary';
}

/**
 * Generate smart mock questions based on document content
 */
function generateSmartMockQuestions(documentContent: string): QuestionsResponse {
    const sentences = extractSentences(documentContent);
    const firstFew = sentences.slice(0, 5).join(' ');

    return {
        questions: [
            { id: 1, question: `Based on the document content, what is the main concept being discussed and how does it relate to: "${getSnippet(firstFew, 80)}"?` },
            { id: 2, question: "Analyze the key arguments presented in this document. What are the strengths and potential weaknesses of the author's position?" },
            { id: 3, question: "How could you apply the principles discussed in this document to solve a practical problem in your field?" },
            { id: 4, question: "Compare and contrast the different perspectives or approaches mentioned in the document. Which do you find most compelling and why?" },
            { id: 5, question: "Based on the information provided, what conclusions can you draw? What implications might these have for future developments?" }
        ]
    };
}

/**
 * Generate smart mock summary based on document content
 */
function generateSmartMockSummary(documentContent: string): SummaryResponse {
    const sentences = extractSentences(documentContent);
    const sections = splitIntoSections(documentContent);
    const wordCount = documentContent.split(/\s+/).length;

    // Use actual first sentences as main idea
    const mainIdea = sentences.slice(0, 2).join(' ') ||
        "This document presents key information on the topic at hand.";

    // Extract key points from different parts of the document
    const keyPoints: string[] = [];
    const step = Math.max(1, Math.floor(sentences.length / 5));
    for (let i = 0; i < 5 && i * step < sentences.length; i++) {
        const sentence = sentences[i * step];
        if (sentence) {
            keyPoints.push(sentence.length > 150 ? sentence.substring(0, 147) + '...' : sentence);
        }
    }

    // Ensure we have at least 3 key points
    while (keyPoints.length < 3) {
        keyPoints.push(`Key point ${keyPoints.length + 1} from the document content.`);
    }

    // Generate sections from actual document sections
    const docSections = sections.slice(0, 3).map((section, index) => ({
        heading: `Section ${index + 1}: ${extractTitle(section).substring(0, 50)}`,
        content: getSnippet(section, 200)
    }));

    // Ensure we have at least 2 sections
    while (docSections.length < 2) {
        docSections.push({
            heading: `Additional Content ${docSections.length + 1}`,
            content: getSnippet(documentContent.substring(docSections.length * 500), 200)
        });
    }

    // Use last sentences as conclusion
    const conclusion = sentences.slice(-2).join(' ') ||
        "The document provides valuable insights on the discussed topics.";

    return {
        title: extractTitle(documentContent),
        mainIdea,
        keyPoints,
        sections: docSections,
        conclusion,
        wordCount
    };
}

/**
 * Generate smart mock tutorial based on document content
 */
function generateSmartMockTutorial(documentContent: string): TutorialResponse {
    const sentences = extractSentences(documentContent);
    const sections = splitIntoSections(documentContent);
    const title = extractTitle(documentContent);

    // Create concepts from document sections
    const concepts = sections.slice(0, 3).map((section, index) => {
        const sectionSentences = extractSentences(section);
        return {
            title: `Concept ${index + 1}: ${extractTitle(section).substring(0, 40)}`,
            content: sectionSentences[0] || getSnippet(section, 150),
            keyPoints: sectionSentences.slice(1, 4).map(s => s.length > 100 ? s.substring(0, 97) + '...' : s)
        };
    });

    // Ensure minimum concepts
    while (concepts.length < 2) {
        concepts.push({
            title: `Core Concept ${concepts.length + 1}`,
            content: getSnippet(documentContent.substring(concepts.length * 300), 150),
            keyPoints: ["Key understanding from the material"]
        });
    }

    return {
        title: `Tutorial: ${title}`,
        overview: sentences.slice(0, 2).join(' ') ||
            "This tutorial covers the key concepts from your uploaded document.",
        concepts,
        learningPath: [
            { title: "Step 1: Foundation", content: "Begin by understanding the core concepts introduced at the start of the document." },
            { title: "Step 2: Deep Dive", content: "Explore the detailed explanations and examples provided throughout the material." },
            { title: "Step 3: Application", content: "Apply what you've learned to the practical scenarios mentioned in the document." },
            { title: "Step 4: Review", content: "Test your understanding with the quiz questions and review any unclear sections." }
        ],
        exercises: [
            { question: "Explain the main concept in your own words.", hint: "Focus on the key ideas from the first section." },
            { question: "How would you apply this knowledge in practice?", hint: "Think about real-world applications discussed in the document." }
        ],
        summary: sentences.slice(-2).join(' ') ||
            "This tutorial has covered the essential concepts from your document."
    };
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use gemini-2.5-flash for all operations
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
    },
});

/**
 * Parse JSON from Gemini response
 * Handles potential markdown code blocks in response
 */
function parseJsonResponse<T>(text: string): T {
    // Remove potential markdown code blocks
    let cleanText = text.trim();

    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
    }

    if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
    }

    cleanText = cleanText.trim();

    return JSON.parse(cleanText) as T;
}

/**
 * Generate 5 higher-order questions from document content
 * Single API call - optimized for free tier
 */
export async function generateQuestions(
    documentContent: string
): Promise<QuestionsResponse> {
    // Return mock data if in mock mode
    if (USE_MOCK_DATA) {
        console.log('[MOCK MODE] Returning smart mock questions based on document');
        return generateSmartMockQuestions(documentContent);
    }

    try {
        const prompt = getQuestionGenerationPrompt(documentContent);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const parsed = parseJsonResponse<QuestionsResponse>(text);

        // Validate response structure
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
            throw new Error('Invalid response structure: missing questions array');
        }

        if (parsed.questions.length !== 5) {
            console.warn(`Expected 5 questions, got ${parsed.questions.length}`);
        }

        return parsed;
    } catch (error) {
        console.error('Error generating questions:', error);
        throw new Error(
            error instanceof Error
                ? `Failed to generate questions: ${error.message}`
                : 'Failed to generate questions'
        );
    }
}

/**
 * Generate a summary of the document for evaluation context
 * Reduces token usage during answer evaluation
 */
export async function generateDocumentSummary(
    documentContent: string
): Promise<string> {
    // Return mock summary if in mock mode
    if (USE_MOCK_DATA) {
        console.log('[MOCK MODE] Returning mock summary');
        return 'This is a mock document summary for demonstration purposes. ' + documentContent.substring(0, 500) + '...';
    }

    try {
        const prompt = getDocumentSummaryPrompt(documentContent);
        const result = await model.generateContent(prompt);
        const response = result.response;

        return response.text().trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        // Return truncated document as fallback
        return documentContent.substring(0, 2000) + '...';
    }
}

/**
 * Evaluate a single user answer
 * Single API call per answer - optimized for free tier
 */
export async function evaluateAnswer(
    question: string,
    userAnswer: string,
    documentSummary: string
): Promise<EvaluationResponse> {
    // Return mock evaluation if in mock mode
    if (USE_MOCK_DATA) {
        console.log('[MOCK MODE] Returning mock evaluation');
        return MOCK_EVALUATION;
    }

    try {
        const prompt = getAnswerEvaluationPrompt(question, userAnswer, documentSummary);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const parsed = parseJsonResponse<EvaluationResponse>(text);

        // Validate response structure
        const requiredFields = ['score', 'strengths', 'gaps', 'personalized_feedback', 'improvement_tip'];
        for (const field of requiredFields) {
            if (!(field in parsed)) {
                throw new Error(`Invalid response structure: missing ${field}`);
            }
        }

        return parsed;
    } catch (error) {
        console.error('Error evaluating answer:', error);
        throw new Error(
            error instanceof Error
                ? `Failed to evaluate answer: ${error.message}`
                : 'Failed to evaluate answer'
        );
    }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
}

/**
 * Generate a comprehensive tutorial from document content
 * Single API call - uses higher token limit for detailed output
 */
export async function generateTutorial(
    documentContent: string
): Promise<TutorialResponse> {
    // Return mock tutorial if in mock mode
    if (USE_MOCK_DATA) {
        console.log('[MOCK MODE] Returning smart mock tutorial based on document');
        return generateSmartMockTutorial(documentContent);
    }

    const { getTutorialGenerationPrompt } = await import('./prompts');

    try {
        // Use higher token limit for tutorials
        const tutorialModel = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 4096,
            },
        });

        const prompt = getTutorialGenerationPrompt(documentContent);
        const result = await tutorialModel.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const parsed = parseJsonResponse<TutorialResponse>(text);

        // Validate response structure
        if (!parsed.title || !parsed.overview || !parsed.concepts || !parsed.learningPath) {
            throw new Error('Invalid response structure: missing required fields');
        }

        return parsed;
    } catch (error) {
        console.error('Error generating tutorial:', error);
        throw new Error(
            error instanceof Error
                ? `Failed to generate tutorial: ${error.message}`
                : 'Failed to generate tutorial'
        );
    }
}

/**
 * Generate a comprehensive summary from document content
 * Single API call - provides structured summary of the document
 */
export async function generateSummary(
    documentContent: string
): Promise<SummaryResponse> {
    // Return mock summary if in mock mode
    if (USE_MOCK_DATA) {
        console.log('[MOCK MODE] Returning smart mock summary based on document');
        return generateSmartMockSummary(documentContent);
    }

    try {
        const prompt = getSummaryGenerationPrompt(documentContent);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const parsed = parseJsonResponse<SummaryResponse>(text);

        // Validate response structure
        if (!parsed.title || !parsed.mainIdea || !parsed.keyPoints || !parsed.sections) {
            throw new Error('Invalid response structure: missing required fields');
        }

        return parsed;
    } catch (error) {
        console.error('Error generating summary:', error);
        throw new Error(
            error instanceof Error
                ? `Failed to generate summary: ${error.message}`
                : 'Failed to generate summary'
        );
    }
}
