import { useState, useEffect } from 'react'

function SentenceBuilder({ selectedVoice, isDarkMode }) {
  // State for the sentence being built
  const [selectedWords, setSelectedWords] = useState(() => {
    // Load last sentence from localStorage
    const saved = localStorage.getItem('sentence-builder-last')
    return saved ? JSON.parse(saved) : []
  })

  // Comprehensive AAC vocabulary organized by categories
  const vocabulary = {
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
    }
  }

  // Current active category
  const [activeCategory, setActiveCategory] = useState('favorites')
  
  // Get words for current category
  const currentWords = vocabulary[activeCategory]?.words || []

  // Generate sentence text from selected words
  const sentenceText = selectedWords.join(' ')

  // Save sentence to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sentence-builder-last', JSON.stringify(selectedWords))
  }, [selectedWords])

  // Add word to sentence
  const handleWordClick = (word) => {
    setSelectedWords(prev => [...prev, word])
  }

  // Remove last word (backspace)
  const handleBackspace = () => {
    setSelectedWords(prev => prev.slice(0, -1))
  }

  // Clear entire sentence
  const handleClear = () => {
    setSelectedWords([])
  }

  // Speak the sentence using TTS
  const handlePlay = () => {
    if (!sentenceText.trim()) return

    // Stop any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(sentenceText)
    
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
            selectedWords.map((word, index) => (
              <button
                key={`${word}-${index}`}
                className="word-chip"
                onClick={() => handleRemoveWord(index)}
                aria-label={`Remove ${word} from sentence`}
              >
                {word}
                <span className="remove-icon">×</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {Object.entries(vocabulary).map(([categoryKey, category]) => (
          <button
            key={categoryKey}
            className={`category-tab ${activeCategory === categoryKey ? 'active' : ''}`}
            onClick={() => setActiveCategory(categoryKey)}
            aria-label={`Switch to ${category.label} category`}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Word Grid */}
      <div className="word-grid">
        {currentWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            className="word-button"
            onClick={() => handleWordClick(word)}
            aria-label={`Add ${word} to sentence`}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="sentence-controls">
        <button
          className="control-btn play-btn"
          onClick={handlePlay}
          disabled={selectedWords.length === 0}
          aria-label="Speak sentence"
        >
          🔊 Play
        </button>
        
        <button
          className="control-btn backspace-btn"
          onClick={handleBackspace}
          disabled={selectedWords.length === 0}
          aria-label="Remove last word"
        >
          ⌫ Backspace
        </button>
        
        <button
          className="control-btn clear-btn"
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