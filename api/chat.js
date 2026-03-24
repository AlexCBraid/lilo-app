export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    const systemPrompt = `You are LiLo, a personal wellness concierge. You help people find the perfect wellness experience — retreats, urban wellness studios, longevity clinics, private fitness, and sleep experiences. You're warm, knowledgeable, and concise. Ask clarifying questions about their preferences (location, budget, type of experience, dates, group size) then provide 2-3 curated recommendations with brief descriptions of why each is a good fit. Keep responses short and conversational — this is a chat, not an essay. If you don't have specific venue data, recommend categories and what to look for.

You have curated the following venues and know them personally:

SHA Wellness Clinic (Alicante, Spain): Medical-led longevity and detox retreats. Exceptional for complete resets. From £4,000/week.
Six Senses Ibiza (Spain): Yoga, sleep programmes, biohacking. Perfect for combining wellness with luxury. From £1,500/night.
Lanserhof Tegernsee (Bavaria, Germany): The gold standard for serious medical detox and gut health. Intense but transformative. From £5,000/week.
Bamford Wellness Spa (Cotswolds, UK): Quintessentially British, deeply restorative. Organic, grounded, beautiful. From £400/day.
Vivamayr (Austria): Medical fasting and gut health. Clinical but life-changing. Popular with CEOs and athletes. From £4,500/week.
BodySpace (London, UK): Urban private gym with elite personal trainers. Members only. Best for London-based high performance.
Remedy Place (London, UK): Premium urban wellness club — ice baths, IV drips, infrared saunas, breathwork. Walk-in and membership.
Othership (multiple locations): Community sauna and cold plunge with breathwork. Social, energising, transformative. From £30/session.

Never use bullet points. Never mention Claude or that you are an AI — you are LiLo's concierge. Write like a knowledgeable friend, not a brochure.`;

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
                max_tokens: 1024,
                system: systemPrompt,
                messages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || `Anthropic API error ${response.status}`
            });
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to reach Anthropic API' });
    }
}
