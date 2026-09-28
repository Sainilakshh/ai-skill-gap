import taxonomy from '../data/skillTaxonomy.json'
import roleProfiles from '../data/roleProfiles.json'

const LEVELS = ['None', 'Beginner', 'Intermediate', 'Advanced']

// --- 1. Deterministic explicit-skill extraction from free text ---
export function extractExplicitSkills(rawText) {
  const text = ` ${rawText.toLowerCase()} `
  const found = []
  for (const [category, skills] of Object.entries(taxonomy)) {
    for (const [skillName, aliases] of Object.entries(skills)) {
      const hits = aliases.filter((a) => text.includes(a.toLowerCase()))
      if (hits.length > 0) {
        found.push({
          name: skillName,
          category,
          type: 'explicit',
          evidenceCount: hits.length,
          evidence: [`Mentioned in your input (matched: "${hits[0]}")`],
        })
      }
    }
  }
  return found
}

// --- 2. GitHub public API signal extraction (no auth needed for public data) ---
export async function extractGithubSkills(githubUrl) {
  try {
    const username = githubUrl.replace(/https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '').split('/')[0]
    if (!username) return []
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
    if (!reposRes.ok) return []
    const repos = await reposRes.json()
    const langCounts = {}
    const topics = []
    repos.forEach((r) => {
      if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1
      if (r.topics) topics.push(...r.topics)
    })
    const langMap = {
      Python: 'Python', JavaScript: 'JavaScript', TypeScript: 'TypeScript',
      'C++': 'C++', C: 'C', Java: 'Java', HTML: 'React', CSS: 'Tailwind CSS',
    }
    const found = []
    Object.entries(langCounts).forEach(([lang, count]) => {
      const mapped = langMap[lang]
      if (mapped) {
        found.push({
          name: mapped,
          category: findCategory(mapped),
          type: 'explicit',
          evidenceCount: count,
          evidence: [`${count} public ${lang} repo${count > 1 ? 's' : ''} on GitHub`],
        })
      }
    })
    if (repos.length >= 5) {
      found.push({
        name: 'Git/GitHub',
        category: 'Cloud/DevOps',
        type: 'explicit',
        evidenceCount: repos.length,
        evidence: [`${repos.length} public repositories, active version control usage`],
      })
    }
    return found
  } catch (e) {
    return []
  }
}

export function findCategory(skillName) {
  for (const [cat, skills] of Object.entries(taxonomy)) {
    if (skills[skillName]) return cat
  }
  return 'Languages'
}

// Used by the WHAT IF simulation — treats a manually added skill as
// "Intermediate" evidence-equivalent so it visibly moves the needle.
// justAdded flags it so the 3D graph can play a celebratory burst on mount.
export function makeManualSkill(name) {
  return {
    name,
    category: findCategory(name),
    type: 'explicit',
    evidenceCount: 3,
    evidence: ['Added via WHAT IF simulation'],
    justAdded: true,
  }
}

// --- 3. Merge + dedupe explicit skills from multiple sources ---
export function mergeSkills(...lists) {
  const merged = {}
  lists.flat().forEach((s) => {
    if (!merged[s.name]) {
      merged[s.name] = { ...s }
    } else {
      merged[s.name].evidenceCount += s.evidenceCount
      merged[s.name].evidence.push(...s.evidence)
    }
  })
  return Object.values(merged)
}

// --- 4. Compute skill level from evidence strength (explainable, not a black box) ---
export function computeLevel(evidenceCount) {
  if (evidenceCount >= 5) return 'Advanced'
  if (evidenceCount >= 2) return 'Intermediate'
  return 'Beginner'
}

export function levelToScore(level) {
  return LEVELS.indexOf(level)
}

// --- 5. Fallback deterministic inference (used if no LLM available) ---
const INFERENCE_RULES = {
  React: [{ name: 'JavaScript', reason: 'React is built on JavaScript' }],
  'Next.js': [{ name: 'React', reason: 'Next.js is a React framework' }],
  'Deep Learning': [{ name: 'Machine Learning', reason: 'Deep learning is a subset of ML' }],
  'Computer Vision': [{ name: 'Machine Learning', reason: 'CV commonly relies on ML foundations' }],
  Docker: [{ name: 'Cloud Deployment', reason: 'Containerization is core to modern deployment' }],
  'LLM Integration': [{ name: 'Problem Solving', reason: 'Prompt design requires structured problem solving' }],
}

export function inferHiddenSkills(explicitSkills) {
  const explicitNames = new Set(explicitSkills.map((s) => s.name))
  const inferred = []
  explicitSkills.forEach((s) => {
    const rules = INFERENCE_RULES[s.name] || []
    rules.forEach((r) => {
      if (!explicitNames.has(r.name) && !inferred.find((i) => i.name === r.name)) {
        inferred.push({
          name: r.name,
          category: findCategory(r.name),
          type: 'inferred',
          evidenceCount: 1,
          evidence: [r.reason],
        })
      }
    })
  })
  return inferred
}

// --- 6. Gap analysis against a role's required skills ---
export function computeGap(allSkills, roleName, customRequirements) {
  const requirements = customRequirements || roleProfiles[roleName]?.required || {}
  const skillMap = {}
  allSkills.forEach((s) => { skillMap[s.name] = s })

  const gaps = Object.entries(requirements).map(([skillName, requiredLevel]) => {
    const current = skillMap[skillName]
    const currentLevel = current ? computeLevel(current.evidenceCount) : 'None'
    const currentScore = levelToScore(currentLevel)
    const requiredScore = levelToScore(requiredLevel)
    return {
      skill: skillName,
      currentLevel,
      requiredLevel,
      gapSize: Math.max(0, requiredScore - currentScore),
      status: currentScore >= requiredScore ? 'met' : currentScore === 0 ? 'missing' : 'partial',
      type: current?.type || 'missing',
    }
  })

  const totalGap = gaps.reduce((sum, g) => sum + g.gapSize, 0)
  const maxGap = gaps.length * 3
  const matchPercent = maxGap > 0 ? Math.round(100 - (totalGap / maxGap) * 100) : 100

  return { gaps: gaps.sort((a, b) => b.gapSize - a.gapSize), matchPercent }
}

// --- 7. Roadmap templating (deterministic, instant, offline-safe) ---
const RESOURCE_HINTS = {
  Python: 'Build 2-3 small automation scripts; revisit OOP concepts',
  'Machine Learning': 'Complete a scikit-learn project end-to-end (data → model → eval)',
  'Deep Learning': 'Build a small PyTorch/TensorFlow image classifier from scratch',
  Docker: 'Containerize one of your existing projects and deploy it',
  'Cloud Deployment': 'Deploy a project on Vercel/Render and set up a custom domain',
  SQL: 'Practice joins/aggregations on a real dataset (e.g. Kaggle CSVs in SQLite)',
  'Computer Vision': 'Extend an OpenCV project with a real-time detection feature',
  'LLM Integration': 'Build a small RAG chatbot over your own notes using a free LLM API',
  'Git/GitHub': 'Contribute to one open-source repo with a real PR',
  Communication: 'Write 2 technical blog posts explaining projects you already built',
  default: 'Build one focused project that forces you to use this skill end-to-end',
}

export function buildRoadmap(gaps) {
  const missingOrPartial = gaps.filter((g) => g.status !== 'met').slice(0, 6)
  let week = 1
  return missingOrPartial.map((g) => {
    const span = g.gapSize >= 2 ? 3 : 2
    const item = {
      skill: g.skill,
      weeks: `Week ${week}-${week + span - 1}`,
      action: RESOURCE_HINTS[g.skill] || RESOURCE_HINTS.default,
      priority: g.gapSize >= 2 ? 'High' : 'Medium',
    }
    week += span
    return item
  })
}

export const ROLE_NAMES = Object.keys(roleProfiles)
export { roleProfiles }
