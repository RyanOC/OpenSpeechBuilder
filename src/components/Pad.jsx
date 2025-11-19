import { useState } from 'react'

function Pad({ pad, onPlay, onEdit, isEditMode, gridPosition }) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Helper function to extract emoji and text from label
  const parseEmojiAndText = (text) => {
    if (!text || typeof text !== 'string') return { emoji: null, text: text }
    
    const trimmed = text.trim()
    
    // Regex to match emoji at the beginning of the string
    const emojiRegex = /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}])[\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]*/u
    
    const match = trimmed.match(emojiRegex)
    
    if (match && match.index === 0) {
      // Found emoji at the beginning
      const emoji = match[0]
      const remainingText = trimmed.slice(emoji.length).trim()
      
      return {
        emoji: emoji,
        text: remainingText || null
      }
    }
    
    return { emoji: null, text: trimmed }
  }

  // Helper function to check if we should use emoji layout
  const shouldUseEmojiLayout = (text) => {
    const { emoji } = parseEmojiAndText(text)
    return emoji !== null
  }

  const isDisabled = !pad.sound || pad.sound === null

  const handleClick = () => {
    if (isEditMode) {
      onEdit()
      return
    }

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
      className={`pad ${isPlaying ? 'playing' : ''} ${isDisabled && !isEditMode ? 'disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={padStyle}
      aria-label={pad.label || `Empty pad ${gridPosition}`}
      aria-pressed={isPlaying}
      disabled={isDisabled && !isEditMode}
      role="gridcell"
      tabIndex={isDisabled && !isEditMode ? -1 : 0}
    >
      <div
        className={`pad-content ${shouldUseEmojiLayout(pad.label) ? 'has-emoji' : ''}`}
        style={contentStyle}
      >
        {pad.label && (() => {
          const { emoji, text } = parseEmojiAndText(pad.label)
          
          if (emoji) {
            // Emoji + text layout
            return (
              <>
                <div className="pad-emoji">{emoji}</div>
                {text && (
                  <span className="emoji-text">
                    {text.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                )}
              </>
            )
          } else {
            // Regular text layout - preserve line breaks
            return (
              <span>
                {pad.label.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < pad.label.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </span>
            )
          }
        })()}
      </div>
    </button>
  )
}

export default Pad