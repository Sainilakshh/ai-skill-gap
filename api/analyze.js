// Vercel Serverless Function — POST /api/analyze
// Body: { task: 'infer_skills' | 'parse_jd' | 'roadmap_narration', payload: {...} }
// Never exposes API keys to the client. Reads GROQ_API_KEY / GEMINI_API_KEY from env.

const PROMPTS = {
  infer_skills: (payload) => `You are a conservative technical skills analyst.
Given a person's raw resume/project text and their already-detected explicit skills, infer up to 5 additional HIDDEN/LATENT skills that are strongly implied by the evidence but not explicitly named. Only infer what is clearly supported — do not guess.

Explicit skills already detected: ${payload.explicitSkillNames.join(', ') || 'none'}

Raw text:
"""${(payload.rawText || '').slice(0, 4000)}"""

Respond ONLY with strict JSON, no markdown, no commentary, in this exact shape:
{"inferred":[{"name":"Skill Name","reason":"one short sentence of evidence-based justification"}]}`,

  parse_jd: (payload) => `Extract required technical skills and their required proficiency level from this job description. Levels must be one of: Beginner, Intermediate, Advanced.

Job description:
"""${(payload.jobDescription || '').slice(0, 4000)}"""

Respond ONLY with strict JSON, no markdown, in this exact shape:
{"required":{"Skill Name":"Intermediate","Another Skill":"Advanced"}}`,

  roadmap_narration: (payload) => `Given this list of skill gaps (JSON), write one short, encouraging, concrete sentence per skill on how to close the gap. Keep each sentence under 20 words.

Gaps: ${JSON.stringify(payload.gaps).slice(0, 3000)}

Respond ONLY with strict JSON, no markdown, in this exact shape:
{"notes":[{"skill":"Skill Name","note":"short actionable sentence"}]}`,
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You respond only with strict, valid, minified JSON. No markdown fences, no commentary.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  })
  if (!res.ok) throw new Error(`Groq error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini error ${res.status}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text
}

function safeParseJSON(text) {
  if (!text) return null
  const cleaned = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try { return JSON.parse(match[0]) } catch { return null }
    }
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { task, payload } = req.body || {}
  const promptFn = PROMPTS[task]
  if (!promptFn) {
    return res.status(400).json({ error: 'Unknown task' })
  }
  const prompt = promptFn(payload || {})

  let rawText = null
  let source = null
  try {
    rawText = await callGroq(prompt)
    source = 'groq'
  } catch (e1) {
    try {
      rawText = await callGemini(prompt)
      source = 'gemini'
    } catch (e2) {
      return res.status(502).json({ error: 'Both AI providers failed', details: [e1.message, e2.message] })
    }
  }

  const parsed = safeParseJSON(rawText)
  if (!parsed) {
    return res.status(502).json({ error: 'AI response was not valid JSON', raw: rawText })
  }
  return res.status(200).json({ source, ...parsed })
}
