import { useState, useEffect } from 'react'

function Pad({ pad, onPlay, gridPosition }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const isDisabled = !pad.sound || pad.sound === null

  const handleClick = () => {
    if (isDisabled) return
    
    setIsPlaying(true)
    onPlay(pad)
    
    // Reset playing state after animation
    setTimeout(() => setIsPlaying(false), 200)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  const padStyle = {
    borderColor: isPlaying ? '#4f46e5' : undefined
  }

  const contentStyle = {
    background: pad.color || '#6366f1'
  }

  return (
    <button
      className={`pad ${isPlaying ? 'playing' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={padStyle}
      aria-label={pad.label || `Empty pad ${gridPosition}`}
      aria-pressed={isPlaying}
      disabled={isDisabled}
      role="gridcell"
      tabIndex={isDisabled ? -1 : 0}
    >
      <div 
        className="pad-content" 
        style={contentStyle}
      >
        {pad.label && <span>{pad.label}</span>}
      </div>
    </button>
  )
}

export default Pad