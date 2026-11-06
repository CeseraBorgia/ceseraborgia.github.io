import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: number;
  alpha: number;
  decay: number;
  gravity?: number;
  scale?: number;
  type?: 'spark' | 'dust' | 'flame' | 'star' | 'heart' | 'ring';
  rotation?: number;
  vRot?: number;
  targetRadius?: number;
  currentRadius?: number;
}

export interface SpaceLaser {
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  duration: number; // seconds
  color: number;
  textBanner: Text;
  beamGlow: Graphics;
}

export class ParticleSystem {
  public container: Container;
  private particleGraphics: Graphics;
  private shockwaveGraphics: Graphics;
  private laserContainer: Container;
  private particles: Particle[] = [];
  private shockwaves: Particle[] = [];
  private activeLasers: SpaceLaser[] = [];

  // Screen shake offset
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;
  private shakeIntensity: number = 0;

  constructor() {
    this.container = new Container();
    this.container.label = 'ParticleSystemContainer';

    this.shockwaveGraphics = new Graphics();
    this.shockwaveGraphics.label = 'ShockwaveGraphics';
    this.container.addChild(this.shockwaveGraphics);

    this.particleGraphics = new Graphics();
    this.particleGraphics.label = 'ParticleGraphics';
    this.container.addChild(this.particleGraphics);

    this.laserContainer = new Container();
    this.laserContainer.label = 'LaserContainer';
    this.container.addChild(this.laserContainer);

    // Initial ambient lunar dust
    this.initAmbientDust();
  }

  private initAmbientDust() {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * 1080,
        y: Math.random() * 1920,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        radius: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? 0x00f0ff : 0xff00bb,
        alpha: 0.15 + Math.random() * 0.4,
        decay: 0.001,
        type: 'dust'
      });
    }
  }

  public update(dt: number) {
    // 1. Screen shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 30);
      this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // 2. Draw ambient & burst particles
    this.particleGraphics.clear();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      if (p.type === 'dust') {
        // Recycle dust at bottom if it floats off top
        if (p.y < 0) {
          p.y = 1920;
          p.x = Math.random() * 1080;
        }
      } else {
        p.alpha -= p.decay * dt * 60;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      }

      // Draw particle
      this.particleGraphics
        .circle(p.x, p.y, Math.max(0.5, p.radius))
        .fill({ color: p.color, alpha: Math.min(1, Math.max(0, p.alpha)) });
    }

    // 3. Draw shockwave rings
    this.shockwaveGraphics.clear();
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const ring = this.shockwaves[i];
      ring.currentRadius = (ring.currentRadius || 0) + (ring.vx || 3);
      ring.alpha -= ring.decay * dt * 60;

      if (ring.alpha <= 0 || (ring.targetRadius && ring.currentRadius >= ring.targetRadius)) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      // Elliptical perspective ring for the lunar ground
      this.shockwaveGraphics
        .ellipse(ring.x, ring.y, ring.currentRadius, ring.currentRadius * 0.4)
        .stroke({
          width: 3,
          color: ring.color,
          alpha: Math.min(1, Math.max(0, ring.alpha))
        });
    }

    // 4. Update Space Lasers
    for (let i = this.activeLasers.length - 1; i >= 0; i--) {
      const laser = this.activeLasers[i];
      laser.progress += dt / laser.duration;

      if (laser.progress >= 1.0) {
        this.laserContainer.removeChild(laser.beamGlow);
        this.laserContainer.removeChild(laser.textBanner);
        this.activeLasers.splice(i, 1);
        continue;
      }

      const p = laser.progress;
      const alpha = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;

      // Draw celestial laser beam
      laser.beamGlow.clear();

      // Outer wide soft glow
      laser.beamGlow
        .moveTo(laser.targetX - 70, 0)
        .lineTo(laser.targetX + 70, 0)
        .lineTo(laser.targetX + 130, laser.targetY)
        .lineTo(laser.targetX - 130, laser.targetY)
        .closePath()
        .fill({ color: laser.color, alpha: alpha * 0.25 });

      // Core intense laser beam
      laser.beamGlow
        .moveTo(laser.targetX - 25, 0)
        .lineTo(laser.targetX + 25, 0)
        .lineTo(laser.targetX + 50, laser.targetY)
        .lineTo(laser.targetX - 50, laser.targetY)
        .closePath()
        .fill({ color: 0xffffff, alpha: alpha * 0.85 });

      // Ground impact spot
      laser.beamGlow
        .ellipse(laser.targetX, laser.targetY, 110, 40)
        .fill({ color: laser.color, alpha: alpha * 0.6 });

      // Cascade text downwards
      laser.textBanner.alpha = alpha;
      laser.textBanner.y = laser.targetY * (0.2 + p * 0.5);
    }
  }

  // Emit jetpack thruster spark & flame
  public emitJetpackThruster(x: number, y: number, color: number = 0x00f0ff, count: number = 2) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + Math.random() * 4,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2.5 + Math.random() * 3.5,
        radius: 2 + Math.random() * 3,
        color: Math.random() > 0.4 ? color : 0xffffff,
        alpha: 0.9,
        decay: 0.05 + Math.random() * 0.04,
        type: 'flame'
      });
    }
  }

  // Small gift effect: Sparkle ring + stardust
  public triggerSmallGift(x: number, y: number, color: number = 0xff00bb) {
    // 15-25 sparkly particles
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 2 + Math.random() * 3.5,
        color: Math.random() > 0.5 ? color : 0xfff000,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        gravity: 0.08
      });
    }

    // Mini shockwave
    this.shockwaves.push({
      x: x,
      y: y + 20,
      vx: 3,
      vy: 0,
      radius: 0,
      currentRadius: 10,
      targetRadius: 70,
      color: color,
      alpha: 0.8,
      decay: 0.025
    });
  }

  // Medium gift effect: Cosmic aura orbit + neon ground ring
  public triggerMediumGift(x: number, y: number, color: number = 0x00ffcc) {
    // 40 radiant sparks
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        radius: 2.5 + Math.random() * 4,
        color: Math.random() > 0.3 ? color : 0xffffff,
        alpha: 1.0,
        decay: 0.018,
        gravity: 0.1
      });
    }

    // Expanding ground shockwaves
    this.shockwaves.push({
      x: x,
      y: y + 30,
      vx: 4.5,
      vy: 0,
      radius: 0,
      currentRadius: 15,
      targetRadius: 160,
      color: color,
      alpha: 1.0,
      decay: 0.02
    });

    // Slight screen bump
    this.shakeIntensity = 6;
  }

  // Big gift effect (Reference image celestial laser beam + Supernova)
  public triggerBigGift(x: number, y: number, color: number = 0x9933ff) {
    // 1. Giant Space Laser striking from deep space onto avatar!
    const beamGlow = new Graphics();
    const textBanner = new Text({
      text: 'GIFT',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 54,
        fontWeight: '900',
        fill: 0xffffff,
        dropShadow: {
          alpha: 0.9,
          angle: Math.PI / 2,
          blur: 15,
          color: 0x00e5ff,
          distance: 0
        },
        letterSpacing: 8
      })
    });
    textBanner.anchor.set(0.5);
    textBanner.x = x;
    textBanner.y = y * 0.4;
    textBanner.rotation = -0.05;

    this.laserContainer.addChild(beamGlow);
    this.laserContainer.addChild(textBanner);

    this.activeLasers.push({
      targetX: x,
      targetY: y,
      progress: 0,
      duration: 1.8,
      color: 0x00f0ff,
      textBanner,
      beamGlow
    });

    // 2. Supernova Particle Burst (80+ particles)
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.5 + Math.random() * 9;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        radius: 3 + Math.random() * 5.5,
        color: [0xff00bb, 0x00f0ff, 0xffd700, 0xffffff][Math.floor(Math.random() * 4)],
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.01,
        gravity: 0.06
      });
    }

    // 3. Double huge expanding shockwave rings
    this.shockwaves.push({
      x: x,
      y: y + 40,
      vx: 6,
      vy: 0,
      radius: 0,
      currentRadius: 20,
      targetRadius: 280,
      color: 0xff00bb,
      alpha: 1.0,
      decay: 0.015
    });

    this.shockwaves.push({
      x: x,
      y: y + 40,
      vx: 4,
      vy: 0,
      radius: 0,
      currentRadius: 5,
      targetRadius: 220,
      color: 0x00f0ff,
      alpha: 0.9,
      decay: 0.018
    });

    // 4. Dramatic Screen Shake
    this.shakeIntensity = 18;
  }

  // Floating heart burst on like
  public triggerHearts(x: number, y: number, count: number = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -2.5 - Math.random() * 3,
        radius: 3.5 + Math.random() * 3,
        color: Math.random() > 0.3 ? 0xff2288 : 0xff66cc,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.01,
        type: 'heart'
      });
    }
  }
}
