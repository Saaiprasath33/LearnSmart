import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { LearningProvider } from "@/context/LearningContext";

export const metadata: Metadata = {
    title: "LearnSmart - AI-Powered Learning Assistant",
    description: "Upload documents and get personalized learning questions powered by Gemini AI. Improve your understanding with intelligent feedback.",
    keywords: ["learning", "AI", "education", "Gemini", "study assistant", "document analysis"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background antialiased">
                <LearningProvider>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-1">
                            {children}
                        </main>
                        <footer className="py-6 border-t border-border">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <p className="text-center text-sm text-muted-foreground">
                                    Powered by{" "}
                                    <span className="font-medium gradient-text">
                                        Google Gemini AI
                                    </span>
                                    {" "}• Built for learning
                                </p>
                            </div>
                        </footer>
                    </div>
                </LearningProvider>
            </body>
        </html>
    );
}
