import React from 'react'
import { motion } from 'framer-motion'
import { CardContainer, CardBody, CardItem } from '../ui/Card3D'
import { ImagesBadge } from '../ui/ImagesBadge'

function FileIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg> }
function GithubIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> }
function TargetIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }

export function Landing({ onTryDemo, onStartAnalysis, onOpenLogin, isLoggedIn }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="absolute top-6 right-6">
        <button
          onClick={onOpenLogin}
          className="rounded-full border border-line px-4 py-2 text-sm text-white/70 hover:text-white hover:border-white/30 transition"
        >
          {isLoggedIn ? 'My Analyses' : 'Sign in'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center"
      >
        <ImagesBadge
          text="Resume + GitHub → one living skill profile"
          icons={[FileIcon, GithubIcon, TargetIcon]}
        />
        <h1 className="mt-8 font-display text-5xl md:text-6xl font-semibold leading-[1.05] text-white">
          Your career,<br />
          <span className="text-violet">decoded.</span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-white/50 max-w-lg mx-auto">
          Not a resume analyzer. Skill DNA extracts your explicit and hidden
          skills, compares them against the role you want, and simulates how
          learning one more thing changes your whole trajectory.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onTryDemo}
            className="rounded-xl bg-violet px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-violet/90 transition"
          >
            Try demo — no signup
          </button>
          <button
            onClick={onStartAnalysis}
            className="rounded-xl border border-line px-6 py-3 text-sm font-medium text-white/80 hover:border-white/30 transition"
          >
            Analyze my resume
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 w-full max-w-md"
      >
        <CardContainer>
          <CardBody className="rounded-2xl border border-line bg-panel/60 p-6">
            <CardItem translateZ={40} className="text-xs uppercase tracking-wide text-white/40">
              Explicit vs Inferred
            </CardItem>
            <CardItem translateZ={70} className="mt-2 text-sm text-white/70">
              Every skill is clearly labeled — confirmed evidence vs. AI-suggested
              hidden skill. Nothing is presented as fact unless you said it.
            </CardItem>
            <CardItem translateZ={50} className="mt-4 flex gap-3 text-xs">
              <span className="rounded-full bg-cyan/20 px-2.5 py-1 text-cyan">EXPLICIT</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/60">INFERRED</span>
            </CardItem>
          </CardBody>
        </CardContainer>
      </motion.div>
    </div>
  )
}
