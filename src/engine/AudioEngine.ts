/**
 * Web Audio API synthesized Cyberpunk Lunar Rave sound engine.
 * Generates dynamic 128 BPM electronic music & SFX with zero external audio files.
 * Provides audio-reactive beat triggers for DJ, speakers, lights, and crowd bouncing.
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private tempo: number = 128; // 128 BPM
  private beatInterval: number = 60 / 128; // ~0.46875s per beat
  private nextNoteTime: number = 0;
  private step: number = 0;
  private timerId: number | null = null;
  
  // Audio reactive values
  public beatPhase: number = 0; // 0 to 1 within current beat
  public isKick: boolean = false;
  public kickIntensity: number = 0;
  public bassIntensity: number = 0;
  public masterVolume: number = 0.5;

  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public start() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.step = 0;
    this.scheduleLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public update(deltaSeconds: number) {
    if (!this.isPlaying || !this.ctx) {
      // Fallback virtual beat pulse so visuals still dance in silence!
      const virtualTime = performance.now() / 1000;
      this.beatPhase = (virtualTime / this.beatInterval) % 1.0;
      this.kickIntensity = Math.max(0, this.kickIntensity - deltaSeconds * 4);
      if (this.beatPhase < 0.15) {
        this.kickIntensity = Math.max(this.kickIntensity, 1.0 - (this.beatPhase / 0.15));
      }
      return;
    }

    const curTime = this.ctx.currentTime;
    const progress = (curTime / this.beatInterval) % 1.0;
    this.beatPhase = progress;

    // Decay intensities
    this.kickIntensity = Math.max(0, this.kickIntensity - deltaSeconds * 3.5);
    this.bassIntensity = Math.max(0, this.bassIntensity - deltaSeconds * 2.8);
  }

  private scheduleLoop = () => {
    if (!this.isPlaying || !this.ctx) return;

    const lookahead = 0.1;
    const stepTime = this.beatInterval / 4; // 16th notes

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this.playStep(this.step, this.nextNoteTime);
      this.step = (this.step + 1) % 16;
      this.nextNoteTime += stepTime;
    }

    this.timerId = window.setTimeout(this.scheduleLoop, 25);
  };

  private playStep(step: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    // 1. Kick on steps 0, 4, 8, 12 (four-on-the-floor)
    if (step % 4 === 0) {
      this.playKick(time);
      // Trigger reactive visual flag
      setTimeout(() => {
        this.kickIntensity = 1.0;
        this.isKick = true;
      }, Math.max(0, (time - this.ctx!.currentTime) * 1000));
    }

    // 2. Offbeat Hi-Hats on steps 2, 6, 10, 14
    if (step % 4 === 2) {
      this.playHiHat(time, 0.15);
    } else if (step % 2 === 1) {
      this.playHiHat(time, 0.05); // subtle 16th shaker
    }

    // 3. Cyber Bassline (arpeggiated 16th notes)
    const bassNotes = [36, 36, 48, 36, 39, 36, 43, 36, 34, 34, 46, 34, 41, 39, 38, 36]; // MIDI notes
    const midi = bassNotes[step];
    this.playBass(time, this.midiToFreq(midi));

    // 4. Cosmic Synth Arpeggio on rave peaks
    if (step % 2 === 0) {
      const arpNotes = [60, 63, 67, 72, 70, 67, 65, 63];
      const arpIndex = (step / 2) % arpNotes.length;
      this.playCosmicLead(time, this.midiToFreq(arpNotes[arpIndex]));
    }
  }

  private playKick(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playHiHat(time: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    // Synthesize metallic noise
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  private playBass(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.12);
    filter.Q.setValueAtTime(4, time);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playCosmicLead(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  // SFX for Gifts
  public playGiftSFX(tier: 'small' | 'medium' | 'big') {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (tier === 'small') {
      // Gentle cosmic twinkle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (tier === 'medium') {
      // Cosmic laser riser + swoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (tier === 'big') {
      // Supernova space impact: deep sub drop + bright cosmic laser
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(220, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 0.8);
      subGain.gain.setValueAtTime(0.8, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 1.25);

      const laser = this.ctx.createOscillator();
      const laserGain = this.ctx.createGain();
      laser.type = 'sawtooth';
      laser.frequency.setValueAtTime(1600, now);
      laser.frequency.exponentialRampToValueAtTime(180, now + 0.6);
      laserGain.gain.setValueAtTime(0.4, now);
      laserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      laser.connect(laserGain);
      laserGain.connect(this.masterGain);
      laser.start(now);
      laser.stop(now + 0.75);
    }
  }

  private midiToFreq(m: number): number {
    return 440 * Math.pow(2, (m - 69) / 12);
  }
}

export const soundEngine = new AudioEngine();
