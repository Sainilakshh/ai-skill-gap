import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuroraBackground } from './components/ui/AuroraBackground'
import { FloatingDock } from './components/ui/FloatingDock'
import { Landing } from './components/Landing/Landing'
import { UploadForm } from './components/Analysis/UploadForm'
const SkillGraph3D = lazy(() => import('./components/SkillDNA/SkillGraph3D').then((m) => ({ default: m.SkillGraph3D })))
import { EvidencePanel } from './components/SkillDNA/EvidencePanel'
import { RoleSelector } from './components/TargetRole/RoleSelector'
import { GapReport } from './components/Gap/GapReport'
import { WhatIfPanel } from './components/WhatIf/WhatIfPanel'
import { RoadmapView } from './components/Roadmap/RoadmapView'
import { LoginModal } from './components/Auth/LoginModal'
import { HistoryList } from './components/History/HistoryList'
import {
  extractExplicitSkills, extractGithubSkills, mergeSkills,
  inferHiddenSkills, computeGap, buildRoadmap, makeManualSkill, rankRoles, findCategory,
} from './lib/skillEngine'
import { inferSkillsWithAI, extractRequirementsFromJD } from './lib/aiClient'
import { onAuthChange, getCurrentUser, signOut, saveAnalysis } from './lib/history'
import { DEMO_RESUME, DEMO_GITHUB_SKILLS, DEMO_TARGET_ROLE } from './data/demoPersona'

function HomeIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> }
function DnaIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg> }
function TargetIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }
function GapIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg> }
function FlaskIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M9 2v6l-6 10a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3L15 8V2"/></svg> }
function RouteIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4H8"/></svg> }

const LOADING_LINES = [
  'Reading between the lines…',
  'Connecting the dots…',
  'Decoding your DNA…',
  'Teaching the graph to glow…',
  'Separating signal from noise…',
]

function LoadingLine() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((prev) => (prev + 1) % LOADING_LINES.length), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={i}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="text-sm text-white/40"
      >
        {LOADING_LINES[i]}
      </motion.p>
    </AnimatePresence>
  )
}

const DOCK_ITEMS = [
  { id: 'dna', label: 'Skill DNA', icon: <DnaIcon className="h-5 w-5" /> },
  { id: 'role', label: 'Target Role', icon: <TargetIcon className="h-5 w-5" /> },
  { id: 'gap', label: 'Gap', icon: <GapIcon className="h-5 w-5" /> },
  { id: 'whatif', label: 'What If', icon: <FlaskIcon className="h-5 w-5" /> },
  { id: 'roadmap', label: 'Roadmap', icon: <RouteIcon className="h-5 w-5" /> },
  { id: 'landing', label: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
]

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [baseSkills, setBaseSkills] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [targetRole, setTargetRole] = useState(null)
  const [customRequirements, setCustomRequirements] = useState(null)
  const [addedSkillNames, setAddedSkillNames] = useState([])
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [inputSummary, setInputSummary] = useState('')
  const [savedToHistory, setSavedToHistory] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [copied, setCopied] = useState(false)

  // Load a shared profile from the URL hash (#s=...), no backend needed.
  useEffect(() => {
    if (!window.location.hash.startsWith('#s=')) return
    try {
      const { r, s } = JSON.parse(decodeURIComponent(atob(window.location.hash.slice(3))))
      setBaseSkills(s.map(([name, type, evidenceCount]) => ({
        name, type, evidenceCount, category: findCategory(name), evidence: ['From a shared Skill DNA profile'],
      })))
      if (r) setTargetRole(r)
      setInputSummary('Shared profile')
      setScreen('dna')
    } catch { /* bad link — ignore */ }
  }, [])

  async function handleShare() {
    const payload = { r: targetRole, s: baseSkills.map((k) => [k.name, k.type, k.evidenceCount]) }
    const url = `${window.location.origin}${window.location.pathname}#s=${btoa(encodeURIComponent(JSON.stringify(payload)))}`
    try { await navigator.clipboard.writeText(url) } catch { window.prompt('Copy your link:', url) }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Roadmap progress persists per role so it survives refreshes.
  const doneKey = (role) => `skilldna:done:${role || 'custom'}`
  useEffect(() => {
    try { setAddedSkillNames(JSON.parse(localStorage.getItem(doneKey(targetRole)) || '[]')) } catch { setAddedSkillNames([]) }
  }, [targetRole])
  function updateAdded(fn) {
    setAddedSkillNames((prev) => {
      const next = fn(prev)
      try { localStorage.setItem(doneKey(targetRole), JSON.stringify(next)) } catch { /* storage blocked */ }
      return next
    })
  }

  useEffect(() => {
    getCurrentUser().then(setUser)
    const unsub = onAuthChange(setUser)
    return unsub
  }, [])

  const allSkills = useMemo(() => {
    const manual = addedSkillNames.map(makeManualSkill)
    return mergeSkills(baseSkills, manual)
  }, [baseSkills, addedSkillNames])

  const { gaps, matchPercent } = useMemo(() => {
    if (!targetRole && !customRequirements) return { gaps: [], matchPercent: 100 }
    return computeGap(allSkills, targetRole, customRequirements)
  }, [allSkills, targetRole, customRequirements])

  // Roadmap is built from the un-simulated gaps so ticked items stay visible (and tickable).
  const baseGap = useMemo(() => {
    if (!targetRole && !customRequirements) return { gaps: [], matchPercent: 100 }
    return computeGap(baseSkills, targetRole, customRequirements)
  }, [baseSkills, targetRole, customRequirements])
  const roadmap = useMemo(() => buildRoadmap(baseGap.gaps), [baseGap])
  const ranking = useMemo(() => rankRoles(allSkills), [allSkills])

  function handleToggleRoadmap(skill) {
    updateAdded((prev) => (prev.includes(skill) ? prev.filter((n) => n !== skill) : [...prev, skill]))
  }

  const whatIfSuggestions = useMemo(() => {
    return gaps.filter((g) => g.status !== 'met').map((g) => g.skill).filter((s) => !addedSkillNames.includes(s)).slice(0, 8)
  }, [gaps, addedSkillNames])

  // Auto-save once we actually have something worth saving: skills + a
  // target role/JD + a computed gap. Fires once per analysis (guarded by
  // savedToHistory) so revisiting the gap screen doesn't insert duplicates.
  useEffect(() => {
    if (!user || savedToHistory) return
    if (baseSkills.length === 0) return
    if (!targetRole && !customRequirements) return
    if (gaps.length === 0) return
    saveAnalysis({
      userId: user.id,
      inputSummary,
      targetRole: targetRole || 'Custom job description',
      skillsJson: allSkills,
      gapJson: { gaps, matchPercent },
    }).then((res) => {
      setSavedToHistory(res.ok)
      setSaveError(res.ok ? null : res.error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, targetRole, customRequirements, gaps, savedToHistory, baseSkills])

  async function runAnalysis({ resumeText, githubUrl, jobDescription }) {
    setIsAnalyzing(true)
    setScreen('dna')
    setSavedToHistory(false)

    const explicit = extractExplicitSkills(resumeText || '')
    const ghSkills = githubUrl ? await extractGithubSkills(githubUrl) : []
    let merged = mergeSkills(explicit, ghSkills)

    const aiResult = await inferSkillsWithAI(merged.map((s) => s.name), resumeText || '')
    let inferred
    if (aiResult.ok && Array.isArray(aiResult.data?.inferred)) {
      inferred = aiResult.data.inferred.map((i) => ({
        name: i.name,
        category: 'AI/ML',
        type: 'inferred',
        evidenceCount: 1,
        evidence: [i.reason],
      }))
    } else {
      inferred = inferHiddenSkills(merged)
    }

    if (jobDescription?.trim()) {
      const jdResult = await extractRequirementsFromJD(jobDescription)
      if (jdResult.ok && jdResult.data?.required) {
        setCustomRequirements(jdResult.data.required)
        setTargetRole(null)
      }
    }

    setBaseSkills([...merged, ...inferred])
    setInputSummary(`${merged.length} explicit skills detected`)
    setIsAnalyzing(false)
  }

  function handleTryDemo() {
    setIsAnalyzing(true)
    setScreen('dna')
    setSavedToHistory(false)
    const explicit = extractExplicitSkills(DEMO_RESUME)
    const merged = mergeSkills(explicit, DEMO_GITHUB_SKILLS)
    const inferred = inferHiddenSkills(merged)
    setBaseSkills([...merged, ...inferred])
    setTargetRole(DEMO_TARGET_ROLE)
    setCustomRequirements(null)
    setInputSummary('Demo persona — Aarav Mehta')
    setIsAnalyzing(false)
  }

  function handleAddWhatIf(skillName) {
    updateAdded((prev) => (prev.includes(skillName) ? prev : [...prev, skillName]))
  }

  function handleAuthed(u) {
    setUser(u)
  }

  async function handleSaveToHistory() {
    if (!user) { setShowLogin(true); return }
    if (savedToHistory) return
    const res = await saveAnalysis({
      userId: user.id,
      inputSummary,
      targetRole: targetRole || 'Custom job description',
      skillsJson: allSkills,
      gapJson: { gaps, matchPercent },
    })
    setSavedToHistory(res.ok)
    setSaveError(res.ok ? null : res.error)
  }

  function handleReloadHistory(item) {
    setBaseSkills(item.skills_json || [])
    setTargetRole(item.target_role === 'Custom job description' ? null : item.target_role)
    setSavedToHistory(true)
    setShowHistory(false)
    setScreen('dna')
  }

  const hasResults = baseSkills.length > 0
  const dockItems = user ? DOCK_ITEMS : DOCK_ITEMS

  return (
    <div className="min-h-screen relative isolate">
      <div className="noise-overlay" />
      <AuroraBackground />

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
      {screen === 'landing' && (
        <Landing
          isLoggedIn={Boolean(user)}
          onTryDemo={handleTryDemo}
          onStartAnalysis={() => setScreen('upload')}
          onOpenLogin={() => (user ? setShowHistory(true) : setShowLogin(true))}
        />
      )}

      {screen === 'upload' && (
        <UploadForm onSubmit={runAnalysis} isAnalyzing={isAnalyzing} />
      )}

      {screen === 'dna' && (
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">Your Skill DNA</h2>
              <p className="mt-1 text-sm text-white/50">
                Solid glowing nodes = explicit. Dim wireframe nodes = AI-inferred. Drag to orbit, scroll to zoom.
              </p>
            </div>
            {hasResults && (
              <div className="text-right">
                <button
                  onClick={handleShare}
                  className="mr-2 rounded-lg border border-line px-3 py-2 text-xs text-white/60 hover:text-white hover:border-white/30"
                >
                  {copied ? 'Link copied ✓' : 'Share link'}
                </button>
                <button
                  onClick={handleSaveToHistory}
                  disabled={savedToHistory}
                  className="rounded-lg border border-line px-3 py-2 text-xs text-white/60 hover:text-white hover:border-white/30 disabled:opacity-50"
                >
                  {savedToHistory ? 'Saved ✓' : 'Save to history'}
                </button>
                {saveError && (
                  <p className="mt-1.5 max-w-[220px] text-[11px] text-rose-300">{saveError}</p>
                )}
              </div>
            )}
          </div>

          {isAnalyzing ? (
            <div className="mt-6 h-[440px] rounded-2xl border border-line bg-panel/40 flex items-center justify-center">
              <LoadingLine />
            </div>
          ) : (
            <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-5">
              <Suspense fallback={<div className="h-[440px] rounded-2xl border border-line bg-panel/40 flex items-center justify-center text-sm text-white/40">Loading 3D graph…</div>}>
                <SkillGraph3D skills={allSkills} onSelectSkill={setSelectedSkill} selectedSkill={selectedSkill} />
              </Suspense>
              <EvidencePanel skill={selectedSkill} />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setScreen('role')}
              className="rounded-xl bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet/90"
            >
              Continue to target role →
            </button>
          </div>
        </div>
      )}

      {screen === 'role' && (
        <>
          <RoleSelector
            selectedRole={targetRole}
            hasCustomRequirements={Boolean(customRequirements)}
            ranking={ranking}
            onSelectRole={(r) => { setTargetRole(r); setCustomRequirements(null) }}
          />
          <div className="mx-auto max-w-3xl px-6 flex justify-end pb-10">
            <button
              onClick={() => setScreen('gap')}
              disabled={!targetRole && !customRequirements}
              className="rounded-xl bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet/90 disabled:opacity-40"
            >
              See gap analysis →
            </button>
          </div>
        </>
      )}

      {screen === 'gap' && (
        <>
          <GapReport
            matchPercent={matchPercent}
            gaps={gaps}
            targetRole={targetRole || 'Custom Role'}
            topSkills={allSkills.filter((s) => s.type === 'explicit').map((s) => s.name)}
          />
          <div className="mx-auto max-w-4xl px-6 flex justify-end pb-10">
            <button
              onClick={() => setScreen('whatif')}
              className="rounded-xl bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet/90"
            >
              Try WHAT IF →
            </button>
          </div>
        </>
      )}

      {screen === 'whatif' && (
        <>
          <WhatIfPanel
            suggestions={whatIfSuggestions}
            addedSkills={addedSkillNames}
            matchPercent={matchPercent}
            onAdd={handleAddWhatIf}
            onReset={() => updateAdded(() => [])}
          />
          <div className="mx-auto max-w-3xl px-6 flex justify-end pb-10">
            <button
              onClick={() => setScreen('roadmap')}
              className="rounded-xl bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet/90"
            >
              View roadmap →
            </button>
          </div>
        </>
      )}

      {screen === 'roadmap' && <RoadmapView roadmap={roadmap} doneSkills={addedSkillNames} onToggle={handleToggleRoadmap} baseMatch={baseGap.matchPercent} matchPercent={matchPercent} />}
        </motion.div>
      </AnimatePresence>

      {hasResults && screen !== 'landing' && screen !== 'upload' && (
        <FloatingDock items={dockItems} activeId={screen} onSelect={setScreen} />
      )}

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onAuthed={handleAuthed} />
      )}
      {showHistory && user && (
        <HistoryList user={user} onClose={() => setShowHistory(false)} onReload={handleReloadHistory} />
      )}
    </div>
  )
}
