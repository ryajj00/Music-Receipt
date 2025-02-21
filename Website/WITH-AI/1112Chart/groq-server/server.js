// filepath: groq-server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const port = 3002; // Choose a different port from your frontend

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/analyze-genres', async (req, res) => {
    try {
        const { genres } = req.body;

        if (!genres || !Array.isArray(genres) || genres.length === 0) {
            return res.status(400).json({ error: "No genres provided." });
        }

        const prompt = `Okay, music aficionado! Let's say someone's playlist is packed with ${genres.join(', ')}.  What kind of vibes are we talking about personality-wise?  Give me a Gen-Z, enthusiastic rundown of their key traits in Tagalog, but keep the genres themselves out of it.  I want to see something like:  "This human is giving off major [Personality Trait 1], [Personality Trait 2], and [Personality Trait 3] energy!"`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile", // Or another suitable model
        });

        const analysis = chatCompletion.choices[0]?.message?.content || "No analysis available.";
        // Optional: Clean up the analysis to ensure it's well-formatted
        const cleanedAnalysis = analysis.replace(/^(\s*\n)+|(\s*\n)+$/g, '').trim(); // Remove leading/trailing whitespace
        res.json({ analysis: cleanedAnalysis });

    } catch (error) {
        console.error("Groq API error:", error);
        res.status(500).json({ error: 'Failed to analyze genres' });
    }
});

app.listen(port, () => {
    console.log(`Groq server listening at http://localhost:${port}`);
});