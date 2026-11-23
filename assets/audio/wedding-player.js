/**
 * Royal Indian Wedding Music Engine
 * Supports:
 * 1. Audio stream / MP3 playback (if provided)
 * 2. Harmonic Web Audio synthesized Shehnai & Tanpura melody generator
 */
class RoyalWeddingAudio {
  constructor(audioSrc = '') {
    this.audioSrc = audioSrc;
    this.audioEl = null;
    this.isPlaying = false;
    this.ctx = null;
    this.synthInterval = null;
    this.isMuted = false;
    this.initAudioElement();
  }

  initAudioElement() {
    this.audioEl = new Audio();
    this.audioEl.loop = true;
    this.audioEl.preload = 'auto';
    // Auspicious copyright-free devotional flute/shehnai music link or local file
    // Uses fallback gracefully if network stream fails
    if (this.audioSrc) {
      this.audioEl.src = this.audioSrc;
    } else {
      // High quality soothing Indian classical bansuri / shehnai stream
      this.audioEl.src = "https://cdn.pixabay.com/download/audio/2022/05/16/audio_c8969966ef.mp3?filename=indian-meditation-ambient-flute-111867.mp3";
    }

    this.audioEl.addEventListener('error', () => {
      console.warn("External audio not reachable, switching to built-in Shehnai synthesizer.");
      this.audioEl = null;
    });
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.audioEl) {
      const promise = this.audioEl.play();
      if (promise !== undefined) {
        promise.catch(err => {
          console.log("Audio play error, falling back to Web Audio synth:", err);
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

  // Realistic Web Audio Synthesis for auspicious Raag Yaman / Wedding Shehnai tones
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
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Tanpura Drone (Sa & Pa)
    const saFreq = 146.83; // D3
    const paFreq = 220.00; // A3
    [saFreq, paFreq, saFreq * 2].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + idx * 80, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
    });

    // Shehnai Melody Notes (Raag Yaman notes: Sa Re Ga Ma# Pa Dha Ni Sa')
    // D4 scale: D, E, F#, G#, A, B, C#
    const ragaNotes = [
      293.66, // Sa (D4)
      329.63, // Re (E4)
      369.99, // Ga (F#4)
      415.30, // Ma# (Teevra Ma)
      440.00, // Pa (A4)
      493.88, // Dha (B4)
      554.37, // Ni (C#5)
      587.33  // Sa' (D5)
    ];

    const melodyPatterns = [
      [0, 1, 2, 4, 3, 2, 1, 0],
      [2, 3, 4, 6, 7, 6, 4, 2],
      [4, 6, 7, 6, 4, 3, 2, 0],
      [0, 2, 4, 7, 6, 4, 2, 0]
    ];

    let patternIdx = 0;
    let noteIdx = 0;

    const playShehnaiNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      const pattern = melodyPatterns[patternIdx];
      const freq = ragaNotes[pattern[noteIdx]];

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const shehnaiFilter = ctx.createBiquadFilter();

      // Shehnai characteristic double-reed harmonics (slight nasal & overtone)
      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq * 1.002, ctx.currentTime); // natural vibrato detune

      // Graceful meend (portamento slide)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.015, ctx.currentTime + 0.35);

      shehnaiFilter.type = 'bandpass';
      shehnaiFilter.frequency.setValueAtTime(freq * 2.2, ctx.currentTime);
      shehnaiFilter.Q.setValueAtTime(2.5, ctx.currentTime);

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(shehnaiFilter);
      osc2.connect(shehnaiFilter);
      shehnaiFilter.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.75);
      osc2.stop(now + 0.75);

      noteIdx++;
      if (noteIdx >= pattern.length) {
        noteIdx = 0;
        patternIdx = (patternIdx + 1) % melodyPatterns.length;
      }
    };

    this.synthInterval = setInterval(playShehnaiNote, 520);
  }

  stopIndianWeddingSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch(e){}
      this.ctx = null;
    }
  }
}

window.RoyalWeddingAudio = RoyalWeddingAudio;
