import React, { useState } from 'react'
import { motion } from 'framer-motion'

export function UploadForm({ onSubmit, isAnalyzing }) {
  const [resumeText, setResumeText] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'text/plain') {
      alert('For this MVP, please upload a .txt file, or paste your resume text directly below.')
      return
    }
    const text = await file.text()
    setResumeText(text)
  }

  const handleSubmit = () => {
    if (!resumeText.trim() && !githubUrl.trim()) {
      alert('Add at least your resume text or a GitHub URL.')
      return
    }
    onSubmit({ resumeText, githubUrl, jobDescription })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-6 py-16"
    >
      <h2 className="font-display text-2xl font-semibold text-white">Bring your evidence</h2>
      <p className="mt-1 text-sm text-white/50">
        Paste your resume or project descriptions, and/or link your GitHub. Job description is optional.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="text-xs uppercase tracking-wide text-white/40">Resume / projects text</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={7}
            placeholder="Paste your resume, project descriptions, or experience here..."
            className="mt-2 w-full rounded-xl border border-line bg-panel/60 p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet/60"
          />
          <div className="mt-2 flex items-center gap-3">
            <label className="cursor-pointer text-xs text-cyan hover:underline">
              Upload .txt file
              <input type="file" accept=".txt" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-white/40">GitHub URL (optional)</label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/yourusername"
            className="mt-2 w-full rounded-xl border border-line bg-panel/60 p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet/60"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-white/40">Job description (optional)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            placeholder="Paste a target job description to compare against instead of a predefined role..."
            className="mt-2 w-full rounded-xl border border-line bg-panel/60 p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet/60"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isAnalyzing}
          className="w-full rounded-xl bg-violet px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-violet/90 transition disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing…' : 'Build my Skill DNA'}
        </button>
      </div>
    </motion.div>
  )
}
