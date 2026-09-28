import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

const CATEGORY_COLORS = {
  Languages: '#22D3EE',
  Frameworks: '#8B5CF6',
  'AI/ML': '#F5B942',
  Data: '#34D399',
  'Cloud/DevOps': '#F472B6',
  'Soft Skills': '#94A3B8',
}

function layoutSkills(skills) {
  const byCategory = {}
  skills.forEach((s) => {
    byCategory[s.category] = byCategory[s.category] || []
    byCategory[s.category].push(s)
  })
  const categories = Object.keys(byCategory)
  const nodes = []
  categories.forEach((cat, ci) => {
    const ringRadius = 2.2 + ci * 1.4
    const items = byCategory[cat]
    items.forEach((skill, i) => {
      const angle = (i / items.length) * Math.PI * 2 + ci * 0.5
      const y = (Math.sin(ci * 1.3 + i) * 0.6)
      nodes.push({
        ...skill,
        position: [Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius],
        color: CATEGORY_COLORS[cat] || '#8B5CF6',
      })
    })
  })
  return nodes
}

// A small dot travels from the core out to each explicit skill node along
// its connection line — gives the graph a "living data" feel.
function DataFlowLine({ from, to, color, active }) {
  const dotRef = useRef()
  const t = useRef(Math.random())
  const speed = useRef(0.25 + Math.random() * 0.2)

  useFrame((_, delta) => {
    if (!active || !dotRef.current) return
    t.current = (t.current + delta * speed.current) % 1
    const x = THREE.MathUtils.lerp(from[0], to[0], t.current)
    const y = THREE.MathUtils.lerp(from[1], to[1], t.current)
    const z = THREE.MathUtils.lerp(from[2], to[2], t.current)
    dotRef.current.position.set(x, y, z)
  })

  return (
    <>
      <Line points={[from, to]} color={color} transparent opacity={active ? 0.35 : 0.12} lineWidth={1} />
      {active && (
        <mesh ref={dotRef}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </>
  )
}

// Pure-visual celebratory burst — small particles scatter outward and fade.
// Plays once on mount, which naturally happens exactly when a WHAT IF skill
// is added (React mounts a fresh SkillNode + Burst for it).
function CelebrationBurst({ color }) {
  const groupRef = useRef()
  const elapsed = useRef(0)
  const [done, setDone] = useState(false)
  const particles = useMemo(() => Array.from({ length: 10 }, () => ({
    dir: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    speed: 1.2 + Math.random() * 0.8,
  })), [])

  useFrame((_, delta) => {
    elapsed.current += delta
    if (elapsed.current > 0.7) { if (!done) setDone(true); return }
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i]
      if (!p) return
      child.position.copy(p.dir).multiplyScalar(p.speed * elapsed.current)
      child.material.opacity = Math.max(0, 1 - elapsed.current / 0.7)
      child.scale.setScalar(Math.max(0.05, 1 - elapsed.current / 0.7))
    })
  })

  if (done) return null
  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  )
}

function SkillNode({ node, onSelect, isSelected }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const scaleProgress = useRef(0) // mount-in animation, 0 -> 1
  const [hovered, setHovered] = useState(false)
  const baseSize = node.type === 'explicit' ? 0.24 + Math.min(node.evidenceCount, 6) * 0.02 : 0.16

  useFrame((state, delta) => {
    // Grow-in animation whenever this node first mounts (new WHAT IF
    // additions get this for free since React mounts a fresh component).
    if (scaleProgress.current < 1) {
      scaleProgress.current = Math.min(1, scaleProgress.current + delta * 2.2)
    }
    const growScale = THREE.MathUtils.lerp(0, 1, scaleProgress.current)

    // Gentle breathing pulse so explicit nodes feel alive, not static.
    const pulse = node.type === 'explicit'
      ? 1 + Math.sin(state.clock.elapsedTime * 1.8 + node.position[0]) * 0.06
      : 1
    if (meshRef.current) meshRef.current.scale.setScalar(growScale * pulse)

    if (meshRef.current?.material) {
      const targetIntensity = node.type === 'explicit'
        ? (hovered || isSelected ? 1.6 : 0.55 + Math.sin(state.clock.elapsedTime * 1.8 + node.position[0]) * 0.15)
        : 0.15
      meshRef.current.material.emissiveIntensity = targetIntensity
    }
  })

  return (
    <group ref={groupRef} position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(node) }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[baseSize, 24, 24]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.6}
          transparent
          opacity={node.type === 'explicit' ? 1 : 0.55}
          wireframe={node.type === 'inferred'}
        />
      </mesh>
      <Text
        position={[0, baseSize + 0.22, 0]}
        fontSize={0.16}
        color={node.type === 'explicit' ? '#ffffff' : '#9CA3AF'}
        anchorX="center"
        anchorY="middle"
      >
        {node.name}
      </Text>
      {node.justAdded && <CelebrationBurst color={node.color} />}
    </group>
  )
}

// Expanding, fading ring — pure visual "shockwave" triggered by clicking the
// center core. Multiple can be alive at once if clicked repeatedly.
function Shockwave({ onDone }) {
  const ref = useRef()
  const elapsed = useRef(0)
  useFrame((_, delta) => {
    elapsed.current += delta
    const duration = 1.1
    if (elapsed.current > duration) { onDone(); return }
    const t = elapsed.current / duration
    if (ref.current) {
      const scale = THREE.MathUtils.lerp(0.6, 7, t)
      ref.current.scale.setScalar(scale)
      ref.current.material.opacity = 0.5 * (1 - t)
    }
  })
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1, 48]} />
      <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CenterCore() {
  const ref = useRef()
  const [waves, setWaves] = useState([])
  useFrame((state) => {
    if (!ref.current) return
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.08
    ref.current.scale.setScalar(s)
  })
  const handleClick = (e) => {
    e.stopPropagation()
    setWaves((w) => [...w, Date.now()])
  }
  return (
    <>
      <mesh ref={ref} onClick={handleClick}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.9} />
      </mesh>
      {waves.map((id) => (
        <Shockwave key={id} onDone={() => setWaves((w) => w.filter((x) => x !== id))} />
      ))}
    </>
  )
}

// Cinematic dolly-in: camera starts far back and eases into its resting
// position over ~1.4s whenever the graph first mounts.
function CameraIntro() {
  const progress = useRef(0)
  useFrame((state, delta) => {
    if (progress.current >= 1) return
    progress.current = Math.min(1, progress.current + delta / 1.4)
    const ease = 1 - Math.pow(1 - progress.current, 3)
    const startZ = 22, endZ = 9
    const startY = 9, endY = 3
    state.camera.position.z = THREE.MathUtils.lerp(startZ, endZ, ease)
    state.camera.position.y = THREE.MathUtils.lerp(startY, endY, ease)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export function SkillGraph3D({ skills, onSelectSkill, selectedSkill }) {
  const nodes = useMemo(() => layoutSkills(skills), [skills])

  return (
    <div className="h-[440px] w-full rounded-2xl border border-line bg-gradient-to-b from-panel to-ink overflow-hidden">
      <Canvas
        camera={{ position: [0, 9, 22], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('WebGL context lost — this is usually harmless in dev (HMR); recovers automatically.')
          })
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={40} color="#8B5CF6" />
        <pointLight position={[-5, -3, -5]} intensity={20} color="#22D3EE" />
        <CameraIntro />
        <CenterCore />
        {nodes.map((node) => (
          <DataFlowLine
            key={`flow-${node.name}`}
            from={[0, 0, 0]}
            to={node.position}
            color={node.color}
            active={node.type === 'explicit'}
          />
        ))}
        {nodes.map((node) => (
          <SkillNode
            key={node.name}
            node={node}
            onSelect={onSelectSkill}
            isSelected={selectedSkill?.name === node.name}
          />
        ))}
        <OrbitControls enablePan={false} minDistance={4} maxDistance={16} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  )
}
