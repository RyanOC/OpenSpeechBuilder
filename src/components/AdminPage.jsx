import { useState, useEffect } from 'react'

function AdminPage({ config, onConfigUpdate, onClose, onLoadConfig, selectedVoice, isDarkMode, onResetSettings, onResetConfig }) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState('')
  const [testText, setTestText] = useState('Hello, this is a test')

  useEffect(() => {
    if (config) {
      setJsonText(JSON.stringify(config, null, 2))
    }
  }, [config])



  const handleSave = () => {
    try {
      const newConfig = JSON.parse(jsonText)
      
      // Basic validation
      if (!newConfig || typeof newConfig !== 'object') {
        throw new Error('Config must be a valid JSON object')
      }
      
      if (!Array.isArray(newConfig.pads)) {
        throw new Error('Config must have a pads array')
      }

      onConfigUpdate(newConfig)
      setError('')
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`)
    }
  }

  const handleGenerateTTS = () => {
    if (!config) return

    const updatedConfig = { ...config }
    
    updatedConfig.pads = updatedConfig.pads.map(pad => {
      if (pad && pad.label) {
        return {
          ...pad,
          sound: `tts:${pad.label}`
        }
      }
      return pad
    })

    setJsonText(JSON.stringify(updatedConfig, null, 2))
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

  const handleAddPad = () => {
    try {
      const currentConfig = JSON.parse(jsonText)
      const newPad = {
        id: `pad-${Date.now()}`,
        label: 'New Pad',
        sound: 'tts:New Pad',
        color: '#4f46e5',
        key: ''
      }
      
      currentConfig.pads = currentConfig.pads || []
      currentConfig.pads.push(newPad)
      
      setJsonText(JSON.stringify(currentConfig, null, 2))
    } catch (err) {
      setError('Cannot add pad: Invalid JSON')
    }
  }

  const handleExport = () => {
    try {
      const config = JSON.parse(jsonText)
      const blob = new Blob([JSON.stringify(config, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'soundboard-config.json'
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
              
              <button onClick={handleGenerateTTS} className="btn btn-info generate-tts-btn">
                Generate TTS for All Pads
              </button>
              
              <p className="tts-note">
                Voice and language are controlled globally from the menu. Test voice uses your current selection.
              </p>
            </div>
          </div>

          <div className="admin-section json-section">
            <h3>Configuration Editor</h3>
            <div className="editor-controls">
              <button onClick={onLoadConfig} className="btn btn-success load-config-btn">
                Load Config File...
              </button>
              <button onClick={handleAddPad} className="btn btn-success add-pad-btn">
                Add New Pad
              </button>
              <button onClick={handleExport} className="btn btn-warning export-btn">
                Export Config
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