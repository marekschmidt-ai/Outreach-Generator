# TiDB Outreach Generator 🚀

An AI-powered, hyper-personalized cold outreach engine engineered specifically for Sales Development Representatives (SDRs). Built with **Google Gemini 2.5 Flash** and native **Search Grounding**, this tool actively researches prospects to generate incredibly tailored messaging in seconds.

## ✨ Features

- **Automated Deep Research**: Just paste a prospect's LinkedIn URL. The engine handles the rest—discovering their company, finding their technical job postings, and mapping their current tech stack.
- **Battle Card Cross-Referencing**: Built-in logic cross-references the prospect's real-time stack limitations (e.g., Postgres scaling limits) directly against TiDB's Go-To-Market advantages to answer "Why should they meet with us?".
- **Zero-Input Context**: Stores your GTM Playbook and Competitive Battle Cards safely in `localStorage` securely via a slide-out drawer so you never have to type out your positioning repeatedly.
- **Premium UI**: Housed in a gorgeous, flat dark-mode dashboard tailored for a rich developer tool aesthetic. 
- **Fault-Tolerant AI Engine**: Features fully integrated exponential backoff logic and automated model fallbacks to cleanly handle standard generative API traffic spikes or rate limits.

## 🛠 Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS 
- **Backend**: Node.js, Express
- **AI Engine**: `@google/genai` (Gemini 2.5 Flash with live Google Search Grounding capabilities)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/marekschmidt-ai/Outreach-Generator.git
cd Outreach-Generator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API Credentials
Create a `.env` file in the root folder and inject your Google Gemini API key:
```bash
GEMINI_API_KEY="your_google_api_key"
```
*(Ensure your API key is provisioned for `gemini-2.5-flash` with access to Google Search Tools).*

### 4. Boot the Server
```bash
node server.js
```
Open up your browser and navigate to `http://localhost:3000`.
