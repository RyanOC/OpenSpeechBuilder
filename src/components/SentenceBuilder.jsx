import { useState, useEffect } from 'react'

// Color palette for randomizing word button colors
const WORD_COLORS = [
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // purple
  '#22d3ee', // sky
  '#fb7185', // rose
  '#facc15', // yellow
  '#16a34a', // green
]

// Function to get a random color for word buttons
const getRandomWordColor = (word, categoryKey, wordIndex) => {
  // Use the word index to cycle through colors, creating variety within each category
  const colorIndex = wordIndex % WORD_COLORS.length
  return WORD_COLORS[colorIndex]
}

function SentenceBuilder({ selectedVoice, isDarkMode, isEditMode, onWordEdit, onCategoriesReady, onCategoryEdit }) {
  // State for the sentence being built
  const [selectedWords, setSelectedWords] = useState(() => {
    // Load last sentence from localStorage
    const saved = localStorage.getItem('sentence-builder-last')
    return saved ? JSON.parse(saved) : []
  })

  // Load word configurations
  const [wordConfigs, setWordConfigs] = useState(() => {
    const saved = localStorage.getItem('sentence-builder-words')
    return saved ? JSON.parse(saved) : {}
  })

  // Reload word configurations when they change
  const reloadWordConfigs = () => {
    console.log('reloadWordConfigs called')
    const saved = localStorage.getItem('sentence-builder-words')
    const newConfigs = saved ? JSON.parse(saved) : {}
    console.log('Loaded word configs:', newConfigs)
    setWordConfigs(newConfigs)
  }

  // Function to get word configuration
  const getWordConfig = (categoryKey, wordIndex) => {
    const wordKey = `${categoryKey}-${wordIndex}`
    const config = wordConfigs[wordKey] || null
    
    // Debug: Log all lookups for troubleshooting
    if (categoryKey && wordIndex !== undefined) {
      console.log(`Looking for config: ${wordKey}, found:`, config)
    }
    
    return config
  }

  // Function to get category configuration
  const getCategoryConfig = (categoryKey) => {
    const categoryConfigs = JSON.parse(localStorage.getItem('sentence-builder-categories') || '{}')
    return categoryConfigs[categoryKey] || null
  }

  // Function to render word images (similar to Pad component)
  const renderWordImage = (imageIdOrData) => {
    console.log('renderWordImage called with:', imageIdOrData)
    let imageData
    
    // Handle both old format (full image object) and new format (image ID)
    if (typeof imageIdOrData === 'string') {
      // New format: image ID
      console.log('Looking for image ID:', imageIdOrData)
      const saved = localStorage.getItem('image-designer-library')
      console.log('Image library exists:', !!saved)
      
      if (!saved) {
        console.log('No image library in localStorage')
        return null
      }
      
      let imageLibrary
      try {
        imageLibrary = JSON.parse(saved)
        console.log('Available image IDs:', Object.keys(imageLibrary))
      } catch (err) {
        console.log('Error parsing image library:', err)
        return null
      }
      
      imageData = imageLibrary[imageIdOrData]
      console.log('Found image data:', !!imageData)
    } else if (imageIdOrData && imageIdOrData.data) {
      // Old format: full image object
      imageData = imageIdOrData
      console.log('Using direct image data')
    }
    
    if (!imageData || !imageData.data) {
      console.log('No image data found for:', imageIdOrData)
      return null
    }
    
    console.log('Rendering image with data:', imageData)

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

  // Load custom words and merge with base vocabulary
  const getVocabulary = () => {
    const baseVocabulary = {
    favorites: {
      label: "Favorites",
      icon: "⭐",
      words: ["I", "am", "want", "need", "help", "more", "please", "thank you", "yes", "no", "go", "stop", "like", "good", "bad", "happy"]
    },
    helpers: {
      label: "Helper Words",
      icon: "🔗",
      words: ["am", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "can", "could", "should", "may", "might", "must", "shall", "to", "not", "don't", "won't", "can't", "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "didn't", "doesn't", "wouldn't", "couldn't", "shouldn't"]
    },
    people: {
      label: "People",
      icon: "👥",
      words: ["I", "you", "he", "she", "we", "they", "mom", "dad", "mama", "papa", "brother", "sister", "friend", "teacher", "doctor", "baby", "family", "person", "boy", "girl"]
    },
    actions: {
      label: "Actions", 
      icon: "🏃",
      words: ["want", "need", "go", "come", "eat", "drink", "play", "help", "stop", "start", "like", "love", "see", "look", "hear", "listen", "talk", "say", "give", "take", "put", "get", "make", "do", "work", "sleep", "wake", "sit", "stand", "walk", "run", "jump", "dance", "sing", "read", "write", "draw", "cook", "clean", "wash", "brush", "open", "close", "turn", "push", "pull"]
    },
    things: {
      label: "Things",
      icon: "📦", 
      words: ["food", "water", "milk", "juice", "bread", "apple", "banana", "pizza", "cookie", "candy", "toy", "ball", "book", "phone", "computer", "TV", "car", "bus", "bike", "chair", "table", "bed", "door", "window", "cup", "plate", "spoon", "fork", "shirt", "pants", "shoes", "hat", "bag", "money", "key", "medicine"]
    },
    places: {
      label: "Places",
      icon: "🏠",
      words: ["home", "house", "school", "store", "park", "hospital", "bathroom", "bedroom", "kitchen", "outside", "inside", "here", "there", "up", "down", "in", "out", "on", "under", "next", "behind", "front", "back"]
    },
    feelings: {
      label: "Feelings",
      icon: "😊",
      words: ["happy", "sad", "angry", "mad", "excited", "scared", "worried", "surprised", "tired", "sleepy", "hungry", "thirsty", "sick", "hurt", "pain", "better", "good", "bad", "okay", "fine", "great", "awful", "love", "hate", "like", "dislike"]
    },
    describe: {
      label: "Describe",
      icon: "🎨",
      words: ["big", "small", "little", "tiny", "huge", "long", "short", "tall", "wide", "narrow", "thick", "thin", "heavy", "light", "fast", "slow", "hot", "cold", "warm", "cool", "wet", "dry", "clean", "dirty", "new", "old", "young", "pretty", "ugly", "nice", "mean", "funny", "serious", "loud", "quiet", "soft", "hard", "smooth", "rough", "sharp", "dull"]
    },
    time: {
      label: "Time",
      icon: "⏰",
      words: ["now", "later", "soon", "today", "tomorrow", "yesterday", "morning", "afternoon", "evening", "night", "early", "late", "before", "after", "first", "last", "next", "always", "never", "sometimes", "again", "still", "already", "yet", "when", "while", "during"]
    },
    social: {
      label: "Social",
      icon: "💬",
      words: ["hello", "hi", "goodbye", "bye", "please", "thank you", "thanks", "sorry", "excuse me", "yes", "no", "maybe", "okay", "sure", "welcome", "congratulations", "good morning", "good night", "how are you", "fine", "good", "great", "wonderful", "awesome", "cool", "wow", "oh no", "uh oh", "oops"]
    },
    punctuation: {
      label: "Punctuation",
      icon: "❓",
      words: [".", "?", "!", ",", ";", ":", "-", "(", ")", "...", "—", "'", '"', "&", "@", "#", "%", "*", "+", "=", "/", "\\", "|", "~", "`"]
    }
    }

    // Load custom words and merge with base vocabulary
    const savedCustomWords = localStorage.getItem('sentence-builder-custom-words')
    const customWords = savedCustomWords ? JSON.parse(savedCustomWords) : {}

    // Merge custom words with base vocabulary
    const mergedVocabulary = { ...baseVocabulary }
    Object.keys(customWords).forEach(categoryKey => {
      if (mergedVocabulary[categoryKey] && customWords[categoryKey]) {
        mergedVocabulary[categoryKey] = {
          ...mergedVocabulary[categoryKey],
          words: [...mergedVocabulary[categoryKey].words, ...customWords[categoryKey]]
        }
      }
    })

    return mergedVocabulary
  }

  const [vocabulary, setVocabulary] = useState(getVocabulary())
  const [refreshKey, setRefreshKey] = useState(0)

  // Pass categories to parent when vocabulary is ready
  useEffect(() => {
    if (onCategoriesReady && vocabulary) {
      onCategoriesReady(vocabulary)
    }
  }, [vocabulary, onCategoriesReady])

  // Reload vocabulary when custom words change
  const reloadVocabulary = () => {
    setVocabulary(getVocabulary())
  }

  // Combined reload function for both vocabulary and word configs
  const reloadAll = () => {
    console.log('Reloading sentence builder configs...')
    
    // Debug: Show what's in localStorage
    const savedWords = localStorage.getItem('sentence-builder-words')
    console.log('Raw localStorage sentence-builder-words:', savedWords)
    
    reloadVocabulary()
    reloadWordConfigs()
    setRefreshKey(prev => prev + 1) // Force re-render
  }

  // Set up global reload function
  useEffect(() => {
    window.reloadSentenceBuilderConfigs = reloadAll
    return () => {
      delete window.reloadSentenceBuilderConfigs
    }
  }, [])

  // Current active category
  const [activeCategory, setActiveCategory] = useState('favorites')
  
  // Get words for current category and sort them by order if configured
  const baseWords = vocabulary[activeCategory]?.words || []
  const currentWords = baseWords.map((word, index) => ({ word, index })).sort((a, b) => {
    const aConfig = getWordConfig(activeCategory, a.index)
    const bConfig = getWordConfig(activeCategory, b.index)
    const aOrder = aConfig?.order ? parseInt(aConfig.order) : null
    const bOrder = bConfig?.order ? parseInt(bConfig.order) : null
    
    // If both have order values, sort by order number
    if (aOrder !== null && bOrder !== null) {
      return aOrder - bOrder
    }
    
    // If only a has order, a comes first
    if (aOrder !== null && bOrder === null) {
      return -1
    }
    
    // If only b has order, b comes first
    if (aOrder === null && bOrder !== null) {
      return 1
    }
    
    // If neither has order, maintain original order
    return 0
  })

  // Generate sentence text from selected words for display
  const sentenceText = selectedWords.map(word => 
    typeof word === 'string' ? word : word.display
  ).join(' ')
  
  // Generate TTS text from selected words for speech
  const ttsText = selectedWords.map(word => 
    typeof word === 'string' ? word : word.tts
  ).join(' ')

  // Save sentence to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sentence-builder-last', JSON.stringify(selectedWords))
  }, [selectedWords])

  // Handle category tab clicks
  const handleCategoryClick = (categoryKey) => {
    if (isEditMode && onCategoryEdit) {
      onCategoryEdit(categoryKey)
    } else {
      setActiveCategory(categoryKey)
    }
  }

  // Add word to sentence or edit in edit mode
  const handleWordClick = (word, categoryKey, wordIndex) => {
    if (isEditMode && onWordEdit) {
      onWordEdit(categoryKey, wordIndex, word)
    } else {
      // Get word configuration for both display and TTS
      const wordConfig = getWordConfig(categoryKey, wordIndex)
      const displayText = wordConfig?.label || word
      
      // Extract TTS text from sound configuration
      let ttsText = displayText // Default to display text
      if (wordConfig?.sound && wordConfig.sound.startsWith('tts:')) {
        ttsText = wordConfig.sound.substring(4) // Remove 'tts:' prefix
      }
      
      // Store word object with both display and TTS text
      const wordObject = {
        display: displayText,
        tts: ttsText
      }
      
      setSelectedWords(prev => [...prev, wordObject])
    }
  }

  // Remove last word (backspace)
  const handleBackspace = () => {
    setSelectedWords(prev => prev.slice(0, -1))
  }

  // Clear entire sentence
  const handleClear = () => {
    setSelectedWords([])
  }

  // Handle adding a new word
  const handleAddNewWord = () => {
    if (onWordEdit) {
      // Create a new word entry - we'll use a placeholder that the parent can handle
      const newWordIndex = vocabulary[activeCategory].words.length
      onWordEdit(activeCategory, newWordIndex, null) // null indicates new word
    }
  }

  // Speak the sentence using TTS
  const handlePlay = () => {
    if (!ttsText.trim()) return

    // Stop any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(ttsText)
    
    // Use the globally selected voice if available
    if (selectedVoice) {
      const voices = speechSynthesis.getVoices()
      const voice = voices.find(v => v.name === selectedVoice)
      if (voice) {
        utterance.voice = voice
      }
    }
    
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 0.8

    speechSynthesis.speak(utterance)
  }

  // Remove specific word from sentence
  const handleRemoveWord = (index) => {
    setSelectedWords(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="sentence-builder-page">
      {/* Sentence Bar */}
      <div className="sentence-bar" aria-live="polite" aria-label="Current sentence">
        <div className="sentence-display">
          {selectedWords.length === 0 ? (
            <span className="sentence-placeholder">Tap words to build a sentence...</span>
          ) : (
            selectedWords.map((word, index) => {
              const displayText = typeof word === 'string' ? word : word.display
              return (
                <button
                  key={`${displayText}-${index}`}
                  className="word-chip"
                  onClick={() => handleRemoveWord(index)}
                  aria-label={`Remove ${displayText} from sentence`}
                >
                  {displayText}
                  <span className="remove-icon">×</span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {Object.entries(vocabulary).map(([categoryKey, category]) => {
          const categoryConfig = getCategoryConfig(categoryKey)
          const categoryStyle = categoryConfig?.color ? {
            '--custom-bg': categoryConfig.color,
            background: categoryConfig.color
          } : {}
          
          return (
            <button
              key={categoryKey}
              className={`category-tab ${activeCategory === categoryKey ? 'active' : ''} ${isEditMode ? 'edit-mode' : ''} ${categoryConfig?.color ? 'custom-config' : ''}`}
              onClick={() => handleCategoryClick(categoryKey)}
              aria-label={isEditMode ? `Edit ${category.label} category` : `Switch to ${category.label} category`}
              style={categoryStyle}
            >
              <span className="category-icon">{categoryConfig?.icon || category.icon}</span>
              <span className="category-label">{categoryConfig?.label || category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Word Grid */}
      <div className="word-grid">
        {/* Add New Button - only visible in edit mode */}
        {isEditMode && (
          <button
            key="add-new-word"
            className="word-button add-new-button"
            onClick={() => handleAddNewWord()}
            aria-label="Add new word to this category"
          >
            <div className="add-new-content">
              <span className="add-new-icon">+</span>
              <span className="add-new-text">Add New</span>
            </div>
          </button>
        )}
        
        {currentWords.map(({ word, index }) => {
          const wordConfig = getWordConfig(activeCategory, index)
          const hasCustomConfig = wordConfig && (wordConfig.color || wordConfig.image)
          
          // Always apply color - either saved color or random color
          const buttonColor = wordConfig?.color || getRandomWordColor(word, activeCategory, index)
          const buttonStyle = {
            '--custom-bg': buttonColor,
            background: buttonColor
          }
          
          // Debug logging for image issues
          if (wordConfig?.image) {
            console.log(`Word "${word}" has image:`, wordConfig.image)
            console.log('About to call renderWordImage with:', wordConfig.image)
          }
          
          return (
            <button
              key={`${word}-${index}-${refreshKey}`}
              className={`word-button custom-config ${isEditMode ? 'edit-mode' : ''} ${wordConfig?.image ? 'has-image' : ''}`}
              onClick={() => handleWordClick(word, activeCategory, index)}
              aria-label={isEditMode ? `Edit ${word}` : `Add ${word} to sentence`}
            >
              <div 
                className={`pad-content ${wordConfig?.image ? 'has-image' : ''}`}
                style={buttonStyle}
              >
                {wordConfig?.image && renderWordImage(wordConfig.image)}
                <span className={wordConfig?.image ? 'with-image' : ''}>{wordConfig?.label || word}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="sentence-controls">
        <button
          className="btn btn-success control-btn play-btn"
          onClick={handlePlay}
          disabled={selectedWords.length === 0}
          aria-label="Speak sentence"
        >
          🔊 Play
        </button>
        
        <button
          className="btn btn-warning control-btn backspace-btn"
          onClick={handleBackspace}
          disabled={selectedWords.length === 0}
          aria-label="Remove last word"
        >
          ⌫ Backspace
        </button>
        
        <button
          className="btn btn-danger control-btn clear-btn"
          onClick={handleClear}
          disabled={selectedWords.length === 0}
          aria-label="Clear sentence"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  )
}

export default SentenceBuilder