/**
 * Wedding Music Engine
 * Plays the Kudmayi wedding song on an infinite loop throughout the invitation.
 * Never stops on scrolling; continues looping until user pauses or closes the tab.
 */
class RoyalWeddingAudio {
  constructor(audioSrc = 'assets/audio/wedding_song.mp3') {
    this.audioSrc = audioSrc;
    this.fallbackSrc = 'assets/audio/wedding_melody.wav';
    this.audioEl = null;
    this.isPlaying = false;
    this.initAudioElement();
  }

  initAudioElement() {
    this.audioEl = new Audio(this.audioSrc);
    this.audioEl.loop = true; // Infinite repeat
    this.audioEl.preload = 'auto';

    // If Kudmayi mp3 fails, fallback to wedding_melody.wav
    this.audioEl.addEventListener('error', () => {
      console.warn("Primary audio not loaded, switching to fallback melody.");
      if (this.audioEl.src !== this.fallbackSrc) {
        this.audioEl.src = this.fallbackSrc;
        this.audioEl.load();
        if (this.isPlaying) this.audioEl.play().catch(e => console.log(e));
      }
    });

    // Ensure audio loops without stopping
    this.audioEl.addEventListener('ended', () => {
      if (this.isPlaying) {
        this.audioEl.currentTime = 0;
        this.audioEl.play().catch(e => console.log(e));
      }
    });
  }

  play() {
    this.isPlaying = true;
    if (this.audioEl) {
      this.audioEl.volume = 0.9;
      const promise = this.audioEl.play();
      if (promise !== undefined) {
        promise.catch(err => {
          console.log("Autoplay waiting for user touch gesture:", err);
          // Unlock on first touch/interaction anywhere on window
          const unlockAudio = () => {
            if (this.isPlaying) {
              this.audioEl.play().catch(e => console.log(e));
            }
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('scroll', unlockAudio);
          };
          window.addEventListener('click', unlockAudio, { once: true });
          window.addEventListener('touchstart', unlockAudio, { once: true });
          window.addEventListener('scroll', unlockAudio, { once: true });
        });
      }
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }
}

window.RoyalWeddingAudio = RoyalWeddingAudio;
