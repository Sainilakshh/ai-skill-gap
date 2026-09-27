import React, { createContext, useContext, useRef, useState } from 'react'

const MouseContext = createContext(null)

export function CardContainer({ children, className = '' }) {
  const ref = useRef(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    setRotate({ x: y * -8, y: x * 8 })
  }

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 })

  return (
    <MouseContext.Provider value={rotate}>
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`[perspective:1000px] ${className}`}
      >
        <div
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>
      </div>
    </MouseContext.Provider>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={className} style={{ transformStyle: 'preserve-3d' }}>{children}</div>
}

export function CardItem({ children, translateZ = 0, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={className}
      style={{ transform: `translateZ(${translateZ}px)`, transformStyle: 'preserve-3d' }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
