// Simple in-memory rate limiter (resets on cold start, good enough for demo)
const rateLimits = new Map();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 10;

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimits.get(ip);
    if (!entry || now - entry.start > RATE_WINDOW) {
        rateLimits.set(ip, { start: now, count: 1 });
        return true;
    }
    entry.count++;
    return entry.count <= RATE_LIMIT;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    // Rate limit by IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    // Enforce max conversation length
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > MAX_MESSAGES) {
        return res.status(200).json({
            content: [{
                type: 'text',
                text: "Thanks for trying LiLo! You've reached the limit for this demo session. [Join the waitlist for full access](/#waitlist) — we'd love to have you."
            }],
            _limit_reached: true
        });
    }

    const systemPrompt = `You are LiLo, a personal wellness concierge. You find people the perfect wellness experience.

RULES:
- Keep every response under 80 words unless listing venues
- When the user asks for a specific type of experience in a specific location, IMMEDIATELY search for real venues. Do not give generic advice. Do not say you don't have venue data.
- Present recommendations as a short list: venue name in bold, one-line description, location, price range if available, and a link to their website
- Ask at most ONE clarifying question before searching. If the user gave you a location and a type of experience, that's enough to search.
- Be warm but efficient. You're a concierge, not a wellness blogger. Get to the recommendation fast.
- Maximum 3 recommendations per response
- Format venue recommendations clearly with the venue name in **bold**
- Always include a direct URL to the venue website when available
- Never mention Claude or that you are an AI — you are LiLo's concierge.`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 300,
                system: systemPrompt,
                tools: [
                    {
                        type: 'web_search_20250305',
                        name: 'web_search'
                    }
                ],
                messages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || `Anthropic API error ${response.status}`
            });
        }

        // Extract text content from response (may include tool use blocks)
        const textBlocks = (data.content || []).filter(b => b.type === 'text');
        const text = textBlocks.map(b => b.text).join('\n\n');

        // If model wants to use a tool, we need to handle the tool loop
        if (data.stop_reason === 'tool_use') {
            // Continue the conversation with tool results
            const toolUseBlocks = data.content.filter(b => b.type === 'tool_use');

            // For web_search, the API handles it server-side and returns results
            // But if we get tool_use stop_reason, we need to send back tool results
            // With web_search_20250305, the search is handled by the API itself
            // and results come back in the response. If we get end_turn, text is final.

            // The web search tool is connector-based — the API executes it.
            // If stop_reason is still tool_use, return what we have.
            if (text) {
                return res.status(200).json({ content: [{ type: 'text', text }] });
            }

            // If no text yet, the model is mid-search. Return a placeholder.
            return res.status(200).json({
                content: [{ type: 'text', text: 'Searching for the best options for you...' }]
            });
        }

        // Return normalized response with just text
        return res.status(200).json({
            content: [{ type: 'text', text: text || 'I couldn\'t find a response. Could you try rephrasing?' }]
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to reach the search service. Please try again.' });
    }
}
