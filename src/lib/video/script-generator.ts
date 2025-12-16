import { GoogleGenerativeAI } from '@google/generative-ai';
import { getVideoScriptPrompt, VideoScript } from '../prompts';

// Initialize Gemini client (reusing env var)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Mock mode configuration
const USE_MOCK_DATA = false;

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash', // Using the same model as the rest of the app
    generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
    },
});

/**
 * Generate a video script from document content or summary
 */
export async function generateVideoScript(content: string): Promise<VideoScript> {
    if (USE_MOCK_DATA) {
        console.log('[MOCK MODE] Returning mock video script');
        return generateMockScript(content);
    }

    try {
        const prompt = getVideoScriptPrompt(content);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return parseJsonResponse<VideoScript>(text);
    } catch (error) {
        console.error('Error generating video script:', error);
        // Fallback to mock if API fails
        console.log('Falling back to mock script due to error');
        return generateMockScript(content);
    }
}

/**
 * Generate a smart mock script using the actual content text
 * Parses headers and paragraphs to create a coherent tutorial flow
 */
function generateMockScript(content?: string): VideoScript {
    let scenes = [];

    if (content) {
        // 1. Identify Sections
        // Split by double newlines or common header patterns
        const sections = content.split(/\n\s*\n/);

        // Scene 1: Intro
        const title = findTitle(content);
        scenes.push({
            id: 1,
            visual: "A clean, modern title card with the document title.",
            textOverlay: `${title}\nTutorial Overview`,
            narration: `Welcome to this tutorial on ${title}. We'll cover the main concepts and key takeaways.`,
            duration: 5
        });

        // Scene 2...N: Content Sections
        let sceneId = 2;
        for (const section of sections) {
            const trimmed = section.trim();
            if (trimmed.length < 50) continue; // Skip short snippets

            // Try to find a "heading" for this section
            const lines = trimmed.split('\n');
            const potentialHeader = lines[0].length < 100 ? lines[0] : "Key Concept";
            const bodyText = lines.length > 1 ? lines.slice(1).join(' ') : lines[0];

            // Summarize body text for narration (simple truncation for mock)
            const narration = bodyText.substring(0, 150) + (bodyText.length > 150 ? "." : "");

            scenes.push({
                id: sceneId++,
                visual: "A visual representation of the concept with text on the left/right.",
                textOverlay: `${potentialHeader}\nKey Detail`,
                narration: narration,
                duration: Math.min(10, Math.max(5, Math.ceil(narration.length / 20))) // Approx duration based on text length
            });

            if (sceneId > 5) break; // Limit to 5 content scenes
        }
    }

    // Fallback if no sections found or content empty
    if (scenes.length < 2) {
        return {
            scenes: [
                {
                    id: 1,
                    visual: "Title Card",
                    textOverlay: "Topic Overview",
                    narration: "Welcome to the summary.",
                    duration: 5
                },
                {
                    id: 2,
                    visual: "Key Points",
                    textOverlay: "Main Idea",
                    narration: "Here are the main points discussed in the document.",
                    duration: 5
                }
            ]
        };
    }

    // Add Conclusion
    scenes.push({
        id: scenes.length + 1,
        visual: "Closing Slide",
        textOverlay: "Thanks for watching",
        narration: "That concludes our summary. Thank you for watching.",
        duration: 4
    });

    return { scenes };
}

function findTitle(content: string): string {
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length < 50) return firstLine;
    return "Document Summary";
}



/**
 * Helper to parse JSON from Gemini response (handles markdown blocks)
 */
function parseJsonResponse<T>(text: string): T {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
    }
    return JSON.parse(cleanText) as T;
}
