# Dynamic Learning Summary Tool

## Overview

The **Dynamic Learning Summary Tool** is an AI-powered learning assistant designed to help students deeply understand complex study materials. Instead of passively reading large documents, learners actively engage with the content through concept-based questions and receive personalized, AI-generated feedback.

The application uses the **Google Gemini 2.5 Flash API** as its core intelligence engine to analyze documents, generate higher-order questions, and evaluate user responses — all while being optimized for the free tier.

## Key Features
* **Document Analysis**
  Upload text content or paste large study material for intelligent analysis.

* **Concept-Based Question Generation**
  Automatically generates **five higher-order questions** focused on analysis, application, and synthesis rather than simple recall.

* **Personalized Answer Evaluation**
  Each user response is evaluated in a single turn, providing:

  * Concept clarity assessment
  * Strengths and gaps
  * Clear suggestions for improvement

* **Progress Tracking**
  Displays scores and feedback to help learners measure understanding.

* **Clean & Accessible UI**
  Minimal, responsive design with optional dark mode support.

* **Free-Tier Optimized**
  Built with caching and efficient prompt design to minimize API usage.

## Getting Started
### Prerequisites

* Node.js 18 or later
* A valid Google Gemini API key (free tier supported)

### Installation Steps

1. **Clone the repository and install dependencies**

   ```bash
   cd Sumarize
   npm install
   ```

2. **Set up environment variables**

   ```bash
   copy .env.example .env.local
   ```

   Add your Gemini API key inside `.env.local`:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open the application**

   Visit: [http://localhost:3000](http://localhost:3000)

---

## Application Flow

1. User uploads or pastes a document
2. Gemini analyzes the content
3. The system generates five complex questions
4. The user answers each question
5. Gemini evaluates answers and provides personalized feedback

This approach ensures active learning with minimal back-and-forth API calls.

---

## Technology Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **AI Engine:** Google Gemini 2.5 Flash
* **State Management:** React Context API
* **Icons:** Lucide React

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-questions/
│   │   └── evaluate-answer/
│   ├── learn/
│   ├── results/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── context/
│   └── LearningContext.tsx
└── lib/
    ├── gemini.ts
    ├── cache.ts
    └── prompts.ts
```

---

## Free Tier Optimization Strategy

This project is designed specifically to work within Gemini’s free tier limits:

* One Gemini call per document for question generation
* One Gemini call per user answer for evaluation
* Document hashing to prevent repeated processing
* Cached summaries to reduce token usage

The focus is on **reasoning quality, not API volume**.

---

## Environment Variables

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| GEMINI_API_KEY | Google Gemini API key (server-side only) |

---

## API Key Disclaimer

This application requires a Google Gemini API key to function.

* The key is stored only in `.env.local`
* It is never exposed to the client
* All Gemini calls are made server-side

Users are responsible for their own API usage under Google’s free-tier limits.

---

## Hackathon Alignment (Gemini Blitz)

* **Innovation:** Uses Gemini reasoning to generate and evaluate higher-order questions
* **Feasibility:** Fully functional and deployable MVP
* **Gemini Integration:** Gemini API powers the core learning logic
* **Impact:** Helps students learn more effectively from large study materials

---

## License

This project is released under the MIT License and is intended for educational and hackathon use.

---

Built using Next.js and the Google Gemini API
