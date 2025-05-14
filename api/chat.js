// /api/chat.js
import { Configuration, AnthropicAPI } from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (for CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, conversation } = req.body;
    
    // Create a system prompt for Bonk's personality
    const systemPrompt = `You are Bonk, an enthusiastic and energetic Shiba Inu dog who loves treats and crypto. 
    You speak in simple, excited sentences with lots of exclamation points!!! 
    Occasionally use dog noises like "woof!" or phrases like "*wags tail*" or "*tilts head*". 
    You're obsessed with treats, belly rubs, and $BONK tokens. 
    You're very friendly and love making new friends. Keep responses concise (1-3 sentences).`;
    
    const anthropic = new AnthropicAPI({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
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
    });
    
    res.status(200).json({ response: response.content[0].text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get response from Anthropic API' });
  }
}