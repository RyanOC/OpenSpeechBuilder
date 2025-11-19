function InfoPage({ onClose, isDarkMode }) {
  return (
    <div className="info-overlay">
      <div className={`info-panel ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="info-header">
          <h1>Open Speech Builder</h1>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm close-btn" aria-label="Close info panel">
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
            <h2>Two Communication Modes</h2>
            <p>Open Speech Builder offers two different ways to communicate:</p>
            
            <h3>🔊 Soundboard</h3>
            <ul>
              <li><strong>Quick communication</strong> - Pre-configured buttons for common phrases</li>
              <li><strong>Keyboard shortcuts</strong> - Each button has a key (1234/QWER/ASDF/ZXCV)</li>
              <li><strong>Customizable layout</strong> - Edit buttons, colors, and sounds</li>
              <li><strong>Display order</strong> - Arrange buttons in your preferred sequence</li>
            </ul>

            <h3>📝 Sentence Builder</h3>
            <ul>
              <li><strong>Word-by-word</strong> - Build sentences by selecting individual words</li>
              <li><strong>Category organization</strong> - Words grouped by type (People, Actions, Things, etc.)</li>
              <li><strong>Custom vocabulary</strong> - Add your own words to any category</li>
              <li><strong>Sentence history</strong> - Your last sentence is saved automatically</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>How to use it</h2>
            <h3>Basic Usage</h3>
            <ul>
              <li><strong>Switch views</strong> - Use the toggle button (🔊📝) to change modes</li>
              <li><strong>Click or tap</strong> any button to hear it speak</li>
              <li><strong>Adjust volume</strong> with the slider in the menu (hamburger button)</li>
              <li><strong>Change theme</strong> - Toggle between dark and light mode</li>
              <li><strong>Select voice</strong> - Choose from available system voices in menu</li>
            </ul>

            <h3>Edit Mode Features</h3>
            <ul>
              <li><strong>Enable edit mode</strong> - Click the ✏️ button to customize buttons</li>
              <li><strong>Configure buttons</strong> - Click any button to edit label, color, and sound</li>
              <li><strong>Set display order</strong> - Use order numbers to arrange buttons</li>
              <li><strong>Move between categories</strong> - Change which category a word belongs to</li>
              <li><strong>Customize categories</strong> - Edit category names, colors, and icons</li>
            </ul>

            <h3>Admin Features</h3>
            <ul>
              <li><strong>Open Admin panel</strong> - Click "Admin" in the menu</li>
              <li><strong>Edit JSON directly</strong> - Advanced configuration editing</li>
              <li><strong>Test voices</strong> - Try different text-to-speech voices</li>
              <li><strong>Export/Import configs</strong> - Save and share your setups</li>
              <li><strong>Reset settings</strong> - Return to defaults if needed</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Button Configuration</h2>
            <p>
              Every button can be fully customized through the edit interface or JSON configuration:
            </p>

            <h3>Button Properties</h3>
            <ul>
              <li><strong>label</strong> - Text displayed on the button</li>
              <li><strong>sound</strong> - Text to speak (or URL to audio file)</li>
              <li><strong>color</strong> - Hex color code for the button background</li>
              <li><strong>key</strong> - Keyboard shortcut (single character)</li>

              <li><strong>order</strong> - Display order number (1, 2, 3...) for custom sorting</li>
              <li><strong>category</strong> - Which category the word belongs to (Sentence Builder only)</li>
            </ul>

            <h3>Display Order</h3>
            <p>
              Use the order field to control button arrangement:
            </p>
            <ul>
              <li><strong>Numbered buttons</strong> appear first, sorted by order (1, 2, 3...)</li>
              <li><strong>Unnumbered buttons</strong> appear after, in their original positions</li>
              <li><strong>Gaps are fine</strong> - You can use 1, 5, 10 to leave room for future buttons</li>
            </ul>

            <h3>Example Configuration</h3>
            <pre className="code-block">{`{
  "title": "My Soundboard",
  "rows": 4,
  "cols": 4,
  "pads": [
    {
      "id": "hello-pad",
      "label": "😊 Hello",
      "sound": "Hello there, how are you?",
      "color": "#3b82f6",
      "key": "1",
      "order": "1"
    }
  ]
}`}</pre>
          </section>

          <section className="info-section">
            <h2>Sentence Builder Features</h2>
            <p>
              The Sentence Builder helps you construct complete sentences word by word:
            </p>

            <h3>Word Categories</h3>
            <ul>
              <li><strong>⭐ Favorites</strong> - Most commonly used words</li>
              <li><strong>🔗 Helper Words</strong> - Connecting words (am, is, are, the, etc.)</li>
              <li><strong>👥 People</strong> - Pronouns and family members</li>
              <li><strong>🏃 Actions</strong> - Verbs and action words</li>
              <li><strong>📦 Things</strong> - Nouns and objects</li>
              <li><strong>🏠 Places</strong> - Locations and directions</li>
              <li><strong>😊 Feelings</strong> - Emotions and descriptive words</li>
            </ul>

            <h3>Custom Vocabulary</h3>
            <ul>
              <li><strong>Add new words</strong> - Click the "+" button in any category</li>
              <li><strong>Edit existing words</strong> - Customize pronunciation and color</li>
              <li><strong>Move words</strong> - Change which category a word belongs to</li>
              <li><strong>Colorful variety</strong> - Each word gets a unique color automatically</li>
            </ul>

            <h3>Category Customization</h3>
            <ul>
              <li><strong>Edit category tabs</strong> - Change names, colors, and icons</li>
              <li><strong>Custom icons</strong> - Use emojis to personalize categories</li>
              <li><strong>Personalized organization</strong> - Adapt categories to your needs</li>
            </ul>
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
              Simply set the sound property to the text you want spoken. The app automatically uses text-to-speech.
              If you need to use an audio file instead, provide a full URL (e.g., <code>"https://..."</code>).
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
              <li><strong>Choose your mode</strong> - Start with Soundboard for quick phrases or Sentence Builder for custom sentences</li>
              <li><strong>Try the defaults</strong> - Click buttons to hear how text-to-speech works</li>
              <li><strong>Customize your experience</strong> - Change voice and volume in the menu (hamburger button)</li>
              <li><strong>Enter edit mode</strong> - Click the ✏️ button to start customizing buttons</li>
              <li><strong>Add personal content</strong> - Create buttons with your own words and phrases</li>
              <li><strong>Use emojis</strong> - Add visual symbols to make buttons more recognizable</li>
              <li><strong>Organize with order</strong> - Use display order numbers to arrange buttons logically</li>
              <li><strong>Export your setup</strong> - Save your customized configuration to keep it safe</li>
            </ol>
          </section>

          <section className="info-section">
            <h2>Tips for Caregivers</h2>
            <ul>
              <li><strong>Start with Soundboard</strong> - Begin with pre-made phrases for immediate communication</li>
              <li><strong>Progress to Sentence Builder</strong> - Introduce word-by-word construction as skills develop</li>
              <li><strong>Use visual cues</strong> - Add emojis to buttons for better recognition</li>
              <li><strong>Organize logically</strong> - Use display order to put most important buttons first</li>
              <li><strong>Personalize vocabulary</strong> - Add family names, favorite foods, and personal interests</li>
              <li><strong>Consistent colors</strong> - Use similar colors for related concepts</li>
              <li><strong>Practice together</strong> - Help the user learn button locations and shortcuts</li>
              <li><strong>Regular backups</strong> - Export configurations frequently to prevent loss</li>
              <li><strong>Adapt categories</strong> - Customize Sentence Builder categories for individual needs</li>
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