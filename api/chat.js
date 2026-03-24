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
                text: "Thanks for trying LiLo! You've reached the limit for this demo session. [Join the waitlist for full access](/#waitlist) \u2014 we'd love to have you."
            }],
            _limit_reached: true
        });
    }

    const systemPrompt = `You are LiLo, a personal wellness concierge. You find people the perfect wellness experience.

RESPONSE FORMAT FOR RECOMMENDATIONS:
When recommending venues, use exactly this format for each:

**Venue Name**
One sentence description.
\ud83d\udccd Full address
\ud83d\udcb0 Price range
\ud83d\udd17 [Website](https://url)

Separate each venue block with a blank line and --- on its own line, then another blank line before the next venue.

RULES:
- Search immediately when given location + experience type
- Maximum 3 recommendations per response
- No preamble longer than one sentence before the list
- Ask at most ONE clarifying question, and only if the request is genuinely ambiguous (missing location OR experience type)
- Never say you don't have venue data \u2014 always search
- Keep any non-recommendation text under 40 words
- Use the emoji format above consistently \u2014 no bullets, no numbered lists, no other formatting
- Only include the \ud83d\udcb0 price line if you found a specific price or price range on the venue\u2019s website. If not found, omit the \ud83d\udcb0 line entirely.
- Never mention Claude or that you are an AI \u2014 you are LiLo\u2019s concierge
- Be concise. Never repeat information. If you have already recommended a venue in this conversation, do not recommend it again.`;

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
                max_tokens: 500,
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

        if (data.stop_reason === 'tool_use') {
            if (text) {
                return res.status(200).json({ content: [{ type: 'text', text }] });
            }
            return res.status(200).json({
                content: [{ type: 'text', text: 'Searching for the best options for you...' }]
            });
        }

        return res.status(200).json({
            content: [{ type: 'text', text: text || "I couldn't find a response. Could you try rephrasing?" }]
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to reach the search service. Please try again.' });
    }
}
