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

  const renderImage = (imageIdOrData) => {
    let imageData

    // Handle both old format (full image object) and new format (image ID)
    if (typeof imageIdOrData === 'string') {
      // New format: image ID
      const saved = localStorage.getItem('image-designer-library')
      if (!saved) return null

      let imageLibrary
      try {
        imageLibrary = JSON.parse(saved)
      } catch (err) {
        return null
      }

      imageData = imageLibrary[imageIdOrData]
    } else if (imageIdOrData && imageIdOrData.data) {
      // Old format: full image object
      imageData = imageIdOrData
    }

    if (!imageData || !imageData.data) return null

    return (
      <div
        className="pad-image"
        style={{
          width: 'calc(100% - 20px)',
          height: 'calc(100% - 24px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(16, 1fr)',
          gridTemplateRows: 'repeat(16, 1fr)',
          gap: 0,
          position: 'absolute',
          top: '8px',
          left: '10px'
        }}
      >
        {imageData.data.flat().map((pixel, index) => {
          let pixelColor = 'transparent'
          if (pixel) {
            // Handle both formats: 1/0 (starter images) and hex colors (new images)
            if (pixel === 1) {
              pixelColor = '#000000' // Black for starter images
            } else if (typeof pixel === 'string' && pixel.startsWith('#')) {
              pixelColor = pixel // Use the actual color
            } else {
              pixelColor = '#000000' // Default to black
            }
          }

          return (
            <div
              key={index}
              className="image-pixel"
              style={{
                backgroundColor: pixelColor
              }}
            />
          )
        })}
      </div>
    )
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
        className={`pad-content ${pad.image ? 'has-image' : ''} ${shouldUseEmojiLayout(pad.label) ? 'has-emoji' : ''}`}
        style={contentStyle}
      >
        {pad.image && renderImage(pad.image)}
        {pad.label && (() => {
          const { emoji, text } = parseEmojiAndText(pad.label)
          
          if (emoji) {
            // Emoji + text layout (similar to image layout)
            return (
              <>
                <div className="pad-emoji">{emoji}</div>
                {text && <span className="emoji-text">{text}</span>}
              </>
            )
          } else {
            // Regular text layout
            return (
              <span className={pad.image ? 'with-image' : ''}>
                {pad.label}
              </span>
            )
          }
        })()}
      </div>
    </button>
  )
}

export default Pad