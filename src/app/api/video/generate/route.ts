import { NextRequest, NextResponse } from 'next/server';
import { generateVideoScript } from '@/lib/video/script-generator';
import { generateSlideImages } from '@/lib/video/slide-generator';
import { generateAudio } from '@/lib/video/audio-generator';
import { renderVideo, SceneAsset, getDuration } from '@/lib/video/video-renderer';

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        console.log('1. Generating Script...');
        const script = await generateVideoScript(content);
        console.log('Script generated:', script.scenes.length, 'scenes');

        console.log('2. Generating Slides...');
        const imagePaths = await generateSlideImages(script);

        console.log('3. Generating Audio...');
        const sceneAssets: SceneAsset[] = [];

        for (let i = 0; i < script.scenes.length; i++) {
            const scene = script.scenes[i];
            const imagePath = imagePaths[i];

            // Generate audio
            const audioPath = await generateAudio(scene.narration);

            // Get exact duration from audio file
            let duration = await getDuration(audioPath);

            // Add a small buffer or ensure it matches at least the visual duration if specified?
            // Usually we want the visual to last as long as the audio
            // Optional: Add pauses? 

            sceneAssets.push({
                imagePath,
                audioPath,
                duration
            });
        }

        console.log('4. Rendering Video...');
        const videoUrl = await renderVideo(sceneAssets);
        console.log('Video generated:', videoUrl);

        return NextResponse.json({ videoUrl });
    } catch (error) {
        console.error('Video generation failed:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate video' },
            { status: 500 }
        );
    }
}
