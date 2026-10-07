/**
 * Aura Music — Web Audio Synthesizer & Canvas Visualizer Engine
 * Generates procedural ambient chillout audio chords & provides frequency data
 * for real-time reactive visualizers without requiring any external audio files.
 */

class AuraAudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.isPlaying = false;
    this.timerId = null;
    this.step = 0;
    this.currentTrack = 'Neon Horizon';
    this.listeners = [];

    // Synthesizer Chords (Aura Ambient Scales)
    this.tracks = {
      'Neon Horizon': {
        scale: [220.00, 261.63, 329.63, 392.00, 440.00, 523.25], // A minor pentatonic / ambient
        bpm: 72,
        mood: 'Ethereal Cyberpunk'
      },
      'Astral Waves': {
        scale: [174.61, 220.00, 261.63, 329.63, 349.23, 440.00], // F Major 7 / dream
        bpm: 64,
        mood: 'Cosmic Ambient'
      },
      'Midnight Velocity': {
        scale: [196.00, 233.08, 293.66, 349.23, 392.00, 466.16], // G minor / chillwave
        bpm: 80,
        mood: 'Lo-Fi Chillwave'
      }
    };
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.82;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  play() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.scheduleNotes();
    this.notifyStateChange();
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notifyStateChange();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  setTrack(trackName) {
    if (this.tracks[trackName]) {
      this.currentTrack = trackName;
      this.step = 0;
    }
  }

  scheduleNotes() {
    if (!this.isPlaying) return;

    const track = this.tracks[this.currentTrack];
    const scale = track.scale;
    const now = this.ctx.currentTime;

    // Trigger subtle sub-bass pad
    if (this.step % 4 === 0) {
      const rootFreq = scale[0] / 2;
      this.triggerBass(rootFreq, 2.5);
    }

    // Trigger ambient melody note
    const noteIdx = (this.step * 2 + (this.step % 3)) % scale.length;
    const noteFreq = scale[noteIdx];
    this.triggerChime(noteFreq, 1.4);

    // Sparkle harmony
    if (this.step % 2 === 1) {
      const sparkleFreq = scale[(noteIdx + 3) % scale.length] * 2;
      this.triggerChime(sparkleFreq, 0.9, 0.15);
    }

    this.step++;
    const intervalMs = (60 / track.bpm) * 1000 * 0.5; // sixteenth-like groove
    this.timerId = setTimeout(() => this.scheduleNotes(), intervalMs);
  }

  triggerBass(freq, duration) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  triggerChime(freq, duration, volume = 0.22) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  getFrequencyData() {
    if (!this.analyser) {
      return new Uint8Array(64).fill(0);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  onStateChange(cb) {
    this.listeners.push(cb);
  }

  notifyStateChange() {
    this.listeners.forEach(cb => cb(this.isPlaying, this.currentTrack));
  }
}

// Global Export
window.AuraAudioEngine = AuraAudioEngine;
