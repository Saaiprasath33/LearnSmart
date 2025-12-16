import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Set ffmpeg path
// Try to clean up imports if needed, but for now specific require is reliable
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export interface SceneAsset {
    imagePath: string;
    audioPath: string;
    duration: number; // Duration from script or audio length
}

/**
 * Get duration of an audio file
 */
export function getDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 5);
        });
    });
}


/**
 * Render scenes into a single video
 */
export async function renderVideo(scenes: SceneAsset[]): Promise<string> {
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    const outputDir = path.join(process.cwd(), 'public', 'generated-videos');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. Render each scene to a temporary video segment
    const segmentPaths: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const segmentPath = path.join(tempDir, `segment_${uuidv4()}.mp4`);

        await renderScene(scene, segmentPath);
        segmentPaths.push(segmentPath);
    }

    // 2. Concatenate all segments
    const finalVideoName = `video_${uuidv4()}.mp4`;
    const finalVideoPath = path.join(outputDir, finalVideoName);

    await concatSegments(segmentPaths, finalVideoPath);

    // Cleanup temp files (optional, leaving for debug now)
    // segmentPaths.forEach(p => fs.unlinkSync(p));

    // Return the public URL path
    return `/generated-videos/${finalVideoName}`;
}

/**
 * Render a single scene: Image + Audio -> MP4
 */
function renderScene(scene: SceneAsset, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(scene.imagePath)
            .loop(scene.duration) // Loop image for duration
            .input(scene.audioPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-tune stillimage',
                '-c:a aac',
                '-b:a 192k',
                '-pix_fmt yuv420p', // Required for compatibility
                '-shortest' // Stop when audio ends (or duration)
            ])
            .save(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => {
                console.error('Error rendering scene:', err);
                reject(err);
            });
    });
}

/**
 * Concatenate multiple video segments
 */
function concatSegments(segmentPaths: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = ffmpeg();

        segmentPaths.forEach(p => {
            command.input(p);
        });

        command
            .on('end', () => resolve())
            .on('error', (err) => {
                console.error('Error concatenating segments:', err);
                reject(err);
            })
            .mergeToFile(outputPath, path.dirname(outputPath)); // temp dir for merge list
    });
}
