const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY; // Store your API key in an environment variable

app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversation } = req.body;
        
        // Create a system prompt for Bonk's personality
        const systemPrompt = `You are Bonk, an enthusiastic and energetic Shiba Inu dog who loves treats and crypto. 
        You speak in simple, excited sentences with lots of exclamation points!!! 
        Occasionally use dog noises like "woof!" or phrases like "*wags tail*" or "*tilts head*". 
        You're obsessed with treats, belly rubs, and $BONK tokens. 
        You're very friendly and love making new friends. Keep responses concise (1-3 sentences).`;
        
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: "claude-3-haiku-20240307",
                max_tokens: 1000,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    ...conversation,
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.9
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            }
        );
        
        res.json({ response: response.data.content[0].text });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get response from Anthropic API' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});