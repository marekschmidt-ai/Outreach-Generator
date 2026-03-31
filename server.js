const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const mysql = require('mysql2/promise');
const fs = require('fs');

dotenv.config();

// TiDB Connection Pool
const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  connectionLimit: 1,
  maxIdle: 1,
  enableKeepAlive: true
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS outreach_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255),
        linkedin_url VARCHAR(500),
        linkedin_message TEXT,
        email_subject VARCHAR(255),
        email_body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try {
      await pool.query('ALTER TABLE outreach_history ADD COLUMN why_tidb TEXT, ADD COLUMN call_script TEXT');
    } catch (e) {
      // Ignore if columns already exist
    }
    console.log('✅ TiDB Backend Database Initialized');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
  }
}
initDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Context Endpoints
app.get('/api/context', (req, res) => {
  try {
    if (fs.existsSync('context.json')) {
      const data = fs.readFileSync('context.json', 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ gtmPlaybook: '', battleCard: '' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to read context' });
  }
});

app.post('/api/context', (req, res) => {
  try {
    fs.writeFileSync('context.json', JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save context' });
  }
});

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
    const { companyName, linkedinUrl, extraNotes, gtmPlaybook, battleCard } = req.body;

    const userMessage = `CONTEXT - GTM PLAYBOOK:
${gtmPlaybook || 'None provided'}

CONTEXT - COMPETITIVE BATTLE CARD:
${battleCard || 'None provided'}

LEAD INFORMATION:
- Target Company: ${companyName}
- LinkedIn Profile URL: ${linkedinUrl || 'N/A'}
- Additional Notes: ${extraNotes || 'N/A'}

INSTRUCTIONS:
1. The prospect works at "${companyName}". Use Google Search Tools to thoroughly research "${companyName}" (their company website, tech blogs, and specifically engineering job postings) to definitively discover what datastores/technologies they currently use. DO NOT guess the company name from the LinkedIn URL.
2. Search aggressively for any database or scalability challenges "${companyName}" is facing in their engineering posts. Check the prospect's LinkedIn URL/notes for personal angles.
3. Compare all of the information about their tech stack with the Competitive Battle Card. Give an explicit answer to the question: "Why would they want to speak with TiDB - where are we better?".
4. Draft a proposed LinkedIn message, Email, and a Call Script that aggressively leverage these custom strategic findings.
5. Return ONLY valid JSON block.
{
  "why_tidb": "Your explicit strategic analysis of why they need TiDB compared to their current stack...",
  "personalization_notes": [
    "Note 1: Company X relies on Aurora...",
    "Note 2: Prospect is a VP of Eng..."
  ],
  "linkedin_message": "...",
  "email_subject": "...",
  "email_body": "...",
  "call_script": "..."
}`;

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
            tools: [{ googleSearch: {} }],
            safetySettings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
          }
        });
        if (!response.text) throw new Error("EMPTY_PAYLOAD");
        break;
      } catch (err) {
        retries--;
        console.error(`Attempt failed, ${retries} retries left. Error: ${err.message}`);
        // Fallback to pure generation without search grounding if Search API returns completely empty.
        if (retries === 0 || err.message === "EMPTY_PAYLOAD") {
          console.log("Primary model completely failed or returned empty payload. Attempting fallback to pure generation without search grounding...");
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage + "\n\n(Note: Live search failed or is inaccessible. Rely exclusively on your internal training data to estimate the company's tech stack).",
            config: {
              systemInstruction: SYSTEM_PROMPT,
              responseMimeType: "application/json",
              safetySettings: [
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
              ]
            }
          });
          break;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    const outputText = response.text;
    if (!outputText) {
      console.error('Safety block or empty response. Payload:', JSON.stringify(response));
      return res.status(400).json({ error: 'Generation blocked by safety filters or returned empty.' });
    }
    
    // Extract strictly the JSON object to bypass conversational preambles
    let cleanJSON = outputText;
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJSON = jsonMatch[0];
    } else {
      // Fallback standard strip
      cleanJSON = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const finalJSON = JSON.parse(cleanJSON);

    // Save strictly successfully generated artifacts into TiDB background
    pool.query(
      `INSERT INTO outreach_history (company_name, linkedin_url, why_tidb, linkedin_message, email_subject, email_body, call_script) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [companyName, linkedinUrl, finalJSON.why_tidb, finalJSON.linkedin_message, finalJSON.email_subject, finalJSON.email_body, finalJSON.call_script]
    ).then(() => {
      console.log(`✅ Saved generation for ${companyName} to TiDB`);
    }).catch(dbErr => console.error('❌ Database save error:', dbErr));

    res.json(finalJSON);

  } catch (error) {
    console.error('Error generating message:', error);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
