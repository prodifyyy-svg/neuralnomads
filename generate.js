// Vercel serverless function: only signed-in Supabase users can call the AI. The API key never reaches the browser.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  const who = await fetch(process.env.SUPABASE_URL + '/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + token, apikey: process.env.SUPABASE_ANON_KEY }
  });
  if (!who.ok) return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  const prompt = req.body && req.body.prompt;
  if (typeof prompt !== 'string' || prompt.length < 20 || prompt.length > 60000)
    return res.status(400).json({ error: 'Invalid request' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 8000, messages: [{ role: 'user', content: prompt }] })
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: (d.error && d.error.message) || 'AI error' });
    res.status(200).json({ text: d.content.map(c => c.text || '').join('') });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
};
