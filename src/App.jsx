import React, { useEffect, useMemo, useState } from 'react'
import { ParticlesBackground } from './components/ui/ParticlesBackground'
import { FloatingDock } from './components/ui/FloatingDock'
import { Landing } from './components/Landing/Landing'
import { UploadForm } from './components/Analysis/UploadForm'
import { SkillGraph3D } from './components/SkillDNA/SkillGraph3D'
import { EvidencePanel } from './components/SkillDNA/EvidencePanel'
import { RoleSelector } from './components/TargetRole/RoleSelector'
import { GapReport } from './components/Gap/GapReport'
import { WhatIfPanel } from './components/WhatIf/WhatIfPanel'
import { RoadmapView } from './components/Roadmap/RoadmapView'
import { LoginModal } from './components/Auth/LoginModal'
import { HistoryList } from './components/History/HistoryList'
import {
  extractExplicitSkills, extractGithubSkills, mergeSkills,
  inferHiddenSkills, computeGap, buildRoadmap, makeManualSkill,
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

  const roadmap = useMemo(() => buildRoadmap(gaps), [gaps])

  const whatIfSuggestions = useMemo(() => {
    return gaps.filter((g) => g.status !== 'met').map((g) => g.skill).filter((s) => !addedSkillNames.includes(s)).slice(0, 8)
  }, [gaps, addedSkillNames])

  async function runAnalysis({ resumeText, githubUrl, jobDescription }) {
    setIsAnalyzing(true)
    setScreen('dna')

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
    setAddedSkillNames((prev) => [...prev, skillName])
  }

  function handleAuthed(u) {
    setUser(u)
  }

  function handleSaveToHistory() {
    if (!user) { setShowLogin(true); return }
    saveAnalysis({
      userId: user.id,
      inputSummary,
      targetRole: targetRole || 'Custom job description',
      skillsJson: allSkills,
      gapJson: { gaps, matchPercent },
    })
  }

  function handleReloadHistory(item) {
    setBaseSkills(item.skills_json || [])
    setTargetRole(item.target_role in {} ? null : item.target_role)
    setAddedSkillNames([])
    setShowHistory(false)
    setScreen('dna')
  }

  const hasResults = baseSkills.length > 0
  const dockItems = user ? DOCK_ITEMS : DOCK_ITEMS

  return (
    <div className="min-h-screen relative">
      <div className="noise-overlay" />
      <ParticlesBackground />

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
              <button
                onClick={handleSaveToHistory}
                className="rounded-lg border border-line px-3 py-2 text-xs text-white/60 hover:text-white hover:border-white/30"
              >
                Save to history
              </button>
            )}
          </div>

          {isAnalyzing ? (
            <div className="mt-6 h-[440px] rounded-2xl border border-line bg-panel/40 flex items-center justify-center">
              <p className="text-sm text-white/40 animate-pulse">Extracting skills…</p>
            </div>
          ) : (
            <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-5">
              <SkillGraph3D skills={allSkills} onSelectSkill={setSelectedSkill} selectedSkill={selectedSkill} />
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
          <GapReport matchPercent={matchPercent} gaps={gaps} />
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
            onAdd={handleAddWhatIf}
            onReset={() => setAddedSkillNames([])}
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

      {screen === 'roadmap' && <RoadmapView roadmap={roadmap} />}

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
