/**
 * Document Cache System
 * Uses SHA-256 hashing and in-memory storage to avoid repeated Gemini API calls
 */

import { QuestionsResponse } from './prompts';

// Cache entry with TTL
interface CacheEntry {
    questions: QuestionsResponse;
    summary: string;
    timestamp: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry>();

// Cache TTL: 1 hour in milliseconds
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Generate SHA-256 hash of document content
 * Used as cache key to identify unique documents
 */
export async function hashDocument(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    // Use Web Crypto API (available in Node.js and browsers)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * Get cached questions for a document
 * Returns null if not found or expired
 */
export function getCachedQuestions(hash: string): CacheEntry | null {
    const entry = cache.get(hash);

    if (!entry) {
        return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(hash);
        return null;
    }

    return entry;
}

/**
 * Store questions in cache
 */
export function setCachedQuestions(
    hash: string,
    questions: QuestionsResponse,
    summary: string
): void {
    cache.set(hash, {
        questions,
        summary,
        timestamp: Date.now(),
    });
}

/**
 * Clear expired cache entries
 * Call periodically to prevent memory leaks
 */
export function clearExpiredCache(): void {
    const now = Date.now();

    for (const [hash, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_TTL) {
            cache.delete(hash);
        }
    }
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; entries: string[] } {
    return {
        size: cache.size,
        entries: Array.from(cache.keys()).map(h => h.substring(0, 8) + '...'),
    };
}
