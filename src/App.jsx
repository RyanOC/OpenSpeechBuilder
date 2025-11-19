import { useState, useEffect, useRef } from 'react'
import Grid from './components/Grid'
import AdminPage from './components/AdminPage'
import InfoPage from './components/InfoPage'
import SentenceBuilder from './components/SentenceBuilder'

import ButtonConfigModal from './components/ButtonConfigModal'
import { loadConfig } from './utils/loadConfig'
import { useAudioPool } from './hooks/useAudioPool'

const DEFAULT_CONFIG_URL = '/config/soundboard.json'

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

function App() {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('soundboard-volume')
    return saved ? parseFloat(saved) : 1.0
  })
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('soundboard-language') || 'en'
  })
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('soundboard-voice') || ''
  })
  const [availableLanguages, setAvailableLanguages] = useState([])
  const [availableVoices, setAvailableVoices] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [currentView, setCurrentView] = useState('landing') // Always start with landing page
  const [showMenu, setShowMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('soundboard-theme')
    return saved ? saved === 'dark' : true // Default to dark mode
  })
  const [showViewTips, setShowViewTips] = useState(() => {
    // Check if user has previously dismissed the tooltip
    const dismissed = localStorage.getItem('open-speech-builder-tooltip-dismissed')
    return !dismissed
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingPad, setEditingPad] = useState(null)
  const [sentenceBuilderCategories, setSentenceBuilderCategories] = useState(null)
  const fileInputRef = useRef(null)
  const { playPad, setGlobalVolume } = useAudioPool()

  // Get theme-appropriate default color
  const getThemeDefaultColor = () => {
    return isDarkMode ? '#f3f4f6' : '#1f2937' // Light gray for dark theme, dark gray for light theme
  }

  // Load initial config
  useEffect(() => {
    // First check if we have a saved config in localStorage
    const savedConfig = localStorage.getItem('soundboard-config-data')
    if (savedConfig) {
      try {
        const configData = JSON.parse(savedConfig)
        setConfig(configData)
        return
      } catch (err) {
        console.error('Failed to parse saved config:', err)
        // Fall back to loading from URL if saved config is invalid
      }
    }

    // Load from URL if no saved config
    const urlParams = new URLSearchParams(window.location.search)
    const configUrl = urlParams.get('config') ||
      localStorage.getItem('soundboard-config-url') ||
      DEFAULT_CONFIG_URL

    loadConfig(configUrl)
      .then(loadedConfig => {
        setConfig(loadedConfig)

      })
      .catch(err => {
        console.error('Failed to load config:', err)
        setError(`Failed to load config: ${err.message}`)
      })
  }, [])

  // Update global volume
  useEffect(() => {
    setGlobalVolume(volume)
    localStorage.setItem('soundboard-volume', volume.toString())
  }, [volume, setGlobalVolume])

  // Load available voices and languages
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      
      if (voices.length === 0) {
        return
      }
      
      // Extract unique languages
      const languages = [...new Set(voices.map(voice => voice.lang.split('-')[0]))]
        .filter(lang => lang) // Remove empty languages
        .sort()
        .map(lang => ({
          code: lang,
          name: getLanguageName(lang)
        }))
      
      setAvailableLanguages(languages)
      
      // Filter voices for selected language
      const filteredVoices = voices.filter(voice => 
        voice.lang.startsWith(selectedLanguage)
      ).sort((a, b) => a.name.localeCompare(b.name))
      
      setAvailableVoices(filteredVoices)
      
      // Set default voice if none selected
      if (!selectedVoice && filteredVoices.length > 0) {
        // Prioritize Zira as the default voice
        const ziraVoice = filteredVoices.find(voice => 
          voice.name.toLowerCase().includes('zira')
        )
        const defaultVoice = ziraVoice || 
          filteredVoices.find(voice => voice.default || voice.localService) || 
          filteredVoices[0]
        setSelectedVoice(defaultVoice.name)
      }
    }

    // Initial load
    loadVoices()
    
    // Listen for voice changes (some browsers load voices asynchronously)
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    
    // Also try loading after a short delay
    setTimeout(loadVoices, 100)
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [selectedLanguage, selectedVoice])

  // Persist language and voice settings
  useEffect(() => {
    localStorage.setItem('soundboard-language', selectedLanguage)
  }, [selectedLanguage])

  useEffect(() => {
    localStorage.setItem('soundboard-voice', selectedVoice)
  }, [selectedVoice])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('soundboard-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Update voices when language changes
  useEffect(() => {
    const voices = speechSynthesis.getVoices()
    const filteredVoices = voices.filter(voice => 
      voice.lang.startsWith(selectedLanguage)
    ).sort((a, b) => a.name.localeCompare(b.name))
    
    setAvailableVoices(filteredVoices)
    
    // Reset voice selection when language changes
    if (filteredVoices.length > 0) {
      // Prioritize Zira as the default voice
      const ziraVoice = filteredVoices.find(voice => 
        voice.name.toLowerCase().includes('zira')
      )
      const defaultVoice = ziraVoice || 
        filteredVoices.find(voice => voice.default || voice.localService) || 
        filteredVoices[0]
      setSelectedVoice(defaultVoice.name)
    }
  }, [selectedLanguage])

  const getLanguageName = (code) => {
    const names = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'pl': 'Polish',
      'tr': 'Turkish',
      'he': 'Hebrew'
    }
    return names[code] || code.toUpperCase()
  }



  const handlePadPlay = (pad) => {
    if (!pad.sound) return

    playPad(pad.id, pad.sound, selectedVoice)
      .then(() => {
        setStatusMessage(`Playing: ${pad.label}`)
        setTimeout(() => setStatusMessage(''), 2000)
      })
      .catch(err => {
        console.error('Failed to play sound:', err)
        setError(`Failed to play sound: ${err.message}`)
        setTimeout(() => setError(null), 3000)
      })
  }

  const handleLoadConfig = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        
        // Check if this is a full export or just soundboard config
        if (importedData.soundboard && importedData.version) {
          // Full export format - restore everything
          console.log('Importing full backup:', importedData._readme)
          localStorage.setItem('soundboard-config-data', JSON.stringify(importedData.soundboard))
          localStorage.setItem('soundboard-config-url', 'local-file')
          
          // Restore sentence builder data
          if (importedData.sentenceBuilder) {
            localStorage.setItem('sentence-builder-words', JSON.stringify(importedData.sentenceBuilder.words || {}))
            localStorage.setItem('sentence-builder-custom-words', JSON.stringify(importedData.sentenceBuilder.customWords || {}))
            localStorage.setItem('sentence-builder-categories', JSON.stringify(importedData.sentenceBuilder.categories || {}))
          }
          
          // Restore settings
          if (importedData.settings) {
            localStorage.setItem('soundboard-volume', importedData.settings.volume || '1.0')
            localStorage.setItem('soundboard-language', importedData.settings.language || 'en')
            localStorage.setItem('soundboard-voice', importedData.settings.voice || '')
            localStorage.setItem('soundboard-theme', importedData.settings.theme || 'dark')
            
            // Apply settings immediately
            setVolume(parseFloat(importedData.settings.volume || '1.0'))
            setSelectedLanguage(importedData.settings.language || 'en')
            setSelectedVoice(importedData.settings.voice || '')
            setIsDarkMode(importedData.settings.theme === 'dark')
          }
          
          setConfig(importedData.soundboard)
          setStatusMessage('Full configuration restored successfully!')
        } else {
          // Legacy format - just soundboard config
          localStorage.setItem('soundboard-config-data', JSON.stringify(importedData))
          localStorage.setItem('soundboard-config-url', 'local-file')
          
          setConfig(importedData)
          setStatusMessage('Soundboard config loaded successfully!')
        }
        
        setError(null)
        setTimeout(() => setStatusMessage(''), 3000)
        
        // Reload page to apply all changes
        setTimeout(() => window.location.reload(), 500)
      } catch (err) {
        setError(`Invalid JSON file: ${err.message}`)
        setTimeout(() => setError(null), 5000)
      }
    }
    reader.readAsText(file)

    // Reset file input
    event.target.value = ''
  }

  const handleConfigUpdate = (newConfig) => {
    // Save to localStorage for persistence
    localStorage.setItem('soundboard-config-data', JSON.stringify(newConfig))
    

    
    setConfig(newConfig)
    setStatusMessage('Configuration updated!')
    setTimeout(() => setStatusMessage(''), 2000)
  }

  const handleAdminToggle = () => {
    setShowAdmin(!showAdmin)
    setShowMenu(false) // Close menu when opening admin
  }

  const handleInfoToggle = () => {
    setShowInfo(!showInfo)
    setShowMenu(false) // Close menu when opening info
  }

  const handleViewToggle = () => {
    if (currentView === 'landing') return // Don't toggle from landing page
    
    // Toggle between soundboard and sentence-builder
    if (currentView === 'soundboard') {
      setCurrentView('sentence-builder')
    } else {
      setCurrentView('soundboard')
    }
    
    setShowMenu(false) // Close menu when switching views
  }

  const handleLandingChoice = (choice) => {
    setCurrentView(choice)
    // Only show tips if user hasn't dismissed them before
    const dismissed = localStorage.getItem('open-speech-builder-tooltip-dismissed')
    if (!dismissed) {
      setShowViewTips(true)
    }
  }

  const handleDismissTip = () => {
    setShowViewTips(false)
    localStorage.setItem('open-speech-builder-tooltip-dismissed', 'true')
  }

  const handleMenuToggle = () => {
    setShowMenu(!showMenu)
  }

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleResetSettings = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all settings? This will clear your saved preferences including theme, language, voice, volume, and tooltip dismissals. This action cannot be undone.'
    )
    
    if (confirmed) {
      // Clear all localStorage items related to the app
      localStorage.removeItem('soundboard-theme')
      localStorage.removeItem('soundboard-language') 
      localStorage.removeItem('soundboard-voice')
      localStorage.removeItem('soundboard-volume')
      localStorage.removeItem('soundboard-config-url')
      localStorage.removeItem('soundboard-config-data')
      localStorage.removeItem('sentence-builder-last')
      localStorage.removeItem('open-speech-builder-tooltip-dismissed')
      
      // Reset state to defaults
      setIsDarkMode(true) // Default to dark mode
      setSelectedLanguage('en')
      setSelectedVoice('')
      setVolume(1.0)
      setShowViewTips(true)
      setCurrentView('landing')
      setShowMenu(false)
      
      // Show success message
      setStatusMessage('Settings reset successfully!')
      setTimeout(() => setStatusMessage(''), 3000)
    }
  }

  const handlePadEdit = (padIndex) => {
    if (!isEditMode) return
    
    const pad = config.pads[padIndex] || {
      id: `pad-${padIndex + 1}`,
      label: '',
      sound: '',
      color: getThemeDefaultColor(),
      key: ''
    }
    
    setEditingPad({ ...pad, index: padIndex })
  }

  const handleWordEdit = (categoryKey, wordIndex, word) => {
    if (!isEditMode) return
    
    // Small delay to ensure any previous saves have completed
    setTimeout(() => {
      // Load existing word configuration if it exists
      const savedWords = localStorage.getItem('sentence-builder-words')
      const wordConfigs = savedWords ? JSON.parse(savedWords) : {}
      const wordKey = `${categoryKey}-${wordIndex}`
      const existingConfig = wordConfigs[wordKey]
      
      // Create a word button configuration, using existing config if available
      const wordButton = {
        id: `word-${categoryKey}-${wordIndex}`,
        label: existingConfig?.label || word || '', // Use saved label or default to word
        sound: existingConfig?.sound || word || 'New Word', // Use saved sound or default to word
        color: existingConfig?.color || getRandomWordColor(word || 'new-word', categoryKey, wordIndex),
        key: existingConfig?.key || '',
        order: existingConfig?.order || '',
        category: categoryKey,
        originalCategory: categoryKey, // Store original category for change detection
        wordIndex: wordIndex,
        originalWordIndex: wordIndex, // Store original index
        isNewWord: word === null // Flag to indicate this is a new word
      }
      
      console.log('handleWordEdit - Existing config:', existingConfig)
      console.log('handleWordEdit - Word button:', wordButton)
      
      setEditingPad(wordButton)
    }, 50) // Small delay to ensure localStorage is updated
  }

  const handleCategoryEdit = (categoryKey) => {
    if (!isEditMode) return
    
    // Load existing category configuration if it exists
    const savedCategories = localStorage.getItem('sentence-builder-categories')
    const categoryConfigs = savedCategories ? JSON.parse(savedCategories) : {}
    const existingConfig = categoryConfigs[categoryKey]
    
    // Get the base category info
    const baseCategory = sentenceBuilderCategories?.[categoryKey]
    
    // Create a category button configuration
    const categoryButton = {
      id: `category-${categoryKey}`,
      label: existingConfig?.label || baseCategory?.label || categoryKey,
      sound: existingConfig?.sound || baseCategory?.label || categoryKey,
      color: existingConfig?.color || getThemeDefaultColor(),
      key: existingConfig?.key || '',
      order: existingConfig?.order || '',
      icon: existingConfig?.icon || baseCategory?.icon || '📁',
      categoryKey: categoryKey,
      isCategory: true // Flag to indicate this is a category
    }
    
    setEditingPad(categoryButton)
  }

  const handlePadUpdate = (updatedPad) => {
    // Check if this is a category button
    if (updatedPad.isCategory) {
      // Handle category configuration update
      const savedCategories = localStorage.getItem('sentence-builder-categories')
      const categoryConfigs = savedCategories ? JSON.parse(savedCategories) : {}
      
      const categoryConfig = {
        label: updatedPad.label,
        sound: updatedPad.sound,
        color: updatedPad.color,
        order: updatedPad.order,
        icon: updatedPad.icon
      }
      
      categoryConfigs[updatedPad.categoryKey] = categoryConfig
      localStorage.setItem('sentence-builder-categories', JSON.stringify(categoryConfigs))
      
      // Trigger reload of sentence builder
      if (window.reloadSentenceBuilderConfigs) {
        window.reloadSentenceBuilderConfigs()
      }
      
      setEditingPad(null)
      setStatusMessage('Category updated successfully!')
      setTimeout(() => setStatusMessage(''), 2000)
      return
    }

    // Check if this is a word button (has category and wordIndex)
    if (updatedPad.category && updatedPad.wordIndex !== undefined) {
      // Handle word button update - save to separate localStorage
      const savedWords = localStorage.getItem('sentence-builder-words')
      const wordConfigs = savedWords ? JSON.parse(savedWords) : {}
      
      // Handle new word creation
      if (updatedPad.isNewWord) {
        // Add to custom vocabulary
        const savedCustomWords = localStorage.getItem('sentence-builder-custom-words')
        const customWords = savedCustomWords ? JSON.parse(savedCustomWords) : {}
        
        if (!customWords[updatedPad.category]) {
          customWords[updatedPad.category] = []
        }
        
        // Add the new word to the category
        customWords[updatedPad.category].push(updatedPad.label)
        localStorage.setItem('sentence-builder-custom-words', JSON.stringify(customWords))
        
        // Update the word index to be the correct position in the expanded vocabulary
        updatedPad.wordIndex = customWords[updatedPad.category].length - 1 + 1000 // Offset to avoid conflicts
      }
      
      // Handle category changes
      const originalCategory = updatedPad.originalCategory || updatedPad.category
      const newCategory = updatedPad.category
      
      // Save the configuration first
      const wordKey = `${updatedPad.category}-${updatedPad.wordIndex}`
      const configToSave = {
        label: updatedPad.label,
        sound: updatedPad.sound,
        color: updatedPad.color,
        order: updatedPad.order
      }
      
      if (originalCategory !== newCategory && !updatedPad.isNewWord) {
        // Category changed - move word to new category
        const savedCustomWords = localStorage.getItem('sentence-builder-custom-words')
        const customWords = savedCustomWords ? JSON.parse(savedCustomWords) : {}
        
        // Initialize new category if it doesn't exist
        if (!customWords[newCategory]) {
          customWords[newCategory] = []
        }
        
        // Check if word already exists in new category to prevent duplicates
        let wordPositionInCustomWords = customWords[newCategory].indexOf(updatedPad.label)
        
        if (wordPositionInCustomWords === -1) {
          // Word doesn't exist, add it to the new category
          customWords[newCategory].push(updatedPad.label)
          wordPositionInCustomWords = customWords[newCategory].length - 1
        }
        // If word already exists, wordPositionInCustomWords will be its current position
        
        // Remove word from original category if it's in custom words
        if (customWords[originalCategory]) {
          const wordIndex = customWords[originalCategory].indexOf(updatedPad.label)
          if (wordIndex > -1) {
            customWords[originalCategory].splice(wordIndex, 1)
            // Clean up empty categories
            if (customWords[originalCategory].length === 0) {
              delete customWords[originalCategory]
            }
          }
        }
        
        localStorage.setItem('sentence-builder-custom-words', JSON.stringify(customWords))
        
        // Calculate new word index based on how SentenceBuilder merges words
        // Custom words are appended after base vocabulary words
        const baseVocabulary = sentenceBuilderCategories?.[newCategory]?.words || []
        const baseVocabularyLength = baseVocabulary.length
        const newWordIndex = baseVocabularyLength + wordPositionInCustomWords
        const newWordKey = `${newCategory}-${newWordIndex}`
        

        
        // Save config with new key
        wordConfigs[newWordKey] = configToSave
        
        // Remove old configuration
        const oldWordKey = `${originalCategory}-${updatedPad.originalWordIndex}`
        delete wordConfigs[oldWordKey]
      } else {
        // No category change, save normally
        wordConfigs[wordKey] = configToSave
      }
      
      localStorage.setItem('sentence-builder-words', JSON.stringify(wordConfigs))
      
      // Trigger reload of word configurations in SentenceBuilder
      if (window.reloadSentenceBuilderConfigs) {
        window.reloadSentenceBuilderConfigs()
      }
      
      // Debug: Verify the configuration was saved correctly
      setTimeout(() => {
        const savedConfigs = JSON.parse(localStorage.getItem('sentence-builder-words') || '{}')
        console.log('Verification - configs in localStorage after save:', savedConfigs)
        
        // Look for the specific config we just saved
        Object.keys(savedConfigs).forEach(key => {
          const config = savedConfigs[key]
          if (config.image || (config.color && config.color !== getThemeDefaultColor())) {
            console.log(`Found non-default config: ${key}`, config)
          }
        })
      }, 100)
      
      setEditingPad(null)
      setStatusMessage(updatedPad.isNewWord ? 'New word added successfully!' : 'Word button updated successfully!')
      setTimeout(() => setStatusMessage(''), 2000)
      return
    }
    
    // Handle regular soundboard pad update
    const newConfig = { ...config }
    
    // Ensure pads array is large enough
    while (newConfig.pads.length <= updatedPad.index) {
      newConfig.pads.push({
        id: `pad-${newConfig.pads.length + 1}`,
        label: '',
        sound: '',
        color: getThemeDefaultColor(),
        key: ''
      })
    }
    
    // Update the specific pad
    newConfig.pads[updatedPad.index] = {
      id: updatedPad.id,
      label: updatedPad.label,
      sound: updatedPad.sound,
      color: updatedPad.color,
      key: updatedPad.key,
      order: updatedPad.order
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('soundboard-config-data', JSON.stringify(newConfig))
    
    setConfig(newConfig)
    setEditingPad(null)
    setStatusMessage('Button updated successfully!')
    setTimeout(() => setStatusMessage(''), 2000)
  }

  const handleSaveConfig = () => {
    const configData = JSON.stringify(config, null, 2)
    const blob = new Blob([configData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'soundboard-config.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setStatusMessage('Configuration saved!')
    setTimeout(() => setStatusMessage(''), 2000)
  }

  const handleResetConfig = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset to the default configuration? This will remove all your custom button settings.'
    )
    
    if (confirmed) {
      // Clear saved configuration
      localStorage.removeItem('soundboard-config-data')
      localStorage.removeItem('soundboard-config-url')
      
      // Reload default configuration
      loadConfig(DEFAULT_CONFIG_URL)
        .then(setConfig)
        .catch(err => {
          console.error('Failed to load default config:', err)
          setError(`Failed to load default config: ${err.message}`)
        })
      
      setStatusMessage('Configuration reset to default!')
      setTimeout(() => setStatusMessage(''), 2000)
    }
  }



  if (!config) {
    return (
      <div className="app">
        <div className="header">
          <h1 className="title">Loading Soundboard...</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <button
          onClick={handleMenuToggle}
          className="btn btn-ghost btn-icon menu-btn"
          aria-label="Open menu"
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        <h1 className="title">Open Speech Builder</h1>

        <div className="header-controls">
          {(currentView === 'soundboard' || currentView === 'sentence-builder') && (
            <>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`btn btn-ghost btn-icon edit-toggle ${isEditMode ? 'active' : ''}`}
                aria-label={`${isEditMode ? 'Exit' : 'Enter'} edit mode`}
              >
                {isEditMode ? '✅' : '✏️'}
              </button>

            </>
          )}
          
          {currentView !== 'landing' && (
            <div className="view-toggle-container">
              <button
                onClick={handleViewToggle}
                className="btn btn-ghost btn-icon view-toggle"
                aria-label={`Switch to ${
                  currentView === 'soundboard' ? 'sentence builder' : 'soundboard'
                }`}
              >
                {currentView === 'soundboard' ? '📝' : '🔊'}
              </button>
              
              {/* Tooltip positioned relative to button */}
              {showViewTips && (
                <div className="floating-tooltip">
                  <div className="tooltip-content">
                    <p>Switch views here!</p>
                    <button 
                      onClick={handleDismissTip}
                      className="tooltip-close"
                      aria-label="Dismiss tooltip"
                    >
                      ×
                    </button>
                  </div>
                  <div className="tooltip-arrow"></div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handleThemeToggle}
            className="btn btn-ghost btn-icon theme-toggle"
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="file-input"
          aria-hidden="true"
        />
      </div>

      {/* Slide-out Menu */}
      <div className={`menu-overlay ${showMenu ? 'open' : ''}`} onClick={handleMenuToggle}></div>
      <div className={`slide-menu ${showMenu ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>Menu</h2>
          <button onClick={handleMenuToggle} className="btn btn-ghost btn-icon btn-sm close-menu-btn" aria-label="Close menu">
            ×
          </button>
        </div>

        <div className="menu-content">
          <div className="menu-section">
            <h3>Navigation</h3>
            <button onClick={handleInfoToggle} className="btn btn-outline btn-block menu-item">
              📖 Info
            </button>
            <button onClick={handleViewToggle} className="btn btn-outline btn-block menu-item">
              {currentView === 'soundboard' ? '📝 Sentence Builder' : '🔊 Soundboard'}
            </button>
          </div>

          <div className="menu-section">
            <h3>Language</h3>
            <select
              id="menu-language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="menu-select"
              aria-label="Select language"
            >
              {availableLanguages.length === 0 ? (
                <option value="en">Loading languages...</option>
              ) : (
                availableLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="menu-section">
            <h3>Voice</h3>
            <select
              id="menu-voice"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="menu-select"
              aria-label="Select voice"
            >
              {availableVoices.length === 0 ? (
                <option value="">Loading voices...</option>
              ) : (
                availableVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name.replace(/Microsoft |Google |Apple /, '')}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="menu-section">
            <h3>Volume</h3>
            <div className="volume-control">
              <input
                id="menu-volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
                aria-label="Global volume control"
              />
              <span className="volume-display">{Math.round(volume * 100)}%</span>
            </div>
          </div>

          <div className="menu-section">
            <button onClick={handleAdminToggle} className="btn btn-outline btn-block menu-item">
              ⚙️ Admin
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {currentView === 'landing' ? (
        <div className="landing-page">
          <div className="landing-content">
            <h2 className="landing-title">Welcome to Open Speech Builder</h2>
            <p className="landing-subtitle">Choose how you'd like to communicate:</p>
            
            <div className="landing-buttons">
              <button
                onClick={() => handleLandingChoice('soundboard')}
                className="landing-btn soundboard-btn"
                aria-label="Go to Soundboard"
              >
                <div className="landing-btn-icon">🔊</div>
                <div className="landing-btn-content">
                  <h3>Soundboard</h3>
                  <p>Quick access to pre-recorded sounds and phrases</p>
                </div>
              </button>
              
              <button
                onClick={() => handleLandingChoice('sentence-builder')}
                className="landing-btn sentence-btn"
                aria-label="Go to Sentence Builder"
              >
                <div className="landing-btn-icon">📝</div>
                <div className="landing-btn-content">
                  <h3>Sentence Builder</h3>
                  <p>Build custom sentences word by word</p>
                </div>
              </button>
            </div>
            
            <div className="landing-tip">
              <p>💡 <strong>Tip:</strong> You can toggle between soundboard and sentence builder using the button in the top right corner</p>
            </div>
          </div>
        </div>
      ) : currentView === 'soundboard' ? (
        <>
          {isEditMode && (
            <div className="edit-mode-banner">
              ✏️ Edit Mode Active - Click any button to configure it
            </div>
          )}
          <Grid
            config={config}
            onPadPlay={handlePadPlay}
            isEditMode={isEditMode}
            onPadEdit={handlePadEdit}
          />
        </>
      ) : currentView === 'sentence-builder' ? (
        <>
          {isEditMode && (
            <div className="edit-mode-banner">
              ✏️ Edit Mode Active - Click any word to configure it
            </div>
          )}
          <SentenceBuilder
            selectedVoice={selectedVoice}
            isDarkMode={isDarkMode}
            isEditMode={isEditMode}
            onWordEdit={handleWordEdit}
            onCategoriesReady={setSentenceBuilderCategories}
            onCategoryEdit={handleCategoryEdit}
          />
        </>
      ) : null}

      {statusMessage && (
        <div className="status-message" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      <div className="sr-only" aria-live="polite" id="pad-announcer"></div>

      {showAdmin && (
        <AdminPage
          config={config}
          onConfigUpdate={handleConfigUpdate}
          onClose={() => setShowAdmin(false)}
          onLoadConfig={handleLoadConfig}
          selectedVoice={selectedVoice}
          isDarkMode={isDarkMode}
          onResetSettings={handleResetSettings}
          onResetConfig={handleResetConfig}
        />
      )}

      {showInfo && (
        <InfoPage
          onClose={() => setShowInfo(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {editingPad && (
        <ButtonConfigModal
          pad={editingPad}
          onSave={handlePadUpdate}
          onClose={() => setEditingPad(null)}
          categories={editingPad?.category ? sentenceBuilderCategories : null}
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  )
}

export default App