export async function loadConfig(configUrl) {
  try {
    const response = await fetch(configUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const config = await response.json()
    
    // Validate config structure
    if (!config || typeof config !== 'object') {
      throw new Error('Config must be a valid JSON object')
    }
    
    // Set defaults
    const validatedConfig = {
      title: config.title || 'React Soundboard',
      rows: config.rows || 4,
      cols: config.cols || 4,
      pads: config.pads || []
    }
    
    // Validate rows and cols
    if (validatedConfig.rows < 1 || validatedConfig.rows > 10) {
      throw new Error('Rows must be between 1 and 10')
    }
    
    if (validatedConfig.cols < 1 || validatedConfig.cols > 10) {
      throw new Error('Columns must be between 1 and 10')
    }
    
    // Validate pads array
    if (!Array.isArray(validatedConfig.pads)) {
      throw new Error('Pads must be an array')
    }
    
    // Validate individual pads
    validatedConfig.pads = validatedConfig.pads.map((pad, index) => {
      if (!pad || typeof pad !== 'object') {
        return null
      }
      
      return {
        id: pad.id || `pad-${index}`,
        label: pad.label || '',
        image: pad.image || null,
        sound: pad.sound || null,
        color: pad.color || '#2a2a2a',
        key: pad.key || null
      }
    }).filter(Boolean) // Remove null pads
    
    // Ensure we don't exceed grid size
    const maxPads = validatedConfig.rows * validatedConfig.cols
    if (validatedConfig.pads.length > maxPads) {
      console.warn(`Config has ${validatedConfig.pads.length} pads but grid only supports ${maxPads}. Extra pads will be ignored.`)
      validatedConfig.pads = validatedConfig.pads.slice(0, maxPads)
    }
    
    return validatedConfig
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Failed to fetch config from ${configUrl}. Check the URL and network connection.`)
    }
    throw error
  }
}