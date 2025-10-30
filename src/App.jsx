import { useState, useEffect, useRef } from 'react'
import Grid from './components/Grid'
import AdminPage from './components/AdminPage'
import InfoPage from './components/InfoPage'
import SentenceBuilder from './components/SentenceBuilder'
import { loadConfig } from './utils/loadConfig'
import { useAudioPool } from './hooks/useAudioPool'

const DEFAULT_CONFIG_URL = '/config/soundboard.json'

function App() {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('soundboard-volume')
    return saved ? parseFloat(saved) : 0.7
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
  const fileInputRef = useRef(null)
  const { playPad, setGlobalVolume } = useAudioPool()

  // Load initial config
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const configUrl = urlParams.get('config') ||
      localStorage.getItem('soundboard-config-url') ||
      DEFAULT_CONFIG_URL

    loadConfig(configUrl)
      .then(setConfig)
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

  // Keyboard event handler
  useEffect(() => {
    if (!config) return

    const keyMap = {}
    config.pads.forEach((pad, index) => {
      if (pad && pad.key) {
        keyMap[pad.key.toLowerCase()] = pad
      } else {
        // Default key mapping: 1234/QWER/ASDF/ZXCV
        const defaultKeys = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v']
        if (defaultKeys[index]) {
          keyMap[defaultKeys[index]] = pad
        }
      }
    })

    const handleKeyDown = (event) => {
      // Don't trigger keyboard shortcuts when admin panel is open
      if (showAdmin) return
      
      // Don't trigger if user is typing in an input/textarea
      const activeElement = document.activeElement
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      )) {
        return
      }

      const key = event.key.toLowerCase()
      const pad = keyMap[key]
      if (pad && pad.sound && !event.repeat) {
        event.preventDefault()
        handlePadPlay(pad)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [config, showAdmin])

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
        const configData = JSON.parse(e.target.result)
        setConfig(configData)
        setError(null)
        setStatusMessage('Config loaded successfully!')
        setTimeout(() => setStatusMessage(''), 2000)

        // Save to localStorage for persistence
        localStorage.setItem('soundboard-config-url', 'local-file')
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
    setCurrentView(currentView === 'soundboard' ? 'sentence-builder' : 'soundboard')
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
    localStorage.setItem('myvopen-speech-builderoice-tooltip-dismissed', 'true')
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
      localStorage.removeItem('sentence-builder-last')
      localStorage.removeItem('myvoice-tooltip-dismissed')
      
      // Reset state to defaults
      setIsDarkMode(true) // Default to dark mode
      setSelectedLanguage('en')
      setSelectedVoice('')
      setVolume(0.7)
      setShowViewTips(true)
      setCurrentView('landing')
      setShowMenu(false)
      
      // Show success message
      setStatusMessage('Settings reset successfully!')
      setTimeout(() => setStatusMessage(''), 3000)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        setShowAdmin(!showAdmin)
      }
      if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault()
        setShowInfo(!showInfo)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAdmin, showInfo])

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
        {currentView !== 'landing' && (
          <button
            onClick={handleMenuToggle}
            className="menu-btn"
            aria-label="Open menu"
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        )}
        
        <h1 className="title">Open Speech Builder</h1>

        <div className="header-controls">
          {currentView !== 'landing' && (
            <div className="view-toggle-container">
              <button
                onClick={handleViewToggle}
                className="view-toggle"
                aria-label={`Switch to ${currentView === 'soundboard' ? 'sentence builder' : 'soundboard'}`}
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
            className="theme-toggle"
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
          <button onClick={handleMenuToggle} className="close-menu-btn" aria-label="Close menu">
            ×
          </button>
        </div>

        <div className="menu-content">
          <div className="menu-section">
            <h3>Navigation</h3>
            <button onClick={handleInfoToggle} className="menu-item">
              📖 Info
            </button>
            <button onClick={handleAdminToggle} className="menu-item">
              ⚙️ Admin
            </button>
            <button onClick={handleViewToggle} className="menu-item">
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
              <p>💡 <strong>Tip:</strong> You can switch between views anytime using the toggle button in the top right corner</p>
            </div>
          </div>
        </div>
      ) : currentView === 'soundboard' ? (
        <Grid
          config={config}
          onPadPlay={handlePadPlay}
        />
      ) : (
        <SentenceBuilder
          selectedVoice={selectedVoice}
          isDarkMode={isDarkMode}
        />
      )}

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
        />
      )}

      {showInfo && (
        <InfoPage
          onClose={() => setShowInfo(false)}
          isDarkMode={isDarkMode}
        />
      )}


    </div>
  )
}

export default App