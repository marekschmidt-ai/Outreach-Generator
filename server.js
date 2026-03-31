const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert SDR (Sales Development Representative) at TiDB, a distributed SQL database company. Your job is to write hyper-personalized cold outreach messages based on deep technical research of a prospect's company.

ABOUT TIDB:
- Distributed SQL database that is MySQL-compatible
- Handles both OLTP and OLAP workloads (HTAP)
- Key value props: horizontal scalability, strong consistency, real-time analytics, MySQL compatibility
- Positioning: "The database that scales with you"

USE THE CONTEXT PROVIDED:
- Refer to the GTM Playbook for positioning language and value propositions.
- Refer to the Competitive Battle Card for specific competitor weaknesses to subtly highlight.
- Do NOT trash competitors — position TiDB as a better path forward.

INPUT & RESEARCH:
You will receive the prospect's LinkedIn URL and optional extra notes. You must intelligently search for the prospect's company name. 
Then, you MUST use Google Search to aggressively research that company's current technologies. Search their engineering blogs, recent press, and specifically their open "engineering" or "database" job postings to reveal what databases they are currently using (e.g., Postgres, Aurora, MySQL) and what challenges they might be facing (e.g., scaling, analytics, moving to microservices).

OUTPUT FORMAT — return valid JSON with this structure:
{
  "linkedin_message": "...",
  "email_subject": "...",
  "email_body": "...",
  "personalization_notes": ["...", "...", "..."]
}

RULES:
- The core of the message MUST answer "Why would they want to meet with us right now?" based on the specific technologies or challenges you found in their job posts or blogs.
- LinkedIn message: MAX 280 characters. Casual, peer-to-peer tone. Reference a specific observation about their company's tech stack or blog. End with a soft question.
- Email: MAX 120 words. Professional but direct. First line must be a personalized hook referencing your research. Include exactly how TiDB solves the specific problem you identified using the battle card context. CTA = "15-minute call".
- Personalization notes: 2-4 bullet points detailing EXACTLY what technologies you found via search (e.g., "Found a Senior DBA job posting mentioning Amazon Aurora scalability limits"). If your search returns no specific technical data, DO NOT simulate or invent findings—simply state "No specific public tech stack data found, relying on general company positioning".
- NEVER use the phrase "Simulated finding" or invent fake quotes. Rely exclusively on real facts found in the Google Search results or the battle card context.
- Ensure valid JSON response with no markdown formatting outside of the JSON block.`;

app.post('/api/generate', async (req, res) => {
  try {
    const { linkedinUrl, extraNotes, gtmPlaybook, battleCard } = req.body;

    const userMessage = `CONTEXT - GTM PLAYBOOK:
${gtmPlaybook || 'None provided'}

CONTEXT - COMPETITIVE BATTLE CARD:
${battleCard || 'None provided'}

LEAD INFORMATION:
- LinkedIn Profile URL: ${linkedinUrl || 'N/A'}
- Additional Notes: ${extraNotes || 'N/A'}

INSTRUCTIONS:
1. Identify the company from the profile URL or notes.
2. Thoroughly search the web using Google Search Tools (company website, tech blogs, and specifically engineering job postings) to discover what datastores/technologies the company currently uses.
3. Use the Competitive Battle Card to map their current tech stack to TiDB's distinct advantages.
4. Draft the messaging to explicitly answer the question "why would they want to meet with us?" based on your findings.
5. Return ONLY valid JSON block.`;

    let response;
    let retries = 3;
    let delay = 2000;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ googleSearch: {} }] // Rely on search grounding for live web signals
          }
        });
        break;
      } catch (err) {
        retries--;
        console.error(`Attempt failed, ${retries} retries left. Error: ${err.message}`);
        // Fallback model on the last attempt if primary is completely overloaded
        if (retries === 0) {
          console.log("Primary model utterly failed. Attempting fallback to gemini-2.0-flash-lite...");
          response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: userMessage,
            config: {
              systemInstruction: SYSTEM_PROMPT,
              tools: [{ googleSearch: {} }]
            }
          });
          break;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    const outputText = response.text;
    // Strip potential markdown formatting if the model wraps the JSON
    const cleanJSON = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(cleanJSON));

  } catch (error) {
    console.error('Error generating message:', error);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
