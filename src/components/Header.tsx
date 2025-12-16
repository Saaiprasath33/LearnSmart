'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Home, FileText, GraduationCap } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

export function Header() {
    return (
        <header className="sticky top-0 z-50 glass border-b border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-200">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg text-foreground">
                            Learn<span className="gradient-text">Smart</span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-2 sm:gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                        >
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link
                            href="/summary"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Summary</span>
                        </Link>
                        <Link
                            href="/tutorial"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span className="hidden sm:inline">Tutorial</span>
                        </Link>
                        <ThemeToggle />
                    </nav>
                </div>
            </div>
        </header>
    );
}
