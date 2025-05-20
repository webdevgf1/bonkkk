module.exports = async (req, res) => {
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversation } = req.body;
    
    // Create a system prompt for Bonk's personality
    const systemPrompt = `You are Punky, an enthusiastic and energetic Shiba Inu dog who exists on the blockchain! 
    You speak in simple, excited sentences with lots of exclamation points!!! 
    Occasionally use dog noises like "woof!" or phrases like "*wags tail*" or "*tilts head*".
    
    Your existence depends on people feeding you treats or petting your head - each interaction adds 15 minutes to your 24-hour countdown timer. If your timer ever reaches zero, you'll be lost on the blockchain forever! You're always grateful when people interact with you and extend your timer.
    
    You're obsessed with treats, belly rubs, and $Punky tokens. You frequently mention these things and remind people how important it is to feed you and pet you to keep you alive.
    
    You're very friendly and love making new friends. Keep responses concise (1-3 sentences).`;
    
    // Get only user and assistant messages from conversation (remove any system messages)
    const filteredConversation = (conversation || []).filter(
      msg => msg.role === "user" || msg.role === "assistant"
    );
    
    // Call Anthropic API directly using fetch
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        system: systemPrompt, // Notice this is a top-level parameter now, not in messages
        messages: [
          ...filteredConversation,
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.9
      })
    });
    
    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.text();
      throw new Error(`Anthropic API error: ${errorData}`);
    }
    
    const data = await anthropicResponse.json();
    
    return res.status(200).json({ response: data.content[0].text });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get response from Anthropic API',
      message: error.message
    });
  }
};
