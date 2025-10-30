function InfoPage({ onClose, isDarkMode }) {
  return (
    <div className="info-overlay">
      <div className={`info-panel ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="info-header">
          <h1>Open Speech Builder</h1>
          <button onClick={onClose} className="close-btn" aria-label="Close info panel">
            ×
          </button>
        </div>

        <div className="info-content">
          <section className="info-section">
            <h2>What is this?</h2>
            <p>
              Open Speech Builder is a web-based Augmentative and Alternative Communication (AAC) soundboard designed to help people
              communicate using voice synthesis. It provides a simple, accessible interface with customizable buttons
              that speak words and phrases when pressed.
            </p>
          </section>

          <section className="info-section">
            <h2>Who is this for?</h2>
            <ul>
              <li><strong>Non-speaking individuals</strong> who need alternative ways to communicate</li>
              <li><strong>People with speech difficulties</strong> due to conditions like autism, cerebral palsy, or stroke</li>
              <li><strong>Language learners</strong> who want to practice pronunciation</li>
              <li><strong>Caregivers and therapists</strong> working with individuals who use AAC</li>
              <li><strong>Anyone</strong> who needs quick access to common phrases</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>How to use it</h2>
            <h3>Basic Usage</h3>
            <ul>
              <li><strong>Click or tap</strong> any colored pad to hear it speak</li>
              <li><strong>Use keyboard shortcuts</strong> - each pad has a key (1234/QWER/ASDF/ZXCV)</li>
              <li><strong>Adjust volume</strong> with the slider in the header</li>
              <li><strong>Load different configs</strong> using the "Load Config..." button</li>
            </ul>

            <h3>Admin Features</h3>
            <ul>
              <li><strong>Press Ctrl+Shift+A</strong> or click "Admin" to open the configuration editor</li>
              <li><strong>Edit the JSON</strong> directly to customize pads</li>
              <li><strong>Test voices</strong> and generate text-to-speech for all pads</li>
              <li><strong>Add new pads</strong> or modify existing ones</li>
              <li><strong>Export your config</strong> to save and share</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Configuration</h2>
            <p>
              The soundboard is completely customizable through JSON configuration files. Each pad can be configured with:
            </p>

            <h3>Pad Properties</h3>
            <ul>
              <li><strong>id</strong> - Unique identifier for the pad</li>
              <li><strong>label</strong> - Text displayed on the pad</li>
              <li><strong>sound</strong> - Either "tts:Text to speak" or path to audio file</li>
              <li><strong>color</strong> - Hex color code for the pad background</li>
              <li><strong>key</strong> - Keyboard shortcut (single character)</li>
              <li><strong>voice</strong> - Specific voice name for TTS (optional)</li>
            </ul>

            <h3>Example Configuration</h3>
            <pre className="code-block">{`{
  "title": "My Soundboard",
  "rows": 4,
  "cols": 4,
  "pads": [
    {
      "id": "hello-pad",
      "label": "Hello",
      "sound": "tts:Hello there, how are you?",
      "color": "#3b82f6",
      "key": "1"
    }
  ]
}`}</pre>
          </section>

          <section className="info-section">
            <h2>Text-to-Speech</h2>
            <p>
              This app uses your browser's built-in speech synthesis, which means:
            </p>
            <ul>
              <li><strong>Works offline</strong> - no internet connection required</li>
              <li><strong>Multiple voices</strong> - choose from available system voices</li>
              <li><strong>Instant playback</strong> - no loading or buffering</li>
              <li><strong>Customizable</strong> - different voices for different pads</li>
            </ul>

            <p>
              To use TTS, set the sound property to <code>"tts:Your text here"</code>. The app will speak
              the text instead of playing an audio file.
            </p>
          </section>

          <section className="info-section">
            <h2>Accessibility Features</h2>
            <ul>
              <li><strong>Keyboard navigation</strong> - Tab through pads, Enter/Space to activate</li>
              <li><strong>Screen reader support</strong> - Proper ARIA labels and announcements</li>
              <li><strong>High contrast</strong> - Clear visual design with good color contrast</li>
              <li><strong>Large touch targets</strong> - Easy to use on mobile devices</li>
              <li><strong>Reduced motion</strong> - Respects user's motion preferences</li>
              <li><strong>Focus indicators</strong> - Clear visual focus for keyboard users</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Getting Started</h2>
            <ol>
              <li><strong>Try the default soundboard</strong> - Click the pads to hear common phrases</li>
              <li><strong>Test different voices</strong> - Open Admin panel (Ctrl+Shift+A) and try voice options</li>
              <li><strong>Customize for your needs</strong> - Edit the JSON to add your own phrases and colors</li>
              <li><strong>Save your config</strong> - Export your customized soundboard to keep it</li>
              <li><strong>Share with others</strong> - Send your config file to caregivers or family</li>
            </ol>
          </section>

          <section className="info-section">
            <h2>Tips for Caregivers</h2>
            <ul>
              <li><strong>Start simple</strong> - Begin with basic needs like "yes", "no", "more", "help"</li>
              <li><strong>Use consistent colors</strong> - Same colors for similar concepts (green for "yes", red for "no")</li>
              <li><strong>Practice together</strong> - Help the user learn the keyboard shortcuts</li>
              <li><strong>Customize gradually</strong> - Add new phrases as the user becomes comfortable</li>
              <li><strong>Keep backups</strong> - Export and save working configurations</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Technical Requirements</h2>
            <ul>
              <li><strong>Modern web browser</strong> - Chrome, Firefox, Safari, or Edge</li>
              <li><strong>JavaScript enabled</strong> - Required for app functionality</li>
              <li><strong>Audio support</strong> - For text-to-speech playback</li>
              <li><strong>No installation</strong> - Runs directly in your browser</li>
              <li><strong>Works offline</strong> - Once loaded, no internet needed for TTS</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Privacy & Security</h2>
            <ul>
              <li><strong>No data collection</strong> - Your configurations stay on your device</li>
              <li><strong>No server communication</strong> - Everything runs locally in your browser</li>
              <li><strong>No account required</strong> - Use immediately without signing up</li>
              <li><strong>Open source</strong> - Code is transparent and auditable</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export default InfoPage