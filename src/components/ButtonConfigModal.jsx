import { useState, useEffect } from 'react'

function ButtonConfigModal({ pad, onSave, onClose, categories = null, isDarkMode = true }) {
  // Get theme-appropriate default color
  const getDefaultColor = () => {
    return isDarkMode ? '#f3f4f6' : '#1f2937' // Light gray for dark theme, dark gray for light theme
  }

  const [formData, setFormData] = useState({
    label: '',
    sound: '',
    color: getDefaultColor(),
    key: '',

    order: '',
    category: '',
    icon: ''
  })


  useEffect(() => {
    if (pad) {

      // Get sound value (no prefix needed)
      let soundValue = pad.sound || pad.label || 'Hello'
      // Remove tts: prefix if it exists (for backwards compatibility)
      if (soundValue.startsWith('tts:')) {
        soundValue = soundValue.substring(4)
      }

      console.log('ButtonConfigModal - Setting form data:', {
        label: pad.label || '',
        sound: soundValue,
        color: pad.color || '#6366f1',
        key: pad.key || ''
      })
      
      setFormData({
        label: pad.label || '',
        sound: soundValue,
        color: pad.color || getDefaultColor(),
        key: pad.key || '',

        order: pad.order || '',
        category: pad.category || '',
        icon: pad.icon || ''
      })
    }
  }, [pad, isDarkMode])



  const handleSubmit = (e) => {
    e.preventDefault()

    const updatedPad = {
      ...pad,
      label: formData.label.trim(),
      sound: formData.sound.trim() ? formData.sound.trim() : null,
      color: formData.color,
      key: formData.key.trim(),

      order: formData.order.trim(),
      category: formData.category,
      icon: formData.icon.trim()
    }

    onSave(updatedPad)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getSoundText = () => {
    const sound = formData.sound || ''
    // Remove tts: prefix if it exists (for backwards compatibility)
    return sound.startsWith('tts:') ? sound.substring(4) : sound
  }



  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel" onClick={e => e.stopPropagation()}>
        <div className="config-header">
          <h2>Configure Button</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-sm close-btn"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="config-content">
          <form onSubmit={handleSubmit} className="button-config-form">
          <div className="form-group">
            <label htmlFor="button-label">Button Label</label>
            <textarea
              id="button-label"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="Enter button text (can be multiple lines)"
              rows={3}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tts-text">Text to Speak</label>
            <input
              id="tts-text"
              type="text"
              value={getSoundText()}
              onChange={(e) => handleInputChange('sound', e.target.value)}
              placeholder="Enter text to speak"
            />
          </div>

          <div className="form-group">
            <label>Button Color</label>
            <div className="color-selector">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="hidden-color-input"
                id="hidden-color-input"
              />
              <div
                className="color-square"
                style={{ backgroundColor: formData.color }}
                onClick={() => document.getElementById('hidden-color-input').click()}
                title={`Click to change color (${formData.color})`}
              />
              <input
                type="text"
                className="color-value-input"
                value={formData.color}
                onChange={(e) => {
                  const value = e.target.value
                  // Allow typing # and hex characters
                  if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                    handleInputChange('color', value)
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value
                  // Ensure it's a valid hex color on blur
                  if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    // Reset to previous valid color if invalid
                    handleInputChange('color', formData.color)
                  }
                }}
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="button-order">Display Order</label>
            <input
              id="button-order"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', e.target.value)}
              placeholder="Optional: 1, 2, 3... (leave empty for default position)"
              min="1"
            />
          </div>

          {categories && (
            <div className="form-group">
              <label htmlFor="button-category">Category</label>
              <select
                id="button-category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {Object.entries(categories).map(([categoryKey, category]) => (
                  <option key={categoryKey} value={categoryKey}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {pad?.isCategory && (
            <div className="form-group">
              <label htmlFor="category-icon">Category Icon</label>
              <input
                id="category-icon"
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="Enter emoji or icon (e.g., ⭐, 🏃, 👥)"
                maxLength={4}
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Button
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ButtonConfigModal