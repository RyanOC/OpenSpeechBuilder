import { useState, useEffect } from 'react'



function ImageDesigner({ isDarkMode }) {
  const [currentImage, setCurrentImage] = useState(() => {
    // Initialize with empty 16x16 grid - each cell stores color or null
    return Array(16).fill().map(() => Array(16).fill(null))
  })
  
  // Get theme-appropriate default color
  const getThemeDefaultColor = () => {
    return isDarkMode ? '#ffffff' : '#000000' // White for dark theme, black for light theme
  }
  
  const [selectedColor, setSelectedColor] = useState(() => getThemeDefaultColor())
  const [isDrawing, setIsDrawing] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [isColorPicking, setIsColorPicking] = useState(false)

  const [imageLibrary, setImageLibrary] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('image-designer-library')
    return saved ? JSON.parse(saved) : {}
  })
  const [selectedLibraryImage, setSelectedLibraryImage] = useState('')
  const [newImageName, setNewImageName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showJsonView, setShowJsonView] = useState(false)
  const [jsonText, setJsonText] = useState('')

  // Save library to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('image-designer-library', JSON.stringify(imageLibrary))
  }, [imageLibrary])

  // Update selected color when theme changes
  useEffect(() => {
    const newDefaultColor = isDarkMode ? '#ffffff' : '#000000'
    setSelectedColor(newDefaultColor)
  }, [isDarkMode])

  // Handle touch events with non-passive listeners to allow preventDefault
  useEffect(() => {
    const canvas = document.querySelector('.pixel-canvas')
    if (!canvas) return

    const handleTouchStart = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      if (element && element.classList.contains('pixel')) {
        const row = parseInt(element.getAttribute('data-row'))
        const col = parseInt(element.getAttribute('data-col'))
        if (!isNaN(row) && !isNaN(col)) {
          if (showJsonView) return // No interaction in JSON view
          
          if (isColorPicking) {
            // Pick color from pixel
            const pixelColor = currentImage[row][col]
            if (pixelColor) {
              setSelectedColor(pixelColor)
              setIsColorPicking(false)
            }
            return
          }
          
          setIsDrawing(true)
          drawPixel(row, col, isErasing ? null : selectedColor)
        }
      }
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      if (!isDrawing || isColorPicking || showJsonView) return
      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      if (element && element.classList.contains('pixel')) {
        const row = parseInt(element.getAttribute('data-row'))
        const col = parseInt(element.getAttribute('data-col'))
        if (!isNaN(row) && !isNaN(col)) {
          drawPixel(row, col, isErasing ? null : selectedColor)
        }
      }
    }

    const handleTouchEnd = (e) => {
      e.preventDefault()
      setIsDrawing(false)
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDrawing, isErasing, selectedColor])

  // Add global mouse up and touch end listeners to handle drawing state
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDrawing(false)
    }

    const handleGlobalTouchEnd = () => {
      setIsDrawing(false)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('touchend', handleGlobalTouchEnd)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [])

  const drawPixel = (row, col, color = selectedColor) => {
    const newImage = [...currentImage]
    newImage[row] = [...newImage[row]]
    newImage[row][col] = color
    setCurrentImage(newImage)
  }



  const handleMouseDown = (row, col) => {
    if (showJsonView) return // No interaction in JSON view
    
    if (isColorPicking) {
      // Pick color from pixel
      const pixelColor = currentImage[row][col]
      if (pixelColor) {
        setSelectedColor(pixelColor)
        setIsColorPicking(false)
      }
      return
    }
    
    setIsDrawing(true)
    drawPixel(row, col, isErasing ? null : selectedColor)
  }

  const handleMouseEnter = (row, col) => {
    if (isDrawing && !isColorPicking && !showJsonView) {
      drawPixel(row, col, isErasing ? null : selectedColor)
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    setCurrentImage(Array(16).fill().map(() => Array(16).fill(null)))
  }

  const handleJsonChange = (e) => {
    setJsonText(e.target.value)
  }

  const applyJsonChanges = () => {
    try {
      const parsedData = JSON.parse(jsonText)
      
      // Validate it's a 16x16 array
      if (!Array.isArray(parsedData) || parsedData.length !== 16) {
        throw new Error('Data must be a 16x16 array')
      }
      
      for (let row of parsedData) {
        if (!Array.isArray(row) || row.length !== 16) {
          throw new Error('Each row must have exactly 16 elements')
        }
      }
      
      // Convert 0/1 format to color format if needed
      const convertedData = parsedData.map(row =>
        row.map(pixel => {
          if (pixel === 0) return null // transparent
          if (pixel === 1) return '#000000' // black
          return pixel // already a color or null
        })
      )
      
      setCurrentImage(convertedData)
      alert('JSON applied successfully!')
      
    } catch (err) {
      alert(`Invalid JSON: ${err.message}\n\nPlease ensure your data is a valid 16x16 array.`)
    }
  }

  // Update JSON text when switching to JSON view or when currentImage changes
  const updateJsonText = () => {
    setJsonText(JSON.stringify(currentImage, null, 2))
  }

  const loadFromLibrary = (imageId) => {
    if (imageLibrary[imageId]) {
      // Convert old binary format to color format if needed
      const imageData = imageLibrary[imageId].data.map(row =>
        row.map(pixel => pixel === 1 ? '#000000' : (pixel === 0 ? null : pixel))
      )
      setCurrentImage(imageData)
      setSelectedLibraryImage(imageId)
    }
  }

  const saveToLibrary = () => {
    if (!newImageName.trim()) return

    const imageId = newImageName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const newLibrary = {
      ...imageLibrary,
      [imageId]: {
        name: newImageName.trim(),
        data: currentImage.map(row => [...row])
      }
    }

    setImageLibrary(newLibrary)
    setNewImageName('')
    setShowSaveDialog(false)
    setSelectedLibraryImage(imageId)
  }

  const deleteFromLibrary = (imageId) => {
    // Check if it's a starter image (smiley, heart, star)
    if (['smiley', 'heart', 'star'].includes(imageId)) {
      alert('Cannot delete starter images')
      return
    }

    const confirmed = window.confirm(`Delete "${imageLibrary[imageId].name}"?`)
    if (confirmed) {
      const newLibrary = { ...imageLibrary }
      delete newLibrary[imageId]
      setImageLibrary(newLibrary)

      if (selectedLibraryImage === imageId) {
        setSelectedLibraryImage('')
      }
    }
  }



  const exportAsDataURL = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')

    // Set background to transparent
    ctx.clearRect(0, 0, 16, 16)

    // Draw pixels with their actual colors
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        const pixelColor = currentImage[row][col]
        if (pixelColor) {
          ctx.fillStyle = pixelColor
          ctx.fillRect(col, row, 1, 1)
        }
      }
    }

    return canvas.toDataURL()
  }

  return (
    <div className="image-designer">
      <div className="designer-header">
        <h2>16x16 Pixel Image Designer</h2>
        <p>Create custom icons for your soundboard buttons</p>

      </div>

      <div className="designer-content">
        {/* Canvas */}
        <div className="canvas-section">
          {/* Toggle above canvas */}
          <div className="canvas-toggle">
            <button
              onClick={() => {
                if (!showJsonView) {
                  updateJsonText()
                }
                setShowJsonView(!showJsonView)
              }}
              className={`btn btn-sm toggle-view-btn ${showJsonView ? 'btn-info' : 'btn-outline'}`}
            >
              {showJsonView ? '🎨 Canvas' : '📄 JSON'}
            </button>
          </div>

          <div className="canvas-container">
            {showJsonView ? (
              <div className="json-view">
                <textarea
                  className="json-content editable"
                  value={jsonText}
                  onChange={handleJsonChange}
                  placeholder="Edit JSON data here..."
                />
                <div className="json-controls">
                  <button
                    onClick={applyJsonChanges}
                    className="btn btn-sm btn-success"
                  >
                    ✅ Apply Changes
                  </button>
                  <button
                    onClick={updateJsonText}
                    className="btn btn-sm btn-outline"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`pixel-canvas ${isErasing ? 'erasing' : ''} ${isColorPicking ? 'color-picking' : ''}`}
                onMouseLeave={handleMouseUp}
              >
                {currentImage.map((row, rowIndex) => (
                <div key={rowIndex} className="pixel-row">
                  {row.map((pixel, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`pixel ${pixel ? 'filled' : 'empty'}`}
                      style={{
                        backgroundColor: pixel || 'transparent'
                      }}
                      onMouseDown={(e) => {
                        if (e.button === 0) { // Left click
                          e.preventDefault()
                          handleMouseDown(rowIndex, colIndex)
                        } else if (e.button === 2 && !isColorPicking) { // Right click (not in color picking mode)
                          e.preventDefault()
                          drawPixel(rowIndex, colIndex, null) // Erase
                        }
                      }}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      data-row={rowIndex}
                      data-col={colIndex}
                      onContextMenu={(e) => e.preventDefault()} // Prevent context menu

                    />
                  ))}
                </div>
              ))}
              </div>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="canvas-controls">
            {!showJsonView && (
              <>
                <div className="color-picker">
                  <label htmlFor="color-input">Color:</label>
                  <input
                    id="color-input"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    disabled={isErasing || isColorPicking}
                  />
                </div>

                <button
                  onClick={() => {
                    setIsColorPicking(false)
                    setIsErasing(!isErasing)
                  }}
                  className={`btn control-btn eraser-btn ${isErasing ? 'btn-warning active' : ''}`}
                >
                  🧽 {isErasing ? 'Drawing' : 'Eraser'}
                </button>

                <button
                  onClick={() => {
                    setIsErasing(false)
                    setIsColorPicking(!isColorPicking)
                  }}
                  className={`btn control-btn color-picker-btn ${isColorPicking ? 'btn-info active' : ''}`}
                >
                  🎯 {isColorPicking ? 'Drawing' : 'Pick Color'}
                </button>

                <button onClick={clearCanvas} className="btn btn-danger control-btn clear-btn">
                  🗑️ Clear
                </button>
              </>
            )}

            <button
              onClick={() => setShowSaveDialog(true)}
              className="btn btn-success control-btn save-btn"
            >
              💾 Save to Library
            </button>
          </div>
        </div>

        {/* Image Library */}
        <div className="library-section">
          <h3>Image Library</h3>
          <div className="library-grid">
            {Object.entries(imageLibrary).map(([imageId, imageData]) => (
              <div
                key={imageId}
                className={`library-item ${selectedLibraryImage === imageId ? 'selected' : ''}`}
              >
                <div className="library-preview">
                  <div className="mini-canvas">
                    {imageData.data.map((row, rowIndex) => (
                      <div key={rowIndex} className="mini-row">
                        {row.map((pixel, colIndex) => {
                          // Handle both old binary format and new color format
                          const pixelColor = pixel === 1 ? '#000000' : (pixel === 0 ? null : pixel)
                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`mini-pixel ${pixelColor ? 'filled' : 'empty'}`}
                              style={{ backgroundColor: pixelColor || 'transparent' }}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="library-info">
                  <span className="library-name">{imageData.name}</span>
                  <div className="library-actions">
                    <button
                      onClick={() => loadFromLibrary(imageId)}
                      className="btn btn-sm btn-info library-btn load-btn"
                      title="Load image"
                    >
                      📂
                    </button>
                    {!['smiley', 'heart', 'star'].includes(imageId) && (
                      <button
                        onClick={() => deleteFromLibrary(imageId)}
                        className="btn btn-sm btn-danger library-btn delete-btn"
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h3>Save Image to Library</h3>
            <input
              type="text"
              placeholder="Enter image name..."
              value={newImageName}
              onChange={(e) => setNewImageName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveToLibrary()}
              autoFocus
            />
            <div className="dialog-actions">
              <button onClick={saveToLibrary} className="btn btn-primary save-confirm-btn">
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setNewImageName('')
                }}
                className="btn btn-secondary cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Preview */}
      <div className="preview-section">
        <h3>Preview</h3>
        <div className="preview-container">
          <div className="preview-actual-size">
            <span>Actual Size (16x16):</span>
            <img
              src={exportAsDataURL()}
              alt="16x16 preview"
              className="preview-image-small"
            />
          </div>
          <div className="preview-scaled">
            <span>Scaled (64x64):</span>
            <img
              src={exportAsDataURL()}
              alt="Scaled preview"
              className="preview-image-large"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageDesigner