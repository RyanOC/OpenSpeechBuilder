import { useRef, useCallback } from 'react'

export function useAudioPool() {
  const audioPool = useRef(new Map())
  const globalVolume = useRef(0.7)

  const setGlobalVolume = useCallback((volume) => {
    globalVolume.current = volume
    // Update volume for all existing audio elements
    audioPool.current.forEach(audio => {
      audio.volume = volume
    })
  }, [])

  const getOrCreateAudio = useCallback((padId, soundUrl) => {
    if (audioPool.current.has(padId)) {
      return audioPool.current.get(padId)
    }

    const audio = new Audio(soundUrl)
    audio.volume = globalVolume.current
    audio.preload = 'auto'
    
    // Handle audio loading errors
    audio.addEventListener('error', (e) => {
      console.error(`Failed to load audio for pad ${padId}:`, e)
    })

    audioPool.current.set(padId, audio)
    return audio
  }, [])

  const playTTS = useCallback(async (text, voiceName = null) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Text-to-speech not supported in this browser'))
        return
      }

      // Stop any ongoing speech gracefully
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
        // Small delay to ensure cancellation is processed
        setTimeout(() => startSpeech(), 50)
      } else {
        startSpeech()
      }

      function startSpeech() {
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Set voice if specified
        if (voiceName) {
          const voices = speechSynthesis.getVoices()
          const voice = voices.find(v => v.name === voiceName)
          if (voice) {
            utterance.voice = voice
          }
        }
        
        // Configure speech parameters
        utterance.rate = 1
        utterance.pitch = 1
        utterance.volume = globalVolume.current
        
        let hasEnded = false
        
        utterance.onend = () => {
          if (!hasEnded) {
            hasEnded = true
            resolve()
          }
        }
        
        utterance.onerror = (event) => {
          if (!hasEnded) {
            hasEnded = true
            // Don't reject on 'interrupted' errors as they're expected when canceling
            if (event.error === 'interrupted' || event.error === 'canceled') {
              resolve()
            } else {
              reject(new Error(`TTS error: ${event.error}`))
            }
          }
        }
        
        // Announce to screen readers
        const announcer = document.getElementById('pad-announcer')
        if (announcer) {
          announcer.textContent = `Speaking: ${text}`
        }
        
        try {
          speechSynthesis.speak(utterance)
        } catch (error) {
          if (!hasEnded) {
            hasEnded = true
            reject(new Error(`TTS failed to start: ${error.message}`))
          }
        }
      }
    })
  }, [])

  const playPad = useCallback(async (padId, soundUrl, voiceName = null) => {
    try {
      // Skip if no sound URL
      if (!soundUrl || soundUrl === null) {
        throw new Error('No sound configured for this pad')
      }
      
      // Check if this is a TTS sound (with or without tts: prefix)
      // If it doesn't look like a URL, treat it as TTS text
      const isTTS = soundUrl.startsWith('tts:') || !soundUrl.match(/^https?:\/\/|^\/|^\.\//i)
      
      if (isTTS) {
        const text = soundUrl.startsWith('tts:') ? soundUrl.replace('tts:', '') : soundUrl
        return playTTS(text, voiceName)
      }
      const audio = getOrCreateAudio(padId, soundUrl)
      
      // Reset to beginning and play
      audio.currentTime = 0
      
      // Handle autoplay policy - try to play, catch if blocked
      const playPromise = audio.play()
      
      if (playPromise !== undefined) {
        await playPromise
      }
      
      // Announce to screen readers
      const announcer = document.getElementById('pad-announcer')
      if (announcer) {
        announcer.textContent = `Playing ${padId}`
      }
      
    } catch (error) {
      console.error('playPad error:', error)
      // Handle autoplay blocking or other play errors
      if (error.name === 'NotAllowedError') {
        throw new Error('Audio playback blocked. Please interact with the page first.')
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Audio format not supported')
      } else if (error.message && error.message.includes('TTS error: interrupted')) {
        // Don't throw errors for interrupted TTS - this is normal when switching between pads
        console.log('TTS interrupted, this is normal')
        return
      } else {
        throw new Error(`Playback failed: ${error.message}`)
      }
    }
  }, [getOrCreateAudio, playTTS])

  const preloadAudio = useCallback((pads) => {
    pads.forEach(pad => {
      if (pad && pad.sound) {
        getOrCreateAudio(pad.id, pad.sound)
      }
    })
  }, [getOrCreateAudio])

  return {
    playPad,
    setGlobalVolume,
    preloadAudio
  }
}