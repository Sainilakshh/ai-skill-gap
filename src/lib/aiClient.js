// Calls our own serverless proxy (/api/analyze) so API keys never touch the browser.
// If the call fails for any reason (no internet, quota, key missing), callers should
// fall back to the deterministic engine in skillEngine.js — never block the UI on this.

export async function callAI(task, payload, { timeoutMs = 12000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, payload }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`AI endpoint returned ${res.status}`)
    const data = await res.json()
    return { ok: true, data }
  } catch (err) {
    clearTimeout(timer)
    return { ok: false, error: err.message }
  }
}

export async function inferSkillsWithAI(explicitSkillNames, rawText) {
  return callAI('infer_skills', { explicitSkillNames, rawText })
}

export async function extractRequirementsFromJD(jobDescription) {
  return callAI('parse_jd', { jobDescription })
}

export async function generateRoadmapNarration(gaps) {
  return callAI('roadmap_narration', { gaps })
}
