import * as googleTTS from 'google-tts-api';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate audio (mp3) from text using Google TTS (Free)
 * Splits long text if necessary (basic implementation)
 */
export async function generateAudio(text: string): Promise<string> {
    try {
        // google-tts-api usually splits into multiple urls if text is long
        // For simplicity, we assume short segments (per scene narration)
        // If long, we might need multiple calls and stitching
        if (text.length > 200) {
            console.warn('Text is long, audio might be truncated or split');
        }

        const url = googleTTS.getAudioUrl(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        // Download the audio file to temp directory
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileName = `${uuidv4()}.mp3`;
        const tempDir = path.join(process.cwd(), 'public', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, buffer);

        return filePath;
    } catch (error) {
        console.error('Error generating audio:', error);
        throw new Error('Failed to generate audio');
    }
}
