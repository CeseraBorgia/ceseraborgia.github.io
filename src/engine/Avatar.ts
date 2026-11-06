import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { AvatarColorScheme, LaneType } from '../types';
import { ParticleSystem } from './ParticleSystem';

export class Avatar {
  public id: string;
  public username: string;
  public container: Container;

  // Lane & Transform
  public lane: LaneType;
  public baseScale: number = 1.0;
  public currentScale: number = 1.0;

  // Position
  public x: number;
  public y: number;
  public targetX: number;
  public targetY: number;

  // Jump / Lane Transition Physics
  public isJumping: boolean = false;
  public jumpProgress: number = 0;
  public jumpDuration: number = 1.2; // low-G jump duration in seconds
  public jumpStartX: number = 0;
  public jumpStartY: number = 0;
  public jumpStartScale: number = 1.0;
  public jumpTargetScale: number = 1.0;
  public jumpHeight: number = 180; // parabolic arc peak

  // VIP & State
  public isVip: boolean = false;
  public vipTimer: number = 0; // seconds remaining in VIP row
  public giftStreak: number = 0;
  public danceStyle: 'moon_bounce' | 'zero_g_flip' | 'electronic_jump' | 'vip_rave';

  // Visual Appearance
  public colorScheme: AvatarColorScheme;
  private astronautGraphics: Graphics;
  private nameContainer: Container;
  private nameText: Text;
  private nameBg: Graphics;
  private speechContainer: Container;
  private speechBubbleGfx: Graphics;
  private speechText: Text;
  private speechTimer: number = 0;

  // VIP Aura & Orbiting Stars
  private vipRingGfx: Graphics;
  private vipStarsGfx: Graphics;

  // Animation Phase
  private animPhaseOffset: number;
  private floatOffset: number = 0;

  constructor(
    id: string,
    username: string,
    lane: LaneType,
    x: number,
    y: number,
    colorScheme: AvatarColorScheme,
    danceStyle: 'moon_bounce' | 'zero_g_flip' | 'electronic_jump' | 'vip_rave' = 'moon_bounce'
  ) {
    this.id = id;
    this.username = username;
    this.lane = lane;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.colorScheme = colorScheme;
    this.danceStyle = danceStyle;
    this.animPhaseOffset = Math.random() * Math.PI * 2;

    this.container = new Container();
    this.container.label = `Avatar_${username}`;

    // VIP Ground Ring (behind avatar)
    this.vipRingGfx = new Graphics();
    this.container.addChild(this.vipRingGfx);

    // Main Astronaut Vector Character
    this.astronautGraphics = new Graphics();
    this.container.addChild(this.astronautGraphics);

    // VIP Orbiting Stars (in front)
    this.vipStarsGfx = new Graphics();
    this.container.addChild(this.vipStarsGfx);

    // Name Tag
    this.nameContainer = new Container();
    this.nameBg = new Graphics();
    this.nameText = new Text({
      text: `@${username}`,
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff
      })
    });
    this.nameText.anchor.set(0.5);
    this.nameContainer.addChild(this.nameBg);
    this.nameContainer.addChild(this.nameText);
    this.container.addChild(this.nameContainer);

    // Speech Bubble
    this.speechContainer = new Container();
    this.speechContainer.visible = false;
    this.speechBubbleGfx = new Graphics();
    this.speechText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0x050814,
        align: 'center'
      })
    });
    this.speechText.anchor.set(0.5);
    this.speechContainer.addChild(this.speechBubbleGfx);
    this.speechContainer.addChild(this.speechText);
    this.container.addChild(this.speechContainer);

    this.updateLaneScale();
    this.updateNameTag();
    this.container.x = this.x;
    this.container.y = this.y;
  }

  public updateLaneScale() {
    if (this.lane === 'back') {
      this.baseScale = 0.42;
      this.nameContainer.visible = false; // keep dense back row uncluttered
    } else if (this.lane === 'mid') {
      this.baseScale = 0.72;
      this.nameContainer.visible = true;
    } else {
      // front VIP
      this.baseScale = 1.22;
      this.nameContainer.visible = true;
    }
    this.currentScale = this.baseScale;
    this.container.scale.set(this.currentScale);
  }

  private updateNameTag() {
    const textWidth = this.nameText.width + 24;
    const textHeight = 28;

    this.nameBg.clear();
    this.nameBg
      .roundRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 14)
      .fill({ color: 0x090d1a, alpha: 0.85 })
      .stroke({
        width: 2,
        color: this.isVip ? 0xff00bb : 0x00e5ff,
        alpha: 0.95
      });

    this.nameContainer.y = 80;
  }

  // Say a message with comic speech bubble
  public say(message: string, duration: number = 4.5) {
    this.speechText.text = message;
    const paddingX = 22;
    const paddingY = 16;
    const bw = Math.max(80, this.speechText.width + paddingX * 2);
    const bh = Math.max(46, this.speechText.height + paddingY * 2);

    this.speechBubbleGfx.clear();

    // Drop shadow
    this.speechBubbleGfx
      .roundRect(-bw / 2 + 3, -bh - 42, bw, bh, 14)
      .fill({ color: 0x000000, alpha: 0.45 });

    // Comic bubble body
    this.speechBubbleGfx
      .roundRect(-bw / 2, -bh - 45, bw, bh, 14)
      .fill({ color: 0xf5f8ff })
      .stroke({
        width: 3.5,
        color: this.isVip ? 0xff00bb : 0x00d4ff,
        alpha: 1.0
      });

    // Bubble pointer tail
    this.speechBubbleGfx
      .moveTo(-10, -45)
      .lineTo(0, -32)
      .lineTo(10, -45)
      .closePath()
      .fill({ color: 0xf5f8ff })
      .stroke({ width: 2, color: this.isVip ? 0xff00bb : 0x00d4ff });

    this.speechText.x = 0;
    this.speechText.y = -bh / 2 - 45;

    this.speechContainer.visible = true;
    this.speechContainer.alpha = 1.0;
    this.speechTimer = duration;
  }

  // Jump to new lane or new coordinates (parabolic low-gravity arc)
  public jumpTo(targetX: number, targetY: number, newLane: LaneType, duration: number = 1.1) {
    this.isJumping = true;
    this.jumpProgress = 0;
    this.jumpDuration = duration;
    this.jumpStartX = this.x;
    this.jumpStartY = this.y;
    this.targetX = targetX;
    this.targetY = targetY;

    this.jumpStartScale = this.currentScale;
    this.lane = newLane;
    if (newLane === 'back') this.jumpTargetScale = 0.42;
    else if (newLane === 'mid') this.jumpTargetScale = 0.72;
    else this.jumpTargetScale = 1.22;

    this.jumpHeight = Math.abs(targetY - this.y) * 0.4 + 110;
  }

  public update(dt: number, time: number, kickIntensity: number, particles: ParticleSystem) {
    // 1. Update Jump Animation (Parabolic Low-Gravity Arc)
    if (this.isJumping) {
      this.jumpProgress += dt / this.jumpDuration;

      if (this.jumpProgress >= 1.0) {
        this.jumpProgress = 1.0;
        this.isJumping = false;
        this.x = this.targetX;
        this.y = this.targetY;
        this.currentScale = this.jumpTargetScale;
        this.updateLaneScale();

        // Moon dust puff on landing
        particles.triggerSmallGift(this.x, this.y + 40 * this.currentScale, 0x3d4b68);
      } else {
        const p = this.jumpProgress;
        // Ease in-out horizontal interpolation
        const easeX = 0.5 - 0.5 * Math.cos(p * Math.PI);
        this.x = this.jumpStartX + (this.targetX - this.jumpStartX) * easeX;

        // Parabolic vertical trajectory
        const baseCurY = this.jumpStartY + (this.targetY - this.jumpStartY) * p;
        const arcY = Math.sin(p * Math.PI) * this.jumpHeight;
        this.y = baseCurY - arcY;

        // Interpolate scale
        this.currentScale = this.jumpStartScale + (this.jumpTargetScale - this.jumpStartScale) * p;
        this.container.scale.set(this.currentScale);

        // Jetpack thrusters emit sparks during flight!
        if (Math.random() < 0.8) {
          particles.emitJetpackThruster(
            this.x - 14 * this.currentScale,
            this.y + 20 * this.currentScale,
            this.colorScheme.jetpackFlame,
            1
          );
          particles.emitJetpackThruster(
            this.x + 14 * this.currentScale,
            this.y + 20 * this.currentScale,
            this.colorScheme.jetpackFlame,
            1
          );
        }
      }
    }

    // 2. VIP Timer & State
    if (this.isVip) {
      this.vipTimer -= dt;
      if (this.vipTimer <= 0) {
        this.isVip = false;
        this.danceStyle = 'electronic_jump';
        this.updateNameTag();
      }
    }

    // 3. Speech Bubble Timer
    if (this.speechTimer > 0) {
      this.speechTimer -= dt;
      if (this.speechTimer < 0.6) {
        this.speechContainer.alpha = Math.max(0, this.speechTimer / 0.6);
      }
      // Gentle floating bob
      this.speechContainer.y = Math.sin(time * 3 + this.animPhaseOffset) * 4;
      if (this.speechTimer <= 0) {
        this.speechContainer.visible = false;
      }
    }

    // 4. Low-G Dance Motion & Bobbing
    this.container.x = this.x;
    let animYOffset = 0;
    let animRot = 0;
    let armSwing = 0;

    const phase = time * 4 + this.animPhaseOffset;

    if (this.danceStyle === 'vip_rave') {
      // Energetic rave bounce + hands up
      animYOffset = -Math.abs(Math.sin(phase * 1.4)) * 28 * (0.8 + kickIntensity * 0.6);
      animRot = Math.sin(phase * 0.7) * 0.12;
      armSwing = Math.sin(phase * 1.4) * 22;

      // Jetpack sparks for VIP
      if (Math.random() < 0.35) {
        particles.emitJetpackThruster(
          this.x - 14 * this.currentScale,
          this.y + (20 + animYOffset) * this.currentScale,
          0xff00bb,
          1
        );
      }
    } else if (this.danceStyle === 'electronic_jump') {
      animYOffset = -Math.abs(Math.sin(phase)) * 20 * (0.8 + kickIntensity * 0.5);
      animRot = Math.sin(phase * 0.5) * 0.08;
      armSwing = Math.sin(phase) * 16;
    } else if (this.danceStyle === 'zero_g_flip') {
      // Floating zero-G hovering
      animYOffset = Math.sin(phase * 0.6) * 16;
      animRot = Math.sin(phase * 0.4) * 0.18;
      armSwing = Math.sin(phase * 0.6) * 12;
    } else {
      // Normal viewer gentle moon bounce
      animYOffset = -Math.abs(Math.sin(phase * 0.8)) * 10 * (0.7 + kickIntensity * 0.4);
      animRot = Math.sin(phase * 0.4) * 0.05;
      armSwing = Math.sin(phase * 0.8) * 8;
    }

    this.container.y = this.y + animYOffset;
    this.container.rotation = animRot;

    // 5. Draw Astronaut Visuals
    this.renderAstronaut(armSwing, kickIntensity);

    // 6. Draw VIP Ground Ring & Orbiting Stars if VIP
    this.renderVipDecorations(time, kickIntensity);
  }

  private renderAstronaut(armSwing: number, kick: number) {
    this.astronautGraphics.clear();
    const g = this.astronautGraphics;
    const suit = this.colorScheme.suitColor;
    const accent = this.colorScheme.suitAccent;
    const visor = this.colorScheme.visorGlow;

    // 1. Jetpack Backpack (Behind body)
    g.roundRect(-24, -20, 48, 50, 10)
      .fill({ color: 0x1a2136 })
      .stroke({ width: 2, color: accent, alpha: 0.85 });

    // Jetpack Twin Thruster Nozzles
    g.roundRect(-22, 28, 14, 12, 3).fill({ color: 0x2e3852 });
    g.roundRect(8, 28, 14, 12, 3).fill({ color: 0x2e3852 });

    // Thruster interior glow
    g.ellipse(-15, 36, 5, 3).fill({ color: this.colorScheme.jetpackFlame });
    g.ellipse(15, 36, 5, 3).fill({ color: this.colorScheme.jetpackFlame });

    // 2. Spacesuit Legs & Boots
    // Left Leg
    g.roundRect(-22, 22, 16, 42, 6)
      .fill({ color: suit })
      .stroke({ width: 2, color: 0x111622 });
    // Left Boot
    g.roundRect(-25, 58, 20, 10, 4)
      .fill({ color: 0x28324a })
      .stroke({ width: 1.5, color: accent });

    // Right Leg
    g.roundRect(6, 22, 16, 42, 6)
      .fill({ color: suit })
      .stroke({ width: 2, color: 0x111622 });
    // Right Boot
    g.roundRect(5, 58, 20, 10, 4)
      .fill({ color: 0x28324a })
      .stroke({ width: 1.5, color: accent });

    // 3. Torso / Spacesuit Body
    g.roundRect(-28, -25, 56, 54, 14)
      .fill({ color: suit })
      .stroke({ width: 2.5, color: 0x111622 });

    // Chest cyber panel
    g.roundRect(-16, -14, 32, 24, 6)
      .fill({ color: 0x151c2e })
      .stroke({ width: 1.5, color: accent });
    // Status LED dots on chest
    g.circle(-8, -2, 3).fill({ color: visor });
    g.circle(8, -2, 3).fill({ color: 0x00ff88 });

    // 4. Arms & Hands
    // Left Arm (Dancing motion)
    const isHandsUp = this.danceStyle === 'vip_rave';
    if (isHandsUp) {
      // Raised hands!
      g.moveTo(-25, -12)
        .lineTo(-44, -40 - armSwing)
        .stroke({ width: 10, color: suit, cap: 'round' });
      // Left Glove
      g.circle(-44, -40 - armSwing, 7)
        .fill({ color: accent })
        .stroke({ width: 1.5, color: 0xffffff });

      // Right Arm
      g.moveTo(25, -12)
        .lineTo(44, -40 + armSwing)
        .stroke({ width: 10, color: suit, cap: 'round' });
      // Right Glove
      g.circle(44, -40 + armSwing, 7)
        .fill({ color: accent })
        .stroke({ width: 1.5, color: 0xffffff });
    } else {
      // Low-G floating sway arms
      g.moveTo(-25, -12)
        .lineTo(-40, 10 + armSwing)
        .stroke({ width: 10, color: suit, cap: 'round' });
      g.circle(-40, 10 + armSwing, 7)
        .fill({ color: accent });

      g.moveTo(25, -12)
        .lineTo(40, 10 - armSwing)
        .stroke({ width: 10, color: suit, cap: 'round' });
      g.circle(40, 10 - armSwing, 7)
        .fill({ color: accent });
    }

    // 5. Astronaut Helmet
    g.circle(0, -45, 27)
      .fill({ color: suit })
      .stroke({ width: 2.5, color: 0x111622 });

    // Visor Outer Rim
    g.ellipse(0, -44, 20, 14)
      .fill({ color: 0x080b14 })
      .stroke({ width: 2, color: accent });

    // Visor Neon Glowing Display Line
    g.ellipse(0, -44, 17, 10)
      .stroke({ width: 3, color: visor, alpha: 0.9 + kick * 0.1 });

    // Visor Cyber Glint / Reflection
    g.ellipse(-6, -48, 6, 3)
      .fill({ color: 0xffffff, alpha: 0.75 });
  }

  private renderVipDecorations(time: number, kick: number) {
    this.vipRingGfx.clear();
    this.vipStarsGfx.clear();

    if (!this.isVip) return;

    // Glowing VIP floor ring
    const ringR = 52 + kick * 8;
    this.vipRingGfx
      .ellipse(0, 68, ringR, ringR * 0.35)
      .stroke({ width: 3.5, color: 0xff00bb, alpha: 0.9 + kick * 0.1 });
    this.vipRingGfx
      .ellipse(0, 68, ringR * 0.7, ringR * 0.25)
      .stroke({ width: 2, color: 0x00f0ff, alpha: 0.8 });

    // Orbiting Golden Stars
    const starCount = 5;
    for (let i = 0; i < starCount; i++) {
      const angle = time * 3 + (i * Math.PI * 2) / starCount;
      const sx = Math.cos(angle) * 55;
      const sy = -45 + Math.sin(angle) * 22;

      this.vipStarsGfx
        .circle(sx, sy, 4)
        .fill({ color: 0xffd700, alpha: 0.95 });
      // Sparkle cross
      this.vipStarsGfx
        .moveTo(sx - 7, sy)
        .lineTo(sx + 7, sy)
        .stroke({ width: 1.5, color: 0xffffff });
      this.vipStarsGfx
        .moveTo(sx, sy - 7)
        .lineTo(sx, sy + 7)
        .stroke({ width: 1.5, color: 0xffffff });
    }
  }
}
