import { useState, useEffect } from 'react'

function AdminPage({ config, onConfigUpdate, onClose, onLoadConfig, selectedVoice, isDarkMode, onResetSettings, onResetConfig }) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState('')
  const [testText, setTestText] = useState('Hello, this is a test')

  // Helper to build full config object
  const buildFullConfig = () => {
    const customWords = JSON.parse(localStorage.getItem('sentence-builder-custom-words') || '{}')
    const wordConfigs = JSON.parse(localStorage.getItem('sentence-builder-words') || '{}')
    const categoryConfigs = JSON.parse(localStorage.getItem('sentence-builder-categories') || '{}')
    
    const customWordCount = Object.values(customWords).reduce((sum, words) => sum + words.length, 0)
    const wordConfigCount = Object.keys(wordConfigs).length
    const categoryConfigCount = Object.keys(categoryConfigs).length
    
    return {
      _readme: {
        description: "Open Speech Builder - Full Configuration",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
        contents: {
          soundboardButtons: config?.pads?.length || 0,
          customWords: customWordCount,
          wordCustomizations: wordConfigCount,
          categoryCustomizations: categoryConfigCount
        }
      },
      soundboard: config,
      sentenceBuilder: {
        words: wordConfigs,
        customWords: customWords,
        categories: categoryConfigs
      },
      settings: {
        volume: localStorage.getItem('soundboard-volume') || '1.0',
        language: localStorage.getItem('soundboard-language') || 'en',
        voice: localStorage.getItem('soundboard-voice') || '',
        theme: localStorage.getItem('soundboard-theme') || 'dark'
      }
    }
  }

  useEffect(() => {
    if (config) {
      const fullConfig = buildFullConfig()
      setJsonText(JSON.stringify(fullConfig, null, 2))
    }
  }, [config])



  const handleSave = () => {
    try {
      const fullConfig = JSON.parse(jsonText)
      
      // Basic validation
      if (!fullConfig || typeof fullConfig !== 'object') {
        throw new Error('Config must be a valid JSON object')
      }
      
      // Check if this is a full config or legacy soundboard-only config
      if (fullConfig.soundboard) {
        // Full config format
        if (!fullConfig.soundboard.pads || !Array.isArray(fullConfig.soundboard.pads)) {
          throw new Error('Soundboard config must have a pads array')
        }
        
        // Save soundboard config
        onConfigUpdate(fullConfig.soundboard)
        
        // Save sentence builder data
        if (fullConfig.sentenceBuilder) {
          localStorage.setItem('sentence-builder-words', JSON.stringify(fullConfig.sentenceBuilder.words || {}))
          localStorage.setItem('sentence-builder-custom-words', JSON.stringify(fullConfig.sentenceBuilder.customWords || {}))
          localStorage.setItem('sentence-builder-categories', JSON.stringify(fullConfig.sentenceBuilder.categories || {}))
        }
        
        // Save settings
        if (fullConfig.settings) {
          localStorage.setItem('soundboard-volume', fullConfig.settings.volume || '1.0')
          localStorage.setItem('soundboard-language', fullConfig.settings.language || 'en')
          localStorage.setItem('soundboard-voice', fullConfig.settings.voice || '')
          localStorage.setItem('soundboard-theme', fullConfig.settings.theme || 'dark')
        }
        
        // Trigger reload of sentence builder
        if (window.reloadSentenceBuilderConfigs) {
          window.reloadSentenceBuilderConfigs()
        }
        
        setError('')
        alert('Full configuration saved! Reloading page to apply all changes...')
        setTimeout(() => window.location.reload(), 500)
      } else if (fullConfig.pads && Array.isArray(fullConfig.pads)) {
        // Legacy format - just soundboard config
        onConfigUpdate(fullConfig)
        setError('')
      } else {
        throw new Error('Invalid config format')
      }
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`)
    }
  }

  const handleTestVoice = () => {
    if (!testText.trim()) return

    const utterance = new SpeechSynthesisUtterance(testText)
    
    // Use the globally selected voice
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

  const handleExport = () => {
    try {
      // Export whatever is currently in the editor
      const fullConfig = JSON.parse(jsonText)
      
      const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `open-speech-builder-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Cannot export: Invalid JSON')
    }
  }

  return (
    <div className="admin-overlay">
      <div className={`admin-panel ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="admin-header">
          <h2>Soundboard Admin</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm close-btn" aria-label="Close admin panel">
            ×
          </button>
        </div>

        <div className="admin-content">
          <div className="admin-section">
            <h3>Text-to-Speech Settings</h3>
            <div className="tts-controls">
              <div className="test-voice">
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Test text with current voice"
                  className="test-input"
                />
                <button onClick={handleTestVoice} className="btn btn-success test-btn">
                  Test Current Voice
                </button>
              </div>
              
              <p className="tts-note">
                Voice and language are controlled globally from the menu. Test voice uses your current selection.
              </p>
            </div>
          </div>

          <div className="admin-section json-section">
            <h3>Full Configuration Editor</h3>
            <p className="config-note">
              <strong>This editor shows ALL app data:</strong>
              <br/>• <code>soundboard</code> - All buttons, colors, sounds, layout
              <br/>• <code>sentenceBuilder</code> - Custom words, pronunciations, categories
              <br/>• <code>settings</code> - Volume, language, voice, theme
              <br/><br/>
              Edit the JSON directly or use the buttons below. Changes apply to everything.
            </p>
            <div className="editor-controls">
              <button onClick={handleExport} className="btn btn-warning export-btn">
                💾 Export to File
              </button>
              <button onClick={onLoadConfig} className="btn btn-success load-config-btn">
                📂 Import from File
              </button>
            </div>
            
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="json-editor"
              placeholder="Enter JSON configuration..."
            />
            
            {error && <div className="admin-error">{error}</div>}
            
            <div className="admin-actions">
              <button onClick={handleSave} className="btn btn-primary save-btn">
                Apply Changes
              </button>
              <button onClick={onClose} className="btn btn-secondary cancel-btn">
                Cancel
              </button>
            </div>
          </div>

          <div className="admin-section">
            <h3>Configuration</h3>
            <p className="reset-warning">
              Reset to default soundboard configuration. This will remove all your custom button settings and reload from the default config file.
            </p>
            <button onClick={onResetConfig} className="btn btn-danger reset-settings-btn">
              🔄 Reset Configuration
            </button>
          </div>

          <div className="admin-section">
            <h3>Application Settings</h3>
            <p className="reset-warning">
              Reset all user preferences including theme, language, voice, volume, and saved settings. This action cannot be undone.
            </p>
            <button onClick={onResetSettings} className="btn btn-danger reset-settings-btn">
              🔄 Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage