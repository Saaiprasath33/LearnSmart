/**
 * Prompt Templates for Gemini API
 * Optimized for structured JSON responses and educational content analysis
 */

/**
 * Generates the system prompt for question generation
 * Creates 5 higher-order thinking questions from document content
 */
export const getQuestionGenerationPrompt = (documentContent: string): string => {
  return `You are an expert educational content analyst and assessment designer. Your task is to analyze the provided document and generate exactly 5 high-quality questions that test deep understanding.

## Instructions:
1. Read and analyze the entire document carefully
2. Identify the core concepts, theories, and key ideas
3. Create 5 questions that require higher-order thinking:
   - Analysis: Breaking down information, finding patterns
   - Application: Using knowledge in new situations
   - Synthesis: Combining ideas to form new understanding
   - Evaluation: Making judgments based on criteria

## Question Requirements:
- Questions must be answerable ONLY from the document content
- Avoid simple recall/memorization questions
- Each question should cover a different aspect of the document
- Questions should require 2-4 sentences to answer properly
- Questions should be clear and unambiguous

## Document Content:
${documentContent}

## Output Format:
Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    { "id": 1, "question": "Your first analytical question here" },
    { "id": 2, "question": "Your second application question here" },
    { "id": 3, "question": "Your third synthesis question here" },
    { "id": 4, "question": "Your fourth evaluation question here" },
    { "id": 5, "question": "Your fifth higher-order question here" }
  ]
}

IMPORTANT: Respond with ONLY the JSON object, no additional text or markdown formatting.`;
};

/**
 * Generates the evaluation prompt for a single answer
 * Provides detailed feedback without re-sending full document
 */
export const getAnswerEvaluationPrompt = (
  question: string,
  userAnswer: string,
  documentSummary: string
): string => {
  return `You are an expert educational evaluator providing personalized learning feedback. Evaluate the student's answer and provide constructive feedback.

## Context Summary:
${documentSummary}

## Question:
${question}

## Student's Answer:
${userAnswer}

## Evaluation Criteria:
1. **Accuracy**: Is the answer factually correct based on the source material?
2. **Completeness**: Does it address all parts of the question?
3. **Understanding**: Does it demonstrate genuine comprehension vs. surface-level recall?
4. **Critical Thinking**: Does it show analysis, synthesis, or evaluation?

## Output Format:
Respond ONLY with valid JSON in this exact format:
{
  "score": "X/10",
  "strengths": "What the student did well (1-2 sentences)",
  "gaps": "What was missing or incorrect (1-2 sentences)",
  "personalized_feedback": "Specific, encouraging feedback for this student (2-3 sentences)",
  "improvement_tip": "One actionable tip to improve their understanding (1 sentence)"
}

## Scoring Guide:
- 9-10: Exceptional, demonstrates mastery with insights
- 7-8: Good understanding with minor gaps
- 5-6: Basic understanding but missing key elements
- 3-4: Partial understanding with significant gaps
- 1-2: Minimal understanding or off-topic

IMPORTANT: Respond with ONLY the JSON object, no additional text or markdown formatting.`;
};

/**
 * Generates a document summary for evaluation context
 * Reduces token usage by sending summary instead of full document
 */
export const getDocumentSummaryPrompt = (documentContent: string): string => {
  return `Summarize the following document in 3-5 concise paragraphs, capturing:
1. Main topics and themes
2. Key concepts and definitions
3. Important relationships and conclusions

Document:
${documentContent}

Provide a clear, comprehensive summary that can be used as context for evaluating student answers.`;
};

/**
 * Types for structured responses
 */
export interface Question {
  id: number;
  question: string;
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface EvaluationResponse {
  score: string;
  strengths: string;
  gaps: string;
  personalized_feedback: string;
  improvement_tip: string;
}

/**
 * Tutorial section structure
 */
export interface TutorialSection {
  title: string;
  content: string;
  keyPoints?: string[];
}

export interface TutorialResponse {
  title: string;
  overview: string;
  concepts: TutorialSection[];
  learningPath: TutorialSection[];
  exercises: {
    question: string;
    hint: string;
  }[];
  summary: string;
}

/**
 * Summary response structure for document summarization
 */
export interface SummaryResponse {
  title: string;
  mainIdea: string;
  keyPoints: string[];
  sections: {
    heading: string;
    content: string;
  }[];
  conclusion: string;
  wordCount: number;
}

/**
 * Generates the tutorial generation prompt
 * Creates a comprehensive, structured tutorial from document content
 */
export const getTutorialGenerationPrompt = (documentContent: string): string => {
  return `You are an expert educational content creator. Your task is to transform the provided document into a comprehensive, easy-to-understand tutorial.

## Instructions:
1. Analyze the document thoroughly
2. Break down complex concepts into simple explanations
3. Create a structured learning path
4. Include practical exercises

## Document Content:
${documentContent}

## Output Format:
Respond ONLY with valid JSON in this exact format:
{
  "title": "A clear, engaging tutorial title",
  "overview": "A 2-3 sentence introduction explaining what this tutorial covers and what the learner will achieve",
  "concepts": [
    {
      "title": "Concept 1 Title",
      "content": "Clear explanation of the concept in simple terms (2-4 sentences)",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "learningPath": [
    {
      "title": "Step 1: Getting Started",
      "content": "What to learn first and why (2-3 sentences)"
    },
    {
      "title": "Step 2: Building Understanding",
      "content": "Next steps in the learning journey (2-3 sentences)"
    },
    {
      "title": "Step 3: Applying Knowledge",
      "content": "How to put it into practice (2-3 sentences)"
    }
  ],
  "exercises": [
    {
      "question": "A practice question or activity",
      "hint": "A helpful hint for solving it"
    }
  ],
  "summary": "A concise recap of the key takeaways (2-3 sentences)"
}

## Requirements:
- Include 3-6 concepts depending on document complexity
- Include exactly 3 learning path steps
- Include 2-4 exercises
- Use simple, clear language suitable for learners
- Make explanations engaging and practical

IMPORTANT: Respond with ONLY the JSON object, no additional text or markdown formatting.`;
};

/**
 * Generates the summary generation prompt
 * Creates a structured, detailed summary of the document
 */
export const getSummaryGenerationPrompt = (documentContent: string): string => {
  return `You are an expert document analyst. Your task is to create a comprehensive, well-structured summary of the provided document.

## Instructions:
1. Read and analyze the entire document carefully
2. Identify the main idea, key points, and structure
3. Create a clear, organized summary

## Document Content:
${documentContent}

## Output Format:
Respond ONLY with valid JSON in this exact format:
{
  "title": "A descriptive title capturing the document's main topic",
  "mainIdea": "The central thesis or main idea of the document in 2-3 sentences",
  "keyPoints": [
    "First key point or finding",
    "Second key point or finding",
    "Third key point or finding",
    "Fourth key point (if applicable)",
    "Fifth key point (if applicable)"
  ],
  "sections": [
    {
      "heading": "First Major Section/Theme",
      "content": "Summary of this section in 2-4 sentences"
    },
    {
      "heading": "Second Major Section/Theme",
      "content": "Summary of this section in 2-4 sentences"
    },
    {
      "heading": "Third Major Section/Theme",
      "content": "Summary of this section in 2-4 sentences"
    }
  ],
  "conclusion": "The main takeaways and conclusions from the document in 2-3 sentences",
  "wordCount": 0
}

## Requirements:
- Include 3-6 key points based on document content
- Include 2-4 sections based on document structure
- wordCount should be the approximate word count of the original document
- Keep summaries concise but comprehensive
- Use clear, accessible language

IMPORTANT: Respond with ONLY the JSON object, no additional text or markdown formatting.`;
};

/**
 * Generates the video script generation prompt
 * Creates a visual script for video creation from document content
 */
export const getVideoScriptPrompt = (content: string): string => {
  return `You are an expert video director. Your task is to turn the following content into a engaging short video script.

## Instructions:
1. Create a script with 3-6 scenes.
2. Each scene must have:
   - Visual Description: What should appear on screen (simple, clean, modern).
   - Text Overlay: Key short phrases to show on screen.
   - Narration: The voiceover text (engaging, conversational).
   - Duration: Estimated duration in seconds (5-10s per scene).

## Content:
${content}

## Output Format:
Respond ONLY with valid JSON in this exact format:
{
  "scenes": [
    {
      "id": 1,
      "visual": "A clean title card with 'Topic Name' in bold typography",
      "textOverlay": "Topic Name\\nKey Insight",
      "narration": "Welcome to our overview of Topic Name.",
      "duration": 5
    }
  ]
}

IMPORTANT: Respond with ONLY the JSON object.`;
};

export interface VideoScript {
  scenes: {
    id: number;
    visual: string;
    textOverlay: string;
    narration: string;
    duration: number;
  }[];
}
