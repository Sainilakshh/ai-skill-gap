import React, { useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
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

function SkillNode({ node, onSelect, isSelected }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const size = node.type === 'explicit' ? 0.24 + Math.min(node.evidenceCount, 6) * 0.02 : 0.16

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(node) }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={node.type === 'explicit' ? (hovered || isSelected ? 1.4 : 0.6) : 0.15}
          transparent
          opacity={node.type === 'explicit' ? 1 : 0.55}
          wireframe={node.type === 'inferred'}
        />
      </mesh>
      <Text
        position={[0, size + 0.22, 0]}
        fontSize={0.16}
        color={node.type === 'explicit' ? '#ffffff' : '#9CA3AF'}
        anchorX="center"
        anchorY="middle"
      >
        {node.name}
      </Text>
    </group>
  )
}

function CenterCore() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.9} />
    </mesh>
  )
}

export function SkillGraph3D({ skills, onSelectSkill, selectedSkill }) {
  const nodes = useMemo(() => layoutSkills(skills), [skills])

  return (
    <div className="h-[440px] w-full rounded-2xl border border-line bg-gradient-to-b from-panel to-ink overflow-hidden">
      <Canvas camera={{ position: [0, 3, 9], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={40} color="#8B5CF6" />
        <pointLight position={[-5, -3, -5]} intensity={20} color="#22D3EE" />
        <CenterCore />
        {nodes.map((node) => (
          <Line
            key={`line-${node.name}`}
            points={[[0, 0, 0], node.position]}
            color={node.color}
            transparent
            opacity={node.type === 'explicit' ? 0.35 : 0.15}
            lineWidth={1}
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
