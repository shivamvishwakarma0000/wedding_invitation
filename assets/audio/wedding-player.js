/**
 * Wedding Music Engine
 * Plays the Kudmayi wedding song on infinite loop throughout the invitation.
 * Never stops on scrolling; continues looping until user closes the tab.
 */
class RoyalWeddingAudio {
  constructor(audioSrc = 'assets/audio/wedding_song.mp3') {
    this.audioSrc = audioSrc;
    this.fallbackSrc = 'assets/audio/wedding_melody.wav';
    this.audioEl = document.createElement('audio');
    this.audioEl.src = this.audioSrc;
    this.audioEl.loop = true;
    this.audioEl.preload = 'auto';
    this.audioEl.playsInline = true;
    this.audioEl.setAttribute('playsinline', '');
    this.audioEl.setAttribute('webkit-playsinline', '');
    this.audioEl.volume = 1.0;
    
    // Attach to DOM so WebKit never garbage-collects or throttles audio
    document.body.appendChild(this.audioEl);

    // Fallback if MP3 codec unavailable
    this.audioEl.addEventListener('error', () => {
      console.warn("Primary audio failed, switching to fallback melody.");
      if (this.audioEl.src !== this.fallbackSrc) {
        this.audioEl.src = this.fallbackSrc;
        this.audioEl.load();
        if (this.isPlaying) this.audioEl.play().catch(() => {});
      }
    });

    this.isPlaying = false;
  }

  play() {
    this.isPlaying = true;
    const p = this.audioEl.play();
    if (p !== undefined) {
      p.catch(() => {
        // Fallback: unlock on next user touch gesture anywhere
        const unlock = () => {
          if (this.isPlaying) {
            this.audioEl.play().catch(() => {});
          }
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('touchend', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('touchend', unlock, { once: true });
      });
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
