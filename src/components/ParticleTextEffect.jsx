"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronRight } from "lucide-react"
import "./ParticleTextEffect.css"

class Particle {
  constructor() {
    this.pos = { x: 0, y: 0 }
    this.vel = { x: 0, y: 0 }
    this.acc = { x: 0, y: 0 }
    this.target = { x: 0, y: 0 }

    this.closeEnoughTarget = 100
    this.maxSpeed = 1.0
    this.maxForce = 0.1
    this.particleSize = 10
    this.isKilled = false

    this.startColor = { r: 0, g: 0, b: 0 }
    this.targetColor = { r: 0, g: 0, b: 0 }
    this.colorWeight = 0
    this.colorBlendRate = 0.01
  }

  move() {
    // Check if particle is close enough to its target to slow down
    let proximityMult = 1
    const distance = Math.sqrt(Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2))

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    // Add force towards target
    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y)
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    // Move particle
    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx, drawAsPoints) {
    // Blend towards target color
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }

    // Calculate current color
    const currentColor = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    }

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width, height) {
    if (!this.isKilled) {
      // Set target outside the scene
      const randomPos = this.generateRandomPos(width / 2, height / 2, (width + height) / 2, width, height)
      this.target.x = randomPos.x
      this.target.y = randomPos.y

      // Begin blending color to black
      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0

      this.isKilled = true
    }
  }

  generateRandomPos(x, y, mag, width = 1000, height = 500) {
    const randomX = Math.random() * width
    const randomY = Math.random() * height

    const direction = {
      x: randomX - x,
      y: randomY - y,
    }

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    }
  }
}

const DEFAULT_WORDS = ["BEGIN JOURNEY"]

export function ParticleTextEffect({ words = DEFAULT_WORDS, onStart, onClick }) {
  const [showStartBtn, setShowStartBtn] = useState(false)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const frameCountRef = useRef(0)
  const wordIndexRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false })

  const pixelSteps = 6
  const drawAsPoints = true

  // Fade in the START button after the "BEGIN JOURNEY" particles form on screen (~2.2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStartBtn(true)
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  const generateRandomPos = (x, y, mag, width, height) => {
    const randomX = Math.random() * width
    const randomY = Math.random() * height

    const direction = {
      x: randomX - x,
      y: randomY - y,
    }

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    }
  }

  const nextWord = (word, canvas) => {
    // Create off-screen canvas for text rendering
    const offscreenCanvas = document.createElement("canvas")
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext("2d")

    // Draw text with responsive scaling to fit any viewport
    offscreenCtx.fillStyle = "white"
    const targetFontSize = Math.min(80, Math.max(34, Math.floor(canvas.width / 13)))
    offscreenCtx.font = `bold ${targetFontSize}px Arial`
    offscreenCtx.textAlign = "center"
    offscreenCtx.textBaseline = "middle"
    offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2)

    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    // Generate new color: glowing expedition gold #d4af37
    const newColor = {
      r: 212,
      g: 175,
      b: 55,
    }

    const particles = particlesRef.current
    let particleIndex = 0

    // Collect coordinates
    const coordsIndexes = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }

    // Shuffle coordinates for fluid motion
    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]]
    }

    for (const coordIndex of coordsIndexes) {
      const pixelIndex = coordIndex
      const alpha = pixels[pixelIndex + 3]

      if (alpha > 0) {
        const x = (pixelIndex / 4) % canvas.width
        const y = Math.floor(pixelIndex / 4 / canvas.width)

        let particle

        if (particleIndex < particles.length) {
          particle = particles[particleIndex]
          particle.isKilled = false
          particleIndex++
        } else {
          particle = new Particle()

          const randomPos = generateRandomPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2, canvas.width, canvas.height)
          particle.pos.x = randomPos.x
          particle.pos.y = randomPos.y

          particle.maxSpeed = Math.random() * 6 + 4
          particle.maxForce = particle.maxSpeed * 0.05
          particle.particleSize = Math.random() * 6 + 6
          particle.colorBlendRate = Math.random() * 0.0275 + 0.0025

          particles.push(particle)
        }

        // Set color transition
        particle.startColor = {
          r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        }
        particle.targetColor = newColor
        particle.colorWeight = 0

        particle.target.x = x
        particle.target.y = y
      }
    }

    // Kill remaining particles
    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const particles = particlesRef.current

    // Background with motion blur
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.move()
      particle.draw(ctx, drawAsPoints)

      // Remove dead particles that are out of bounds
      if (particle.isKilled) {
        if (
          particle.pos.x < 0 ||
          particle.pos.x > canvas.width ||
          particle.pos.y < 0 ||
          particle.pos.y > canvas.height
        ) {
          particles.splice(i, 1)
        }
      }
    }

    // Handle mouse interaction
    if (mouseRef.current.isPressed) {
      if (mouseRef.current.isRightClick) {
        particles.forEach((particle) => {
          const distance = Math.sqrt(
            Math.pow(particle.pos.x - mouseRef.current.x, 2) + Math.pow(particle.pos.y - mouseRef.current.y, 2),
          )
          if (distance < 50) {
            particle.kill(canvas.width, canvas.height)
          }
        })
      } else {
        // Left-click repulsion: creates an interactive golden ripple rather than leaving screen
        particles.forEach((particle) => {
          const dx = particle.pos.x - mouseRef.current.x
          const dy = particle.pos.y - mouseRef.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 90 && distance > 0) {
            const force = ((90 - distance) / 90) * 8
            particle.acc.x += (dx / distance) * force
            particle.acc.y += (dy / distance) * force
          }
        })
      }
    }

    // Auto-advance words if we have more than one
    if (words.length > 1) {
      frameCountRef.current++
      if (frameCountRef.current % 240 === 0) {
        wordIndexRef.current = (wordIndexRef.current + 1) % words.length
        nextWord(words[wordIndexRef.current], canvas)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  // Handle explicit START button activation
  const handleStartClick = (e) => {
    if (e) {
      e.stopPropagation()
    }

    // Subtle audio chime
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15) // E5
        gain.gain.setValueAtTime(0.06, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.25)
      }
    } catch (err) {
      // Audio autoplay policy catch
    }

    if (onStart) {
      onStart(e)
    } else if (onClick) {
      onClick(e)
    }
  }

  // Keyboard accessibility: Enter or Space activates START once visible
  useEffect(() => {
    if (!showStartBtn) return
    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleStartClick(e)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showStartBtn, onStart, onClick])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Initialize with first word
    nextWord(words[0], canvas)

    // Start animation
    animate()

    // Mouse event handlers — clicking canvas only interacts with particles and does NOT advance step
    const handleMouseDown = (e) => {
      mouseRef.current.isPressed = true
      mouseRef.current.isRightClick = e.button === 2
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseUp = () => {
      mouseRef.current.isPressed = false
      mouseRef.current.isRightClick = false
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      mouseRef.current.x = (e.clientX - rect.left) * scaleX
      mouseRef.current.y = (e.clientY - rect.top) * scaleY
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("contextmenu", handleContextMenu)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [words])

  return (
    <div className="particle-stage-container">
      <canvas
        ref={canvasRef}
        className="particle-canvas"
      />

      {/* START Button fading in after BEGIN JOURNEY animation */}
      <div className={`start-btn-wrapper ${showStartBtn ? "visible" : ""}`}>
        <button
          type="button"
          className="start-journey-btn"
          onClick={handleStartClick}
          aria-label="Start Expedition"
        >
          <span className="start-btn-text">START</span>
          <ChevronRight size={18} className="start-btn-icon" />
        </button>
        <span className="start-btn-hint">PRESS ENTER TO START</span>
      </div>
    </div>
  )
}

