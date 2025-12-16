'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useLearning } from '@/context/LearningContext';

export function DocumentUpload() {
    const { setDocument, documentContent } = useLearning();
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const processFile = useCallback(async (file: File) => {
        setError(null);

        // Check file size (max 5MB to allow for PDFs)
        if (file.size > 5 * 1024 * 1024) {
            setError('File too large. Maximum size is 5MB.');
            return;
        }

        try {
            let content = '';

            if (file.type === 'application/pdf') {
                // PDF Parsing Logic
                try {
                    // We need to dynamically import pdfjs-dist to avoid SSR issues
                    const pdfjsLib = await import('pdfjs-dist');

                    // Set worker to local file (most reliable)
                    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item: any) => item.str)
                            .join(' ');
                        fullText += pageText + '\n\n';
                    }
                    content = fullText;
                } catch (err) {
                    console.error('PDF Parse Error:', err);
                    throw new Error('Failed to parse PDF file.');
                }
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
                // Word (.docx) Parsing Logic
                try {
                    const mammoth = await import('mammoth');
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    content = result.value;
                } catch (err) {
                    console.error('DOCX Parse Error:', err);
                    throw new Error('Failed to parse Word document.');
                }
            } else {
                // Regular text file parsing
                content = await file.text();
            }

            if (content.trim().length < 50) {
                // Lower limit slightly as PDFs might have weird whitespace
                setError('Document content too short. Please provide at least 50 characters of text.');
                return;
            }

            setFileName(file.name);
            setDocument(content);
        } catch (err) {
            console.error(err);
            setError('Failed to read file. Please ensure it is a valid text or PDF file.');
        }
    }, [setDocument]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                processFile(file);
            }
        },
        [processFile]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                processFile(file);
            }
        },
        [processFile]
    );

    const handleTextPaste = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const content = e.target.value;
            setError(null);

            if (content.trim().length > 0) {
                setFileName('Pasted text');
                setDocument(content);
            }
        },
        [setDocument]
    );

    const clearDocument = useCallback(() => {
        setFileName(null);
        setDocument('');
        setError(null);
    }, [setDocument]);

    if (documentContent) {
        return (
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{fileName}</p>
                            <p className="text-sm text-muted-foreground">
                                {documentContent.length.toLocaleString()} characters
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearDocument}>
                        <X className="w-4 h-4" />
                        Remove
                    </Button>
                </div>

                {/* Content Preview */}
                <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                        Extracted Content Preview
                    </p>
                    <p className="text-sm text-foreground/80 font-mono text-xs leading-relaxed line-clamp-4 break-all">
                        {documentContent.slice(0, 300)}...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Drag and drop area */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center
          transition-all duration-200 cursor-pointer
          ${isDragging
                        ? 'border-primary-500 bg-primary-500/5'
                        : 'border-border hover:border-primary-400 hover:bg-muted/50'
                    }
        `}
            >
                <input
                    type="file"
                    accept="*/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className={`
            p-4 rounded-2xl transition-colors duration-200
            ${isDragging
                            ? 'bg-primary-500/20 text-primary-500'
                            : 'bg-muted text-muted-foreground'
                        }
          `}>
                        <Upload className="w-8 h-8" />
                    </div>

                    <div>
                        <p className="font-medium text-foreground">
                            Drop your document here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Supports PDF, Word, and text files up to 5MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Text paste area */}
            <div className="relative">
                <div className="absolute left-4 top-3">
                    <span className="text-sm text-muted-foreground">Or paste your text:</span>
                </div>
                <textarea
                    onChange={handleTextPaste}
                    placeholder="Paste your document content here..."
                    className="
            w-full min-h-[150px] pt-10 px-4 pb-4 rounded-2xl border border-border
            bg-card text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200 resize-none
          "
                />
            </div>

            {/* Error display */}
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 animate-fade-in">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}
