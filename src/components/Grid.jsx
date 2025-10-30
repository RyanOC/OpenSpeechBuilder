import Pad from './Pad'

function Grid({ config, onPadPlay }) {
  const { rows = 4, cols = 4, pads = [] } = config

  // Create a 16-slot grid, filling missing pads with placeholders
  const gridPads = Array.from({ length: rows * cols }, (_, index) => {
    const pad = pads[index]
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
      {gridPads.map((pad, index) => (
        <Pad
          key={pad.id}
          pad={pad}
          onPlay={onPadPlay}
          gridPosition={index + 1}
        />
      ))}
    </div>
  )
}

export default Grid