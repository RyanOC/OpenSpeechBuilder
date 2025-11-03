import Pad from './Pad'

function Grid({ config, onPadPlay, isEditMode, onPadEdit }) {
  const { rows = 4, cols = 4, pads = [] } = config

  // Sort pads: those with order values first (sorted by order), then others in original order
  const sortedPads = [...pads].sort((a, b) => {
    const aOrder = a.order ? parseInt(a.order) : null
    const bOrder = b.order ? parseInt(b.order) : null
    
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

  // Create a 16-slot grid, filling missing pads with placeholders
  const gridPads = Array.from({ length: rows * cols }, (_, index) => {
    const pad = sortedPads[index]
    return pad || {
      id: `empty-${index}`,
      label: '',
      image: null,
      sound: null,
      color: '#2a2a2a',
      key: null
    }
  })

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
      role="grid"
      aria-label={`${rows} by ${cols} soundboard grid`}
    >
      {gridPads.map((pad, index) => {
        // Find the original index of this pad in the unsorted pads array
        const originalIndex = pad.id.startsWith('empty-') ? index : pads.findIndex(p => p.id === pad.id)
        
        return (
          <Pad
            key={pad.id}
            pad={pad}
            onPlay={onPadPlay}
            onEdit={() => onPadEdit(originalIndex)}
            isEditMode={isEditMode}
            gridPosition={index + 1}
          />
        )
      })}
    </div>
  )
}

export default Grid