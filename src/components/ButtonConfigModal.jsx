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
    image: null,
    order: '',
    category: '',
    icon: ''
  })
  const [imageLibrary, setImageLibrary] = useState({})

  useEffect(() => {
    if (pad) {
      let imageValue = pad.image || null
      
      // Convert old image format (full object) to new format (image ID)
      if (imageValue && typeof imageValue === 'object' && imageValue.name) {
        // Find the image ID by matching the name in the library
        const imageId = Object.keys(imageLibrary).find(key => 
          imageLibrary[key].name === imageValue.name
        )
        imageValue = imageId || null
      }
      
      // Ensure sound is always in TTS format
      let soundValue = pad.sound || ''
      if (soundValue && !soundValue.startsWith('tts:')) {
        // If there's a sound but it's not TTS format, convert it
        soundValue = `tts:${soundValue}`
      } else if (!soundValue) {
        // If no sound, default to TTS with the label
        soundValue = `tts:${pad.label || 'Hello'}`
      }

      console.log('ButtonConfigModal - Setting form data:', {
        label: pad.label || '',
        sound: soundValue,
        color: pad.color || '#6366f1',
        key: pad.key || '',
        image: imageValue
      })
      
      setFormData({
        label: pad.label || '',
        sound: soundValue,
        color: pad.color || getDefaultColor(),
        key: pad.key || '',
        image: imageValue,
        order: pad.order || '',
        category: pad.category || '',
        icon: pad.icon || ''
      })
    }
  }, [pad, imageLibrary, isDarkMode])

  // Load image library from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('image-designer-library')
    if (saved) {
      try {
        setImageLibrary(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load image library:', err)
      }
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    const updatedPad = {
      ...pad,
      label: formData.label.trim(),
      sound: formData.sound.trim() ? formData.sound.trim() : null,
      color: formData.color,
      key: formData.key.trim(),
      image: formData.image,
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
    if (formData.sound && formData.sound.startsWith('tts:')) {
      return formData.sound.substring(4)
    }
    return formData.sound || ''
  }

  const renderImage = (imageData, size = 32) => {
    if (!imageData || !imageData.data) return null

    const pixelSize = size / 16
    return (
      <div
        className="mini-canvas"
        style={{
          width: size,
          height: size,
          display: 'grid',
          gridTemplateColumns: 'repeat(16, 1fr)',
          gridTemplateRows: 'repeat(16, 1fr)',
          gap: 0
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
              style={{
                backgroundColor: pixelColor,
                width: pixelSize,
                height: pixelSize
              }}
            />
          )
        })}
      </div>
    )
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
            <input
              id="button-label"
              type="text"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="Enter button text"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tts-text">Text to Speak</label>
            <input
              id="tts-text"
              type="text"
              value={getSoundText()}
              onChange={(e) => handleInputChange('sound', `tts:${e.target.value}`)}
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
            <label>Button Image (Optional)</label>
            <div className="image-selection">
              <div className="current-image">
                <div
                  className={`image-option ${!formData.image ? 'selected' : ''}`}
                  onClick={() => handleInputChange('image', null)}
                >
                  <div className="no-image-placeholder">No Image</div>
                </div>
                {formData.image && imageLibrary[formData.image] && (
                  <div className="selected-image-preview">
                    {renderImage(imageLibrary[formData.image], 40)}
                    <span>{imageLibrary[formData.image].name}</span>
                  </div>
                )}
              </div>

              {Object.keys(imageLibrary).length > 0 && (
                <div className="image-library-grid">
                  {Object.entries(imageLibrary).map(([key, imageData]) => (
                    <div
                      key={key}
                      className={`image-option ${formData.image === key ? 'selected' : ''}`}
                      onClick={() => handleInputChange('image', key)}
                      title={imageData.name}
                    >
                      {renderImage(imageData, 32)}
                    </div>
                  ))}
                </div>
              )}

              {Object.keys(imageLibrary).length === 0 && (
                <p className="no-images-message">
                  No images available. Create some in the Image Designer first!
                </p>
              )}
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