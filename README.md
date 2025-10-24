# AI PRIME 2026A

**A Fully Automated Digital Business Operating System powered by AI.**

AI PRIME 2026 is a comprehensive, web-based operating system designed to automate and manage a digital content business. It leverages the power of Google's Gemini AI to handle everything from market analysis and content generation to multi-platform distribution and performance monitoring.

> Version: 2026A-PRO  
> Updated by Google AI Studio AutoFixer  
> Date: 2024-07-26

---

## Core Features

This application is composed of several powerful, integrated modules:

*   **Dashboard:** A central hub providing an overview and quick access to all system modules.
*   **Agent Control:** Deploy, manage, and issue directives to autonomous AI agents assigned to specific content channels and niches.
*   **AI Video Factory:** An end-to-end video production pipeline. Generate high-quality, platform-specific videos and unique AI characters from simple text prompts.
*   **Content Matrix:** Visualize and manage content pipelines across all connected social media accounts. Generate and distribute content to multiple platforms from a single command.
*   **Automation Flows:** A visual workflow builder to design, activate, and manage complex automation sequences that connect various services (e.g., Google Trends -> Gemini -> Google Sheets).
*   **Analytics & Intelligence:** A suite of powerful analysis tools:
    *   **Market Simulation:** Analyze trends, audience sentiment, and strategic opportunities for any niche.
    *   **SEO Nexus:** Discover high-potential keywords and emerging topics.
    *   **Dual-Income Hunter:** Identify niches with both high viral and affiliate marketing potential.
    *   **Affiliate Intelligence:** Find, analyze, and rank the best affiliate programs for a given topic.
    *   **AI Content Coach:** Provides a strategic blueprint for building an automated YouTube channel.
*   **Command Nexus:** A terminal-like interface for direct interaction with the AI core. Issue commands and use the "Content Assimilator" to deconstruct and repurpose content from any URL.
*   **Accounts Management:** A secure interface to connect and manage credentials for social media platforms (YouTube, TikTok, etc.) and affiliate networks (Amazon, ClickBank, etc.).
*   **System Settings:** Easily export a full system backup (accounts, agents, jobs) or restore the system from a backup file.

## Technology Stack

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS
*   **AI:** Google Gemini API
*   **Backend:** Vercel Serverless Functions (Node.js)
*   **Deployment:** Vercel

## Running the Project Locally

This project uses Vercel Serverless Functions for its backend API, which are located in the `/api` directory. To run both the frontend and the backend simultaneously for local development, you need the Vercel CLI.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Vercel CLI:**
    If you don't have it already, install it globally.
    ```bash
    npm install -g vercel
    ```

3.  **Link Your Project (First Time):**
    You may need to link your local project to your Vercel account.
    ```bash
    vercel link
    ```

4.  **Run the Development Server:**
    The `vercel dev` command starts the Vite dev server for the frontend and the serverless functions for the API, correctly handling proxying and environment variables.
    ```bash
    vercel dev
    ```
    The application will be available at the local URL provided by the command (usually `http://localhost:3000`).

## Deployment

This project is configured for seamless deployment to **Vercel**. Simply connect your GitHub repository to a Vercel project. Vercel will automatically detect the Vite configuration, build the frontend, and deploy the serverless functions from the `/api` directory.