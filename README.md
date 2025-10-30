# Open Speech Builder - AAC Soundboard

A simple, accessible web-based AAC (Augmentative and Alternative Communication) soundboard with configurable pads, text-to-speech, and keyboard shortcuts.

## Features

- 4×4 grid of customizable sound pads
- JSON-based configuration
- **Admin panel for live editing** (Ctrl+Shift+A or Admin button)
- **Text-to-Speech support** (works offline with browser voices)
- Keyboard shortcuts (1234/QWER/ASDF/ZXCV mapping)
- Global volume control with persistence
- Load custom configs via file picker or URL parameter
- Responsive design for mobile and desktop
- Accessibility features (screen reader support, keyboard navigation)
- Visual feedback on pad activation

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the displayed URL (usually http://localhost:5173)

4. Try the demo configs:
   - `?config=/config/demo.json` (embedded audio, no external files needed)
   - `?config=/config/tts-demo.json` (text-to-speech demo)

## Configuration

### Default Config
The app loads `/public/config/soundboard.json` by default.

### Demo Config
Try `/config/demo.json` for a working example with embedded audio (no external assets required).

### Custom Config
- **URL Parameter**: `?config=https://example.com/my-config.json` or `?config=/config/demo.json`
- **File Upload**: Use the "Load Config..." button to upload a local JSON file

### JSON Schema

```json
{
  "title": "Open Speech Builder",
  "rows": 4,
  "cols": 4,
  "pads": [
    {
      "id": "unique-pad-id",
      "label": "Display Name",
      "image": "/path/to/image.png",
      "sound": "/path/to/audio.mp3",
      "color": "#hexcolor",
      "key": "keyboard-key"
    }
  ]
}
```

### Field Descriptions
- `title`: Soundboard title displayed in header
- `rows`: Number of grid rows (1-10)
- `cols`: Number of grid columns (1-10)
- `pads`: Array of pad configurations (max: rows × cols)
  - `id`: Unique identifier for the pad
  - `label`: Text displayed on the pad
  - `image`: Path to pad image (optional)
  - `sound`: Path to audio file (required for functional pad)
  - `color`: Background color (hex format)
  - `key`: Keyboard shortcut (single character)

## Keyboard Shortcuts

Default mapping for 4×4 grid:
```
1 2 3 4
Q W E R  
A S D F
Z X C V
```

Custom keys can be set in the config file using the `key` property.

## Audio Requirements

- Supported formats: MP3, WAV, OGG (browser-dependent)
- Files should be optimized for web (small file size)
- Audio autoplay requires user interaction on mobile devices

## Assets

Place your audio and image files in `/public/assets/` or any publicly accessible directory. Update the config file paths accordingly.

Example structure:
```
public/
  assets/
    yes.mp3
    yes.png
    no.mp3
    no.png
    ...
  config/
    soundboard.json
```

## Accessibility Features

- All pads are keyboard navigable
- Screen reader announcements for pad activation
- High contrast design
- Focus indicators
- Respects `prefers-reduced-motion`
- ARIA labels and live regions

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Mobile browsers supported with touch interaction.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Troubleshooting

### Audio Not Playing
- Ensure audio files are accessible and in supported formats
- Check browser console for loading errors
- On mobile, user interaction is required before audio can play

### Config Not Loading
- Verify JSON syntax is valid
- Check file paths are correct and accessible
- Ensure CORS headers allow loading external configs

### Performance Issues
- Optimize audio file sizes
- Use appropriate image formats and sizes
- Limit the number of simultaneous audio streams
## Admin
 Panel

### Accessing Admin Mode
- Click the "Admin" button in the header
- Or use keyboard shortcut: **Ctrl+Shift+A**

### Admin Features

#### Text-to-Speech Configuration
- **Voice Selection**: Choose from available browser voices
- **Test Voice**: Preview selected voice with custom text
- **Generate TTS for All Pads**: Automatically convert all pad labels to TTS sounds
- **Offline Support**: Uses browser's built-in speech synthesis (no internet required)

#### Configuration Editor
- **Live JSON Editor**: Edit the soundboard configuration in real-time
- **Add New Pad**: Quickly add new pads to the configuration
- **Export Config**: Download the current configuration as a JSON file
- **Apply Changes**: Update the soundboard without page reload

### TTS Sound Format
To use text-to-speech for a pad, set the sound property to:
```json
{
  "sound": "tts:Text to speak",
  "voice": "Voice Name (optional)"
}
```

Example:
```json
{
  "id": "hello-pad",
  "label": "Hello",
  "sound": "tts:Hello there, how are you?",
  "voice": "Microsoft Zira - English (United States)",
  "color": "#16a34a",
  "key": "h"
}
```

### Voice Configuration
- Voices are automatically detected from the browser
- Prefers English voices when available
- Voice selection persists in the configuration
- Works offline (no internet connection required)

## Demo Configurations

### Standard Demo (`/config/demo.json`)
- Uses embedded audio data
- No external files required
- 4 basic sound pads

### TTS Demo (`/config/tts-demo.json`)
- Uses text-to-speech for all sounds
- 12 common AAC phrases
- Demonstrates voice synthesis capabilities
- Perfect for testing offline functionality