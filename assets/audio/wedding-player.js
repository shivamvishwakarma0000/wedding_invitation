/**
 * Royal Indian Wedding Music Engine
 * Uses local acoustic wedding melody WAV with smooth fade-in, looping, and Web Audio fallback
 */
class RoyalWeddingAudio {
  constructor(audioSrc = 'assets/audio/wedding_melody.wav') {
    this.audioSrc = audioSrc;
    this.audioEl = null;
    this.isPlaying = false;
    this.ctx = null;
    this.synthInterval = null;
    this.initAudioElement();
  }

  initAudioElement() {
    this.audioEl = new Audio(this.audioSrc);
    this.audioEl.loop = true;
    this.audioEl.preload = 'auto';

    this.audioEl.addEventListener('error', () => {
      console.warn("Local audio could not load, using built-in Shehnai synthesizer.");
      this.audioEl = null;
    });
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.audioEl) {
      this.audioEl.volume = 0.85;
      const promise = this.audioEl.play();
      if (promise !== undefined) {
        promise.catch(err => {
          console.log("Audio autoplay prevented, using synth fallback on click:", err);
          this.startIndianWeddingSynth();
        });
      }
    } else {
      this.startIndianWeddingSynth();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.stopIndianWeddingSynth();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  startIndianWeddingSynth() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      return;
    }

    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Tanpura Drone (Sa, Pa)
    [146.83, 220.00, 293.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + idx * 70, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
    });

    const ragaNotes = [293.66, 329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 587.33];
    const melody = [0, 2, 4, 3, 2, 1, 0, 2, 4, 6, 7, 6, 4, 2];
    let noteIdx = 0;

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const freq = ragaNotes[melody[noteIdx]];
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, ctx.currentTime + 0.3);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 2, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.7);

      noteIdx = (noteIdx + 1) % melody.length;
    }, 450);
  }

  stopIndianWeddingSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch(e){}
      this.ctx = null;
    }
  }
}

window.RoyalWeddingAudio = RoyalWeddingAudio;
