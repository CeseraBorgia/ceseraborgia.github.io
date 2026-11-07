import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type DJAnimState = 'hands_up_rave' | 'turntable_scratch' | 'hype_crowd' | 'point_vip' | 'headphone_cue';

export class DJBooth {
  public container: Container;
  private boothGraphics: Graphics;
  private speakerLeft: Graphics;
  private speakerRight: Graphics;
  private djCharacter: Graphics;
  private spotlightGraphics: Graphics;

  private djSignText: Text;
  private djBackText: Text;
  private time: number = 0;
  private turntableRotation: number = 0;

  // Dynamic DJ Animation States
  public animState: DJAnimState = 'hands_up_rave';
  private stateTimer: number = 0;
  private stateDuration: number = 7.0; // Switches move every ~7 seconds

  constructor() {
    this.container = new Container();
    this.container.label = 'DJBoothContainer';

    // 1. Upward Stage Spotlights behind booth
    this.spotlightGraphics = new Graphics();
    this.container.addChild(this.spotlightGraphics);

    // 2. Speaker Towers (Left & Right)
    this.speakerLeft = new Graphics();
    this.speakerRight = new Graphics();
    this.container.addChild(this.speakerLeft);
    this.container.addChild(this.speakerRight);

    // 3. Central DJ Desk & Consoles
    this.boothGraphics = new Graphics();
    this.container.addChild(this.boothGraphics);

    // 4. Neon Sign on Booth Front: "LUNAR RAVE - MOON CLUB"
    this.djSignText = new Text({
      text: 'LUNAR RAVE - MOON CLUB',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 24,
        fill: 0x00ffff,
        letterSpacing: 3,
        dropShadow: {
          alpha: 0.95,
          angle: 0,
          blur: 12,
          color: 0x00ffff,
          distance: 0
        }
      })
    });
    this.djSignText.anchor.set(0.5);
    this.djSignText.x = 540;
    this.djSignText.y = 1520;
    this.container.addChild(this.djSignText);

    // 5. Animated DJ Character (Back view with dynamic moves)
    this.djCharacter = new Graphics();
    this.container.addChild(this.djCharacter);

    // 6. DJ Back Jacket Name: "AvokadoBey"
    this.djBackText = new Text({
      text: 'AVOKADOBEY',
      style: new TextStyle({
        fontFamily: 'Impact, Orbitron, Arial Black, sans-serif',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 3,
        fill: 0x44ff77,
        stroke: { width: 4, color: 0x04190b },
        dropShadow: {
          alpha: 1.0,
          angle: 0,
          blur: 14,
          color: 0x00ff88,
          distance: 0
        }
      })
    });
    this.djBackText.anchor.set(0.5);
    this.container.addChild(this.djBackText);
  }

  public update(dt: number, kickIntensity: number, beatPhase: number) {
    this.time += dt;
    this.turntableRotation += dt * 4;

    // Cycle DJ animation states
    this.stateTimer += dt;
    if (this.stateTimer >= this.stateDuration) {
      this.stateTimer = 0;
      this.stateDuration = 6.0 + Math.random() * 3.0;
      const states: DJAnimState[] = [
        'hands_up_rave',
        'turntable_scratch',
        'hype_crowd',
        'point_vip',
        'headphone_cue'
      ];
      // Pick next state different from current
      const nextStates = states.filter(s => s !== this.animState);
      this.animState = nextStates[Math.floor(Math.random() * nextStates.length)];
    }

    this.renderSpeakers(kickIntensity);
    this.renderBooth(kickIntensity);
    this.renderDJCharacter(kickIntensity, beatPhase);
    this.renderDeskSpotlights(kickIntensity);
  }

  private renderSpeakers(kick: number) {
    // Left Speaker Tower (x: 10..190, y: 1420..1900)
    const drawTower = (g: Graphics, x: number, isLeft: boolean) => {
      g.clear();
      const w = 180;
      const h = 480;
      const y = 1420;

      // Speaker cabinet body
      g.roundRect(x, y, w, h, 14)
        .fill({ color: 0x111625 })
        .stroke({ width: 3.5, color: 0x00e5ff, alpha: 0.85 });

      // Metal mesh texture / inner bezel
      g.roundRect(x + 12, y + 14, w - 24, h - 28, 10)
        .fill({ color: 0x090c14 })
        .stroke({ width: 2, color: 0x242d44 });

      // Tweeter horn at top
      g.ellipse(x + w / 2, y + 70, 35, 20)
        .fill({ color: 0x181f33 })
        .stroke({ width: 2, color: 0x00ffff, alpha: 0.6 });

      // Subwoofer Cone 1 (Upper) - Pumping to kick
      const sub1R = 52 + kick * 14;
      g.circle(x + w / 2, y + 185, 62)
        .fill({ color: 0x141824 });
      g.circle(x + w / 2, y + 185, sub1R)
        .stroke({ width: 4.5, color: 0xff00bb, alpha: 0.9 + kick * 0.1 });
      g.circle(x + w / 2, y + 185, 20)
        .fill({ color: 0x00ffff, alpha: 0.7 + kick * 0.3 });

      // Subwoofer Cone 2 (Lower) - Pumping to kick
      const sub2R = 55 + kick * 16;
      g.circle(x + w / 2, y + 335, 66)
        .fill({ color: 0x141824 });
      g.circle(x + w / 2, y + 335, sub2R)
        .stroke({ width: 4.5, color: 0x00e5ff, alpha: 0.9 + kick * 0.1 });
      g.circle(x + w / 2, y + 335, 22)
        .fill({ color: 0xff00bb, alpha: 0.7 + kick * 0.3 });

      // Side LED VU-meter spectrum bars
      const meterX = isLeft ? x + w - 18 : x + 10;
      for (let i = 0; i < 14; i++) {
        const barY = y + 100 + i * 18;
        const barActive = (14 - i) / 14 <= (0.4 + kick * 0.65);
        const col = i < 4 ? 0xff0055 : i < 8 ? 0xffcc00 : 0x00ff88;
        g.rect(meterX, barY, 8, 12)
          .fill({ color: barActive ? col : 0x1a2133, alpha: barActive ? 0.95 : 0.4 });
      }
    };

    drawTower(this.speakerLeft, 10, true);
    drawTower(this.speakerRight, 890, false);
  }

  private renderBooth(kick: number) {
    this.boothGraphics.clear();

    // 1. Perspective angled wing consoles on bottom-left and bottom-right
    // Bottom-left angled DJ console (x: 0..310, y: 1720..1920)
    this.boothGraphics
      .moveTo(0, 1720)
      .lineTo(310, 1770)
      .lineTo(310, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x13182b })
      .stroke({ width: 3, color: 0x00e5ff, alpha: 0.8 });

    // Oscilloscope wave on left console
    this.boothGraphics.moveTo(20, 1840);
    for (let i = 20; i < 280; i += 15) {
      const wave = Math.sin(this.time * 12 + i * 0.08) * (18 + kick * 20);
      this.boothGraphics.lineTo(i, 1840 + wave);
    }
    this.boothGraphics.stroke({ width: 2.5, color: 0x00ffcc, alpha: 0.85 });

    // Bottom-right angled DJ console (x: 770..1080, y: 1720..1920)
    this.boothGraphics
      .moveTo(1080, 1720)
      .lineTo(770, 1770)
      .lineTo(770, 1920)
      .lineTo(1080, 1920)
      .closePath()
      .fill({ color: 0x13182b })
      .stroke({ width: 3, color: 0xff00bb, alpha: 0.8 });

    // Right console turntable jog wheel
    this.boothGraphics
      .ellipse(930, 1840, 85, 42)
      .fill({ color: 0x0d111d })
      .stroke({ width: 3, color: 0x00e5ff, alpha: 0.9 });
    this.boothGraphics
      .ellipse(930, 1840, 35, 17)
      .fill({ color: 0x00e5ff, alpha: 0.6 });

    // 2. Central DJ Desk Structure (Trapezoid x: 240..840, y: 1540..1820)
    this.boothGraphics
      .moveTo(310, 1550)
      .lineTo(770, 1550)
      .lineTo(840, 1820)
      .lineTo(240, 1820)
      .closePath()
      .fill({ color: 0x161c30 })
      .stroke({ width: 3.5, color: 0x00ffff, alpha: 0.9 });

    // Front Neon Sign Backing Plate
    this.boothGraphics
      .roundRect(290, 1495, 500, 50, 10)
      .fill({ color: 0x0a0f1d })
      .stroke({ width: 3, color: 0x00f0ff, alpha: 0.95 });

    // Front digital LED Equalizer panel on desk face
    const barCount = 20;
    const barW = 18;
    const startX = 300;
    for (let i = 0; i < barCount; i++) {
      const bx = startX + i * 24;
      const barHeight = (Math.sin(this.time * 8 + i * 0.9) * 0.5 + 0.5) * 55 * (0.5 + kick * 0.5);
      const col = i % 2 === 0 ? 0x00f0ff : 0xff00aa;
      this.boothGraphics
        .rect(bx, 1720 - barHeight, barW, barHeight)
        .fill({ color: col, alpha: 0.85 });
    }

    // Two Glowing Turntables / Jog Wheels on central desk
    // Left Deck (Turntable 1)
    this.boothGraphics
      .ellipse(390, 1615, 60, 26)
      .fill({ color: 0x090d18 })
      .stroke({ width: 3, color: 0xff00bb, alpha: 0.9 });

    // Turntable rotating marker (or scratch oscillation if scratching)
    const scratchMod = this.animState === 'turntable_scratch' ? Math.sin(this.time * 24) * 0.8 : 0;
    const curRot = this.turntableRotation + scratchMod;
    const rotX = Math.cos(curRot) * 45;
    const rotY = Math.sin(curRot) * 19;
    this.boothGraphics
      .moveTo(390, 1615)
      .lineTo(390 + rotX, 1615 + rotY)
      .stroke({ width: 2.5, color: 0xffffff });

    // Right Deck (Turntable 2)
    this.boothGraphics
      .ellipse(690, 1615, 60, 26)
      .fill({ color: 0x090d18 })
      .stroke({ width: 3, color: 0x00e5ff, alpha: 0.9 });
    const rotX2 = Math.cos(-this.turntableRotation) * 45;
    const rotY2 = Math.sin(-this.turntableRotation) * 19;
    this.boothGraphics
      .moveTo(690, 1615)
      .lineTo(690 + rotX2, 1615 + rotY2)
      .stroke({ width: 2.5, color: 0xffffff });

    // Center Mixer pads & knobs
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const px = 500 + c * 22;
        const py = 1595 + r * 20;
        const padCol = [0x00ff88, 0x00f0ff, 0xff00bb, 0xffbb00][c];
        this.boothGraphics
          .roundRect(px, py, 16, 14, 3)
          .fill({ color: padCol, alpha: 0.8 + kick * 0.2 });
      }
    }
  }

  private renderDJCharacter(kick: number, beatPhase: number) {
    this.djCharacter.clear();

    // DJ Astronaut coordinates: x: 540, base y: 1680
    const bounceY = -Math.abs(Math.sin(beatPhase * Math.PI)) * 14 * (0.8 + kick * 0.6);
    const bodySway = Math.sin(this.time * 3) * 6;
    let headTilt = Math.sin(this.time * 2.5) * 4;

    const djX = 540 + bodySway;
    const djY = 1680 + bounceY;

    // 1. Legs / boots
    this.djCharacter
      .roundRect(djX - 32, djY + 50, 22, 60, 8)
      .fill({ color: 0x3d4b68 })
      .stroke({ width: 2.5, color: 0x1f2638 });
    this.djCharacter
      .roundRect(djX + 10, djY + 50, 22, 60, 8)
      .fill({ color: 0x3d4b68 })
      .stroke({ width: 2.5, color: 0x1f2638 });

    // Neon boot soles
    this.djCharacter
      .roundRect(djX - 34, djY + 102, 26, 10, 4)
      .fill({ color: 0x00ffff, alpha: 0.85 });
    this.djCharacter
      .roundRect(djX + 8, djY + 102, 26, 10, 4)
      .fill({ color: 0x00ffff, alpha: 0.85 });

    // 2. Spacesuit Body (Torso back view)
    this.djCharacter
      .roundRect(djX - 48, djY - 20, 96, 80, 20)
      .fill({ color: 0x51638b })
      .stroke({ width: 3, color: 0x1f2638 });

    // Cyber DJ Jacket Back Plate with glowing border for "AVOKADOBEY"
    this.djCharacter
      .roundRect(djX - 74, djY - 6, 148, 34, 10)
      .fill({ color: 0x05130b, alpha: 0.95 })
      .stroke({ width: 3, color: 0x44ff77, alpha: 0.95 + kick * 0.05 });

    // Neon avocado accents on sides of nameplate
    this.djCharacter
      .circle(djX - 62, djY + 11, 4.5)
      .fill({ color: 0x55ff77 });
    this.djCharacter
      .circle(djX + 62, djY + 11, 4.5)
      .fill({ color: 0x55ff77 });

    // DJ Name text position and subtle sway
    this.djBackText.x = djX;
    this.djBackText.y = djY + 11;
    this.djBackText.rotation = bodySway * 0.015;

    // 3. Cyber Backpack / Oxygen Energy Battery below nameplate
    this.djCharacter
      .roundRect(djX - 28, djY + 30, 56, 32, 8)
      .fill({ color: 0x222a40 })
      .stroke({ width: 2, color: 0x00ffff, alpha: 0.9 });

    // Backpack glowing LED energy meter
    this.djCharacter
      .roundRect(djX - 16, djY + 36, 32, 20, 4)
      .fill({ color: 0x00e5ff, alpha: 0.65 + kick * 0.35 });

    // 4. Dynamic Arms & Hands Based on DJ Animation State
    const armRaise = Math.sin(this.time * 4) * 15;

    if (this.animState === 'turntable_scratch') {
      // Left arm down on left turntable (scratching back & forth rapidly)
      const scratchX = Math.sin(this.time * 24) * 14;
      this.djCharacter
        .moveTo(djX - 40, djY - 5)
        .lineTo(djX - 90 + scratchX, djY - 15)
        .lineTo(djX - 120 + scratchX, djY - 45)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX - 120 + scratchX, djY - 45, 11)
        .fill({ color: 0x00e5ff })
        .stroke({ width: 2, color: 0xffffff });

      // Right arm cupping headphone to ear
      headTilt = 7;
      this.djCharacter
        .moveTo(djX + 40, djY - 5)
        .lineTo(djX + 55, djY - 35)
        .lineTo(djX + 32, djY - 60)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX + 32, djY - 60, 11)
        .fill({ color: 0xff00bb })
        .stroke({ width: 2, color: 0xffffff });

    } else if (this.animState === 'hype_crowd') {
      // High-energy crowd hype: Both arms pumping up into the air vigorously
      const hypeY = -Math.abs(Math.sin(this.time * 10)) * 26;
      this.djCharacter
        .moveTo(djX - 40, djY - 5)
        .lineTo(djX - 85, djY - 65 + hypeY)
        .lineTo(djX - 65, djY - 95 + hypeY)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX - 65, djY - 95 + hypeY, 11)
        .fill({ color: 0x00ffff })
        .stroke({ width: 2, color: 0xffffff });

      this.djCharacter
        .moveTo(djX + 40, djY - 5)
        .lineTo(djX + 85, djY - 65 + hypeY)
        .lineTo(djX + 65, djY - 95 + hypeY)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX + 65, djY - 95 + hypeY, 11)
        .fill({ color: 0x00ffff })
        .stroke({ width: 2, color: 0xffffff });

    } else if (this.animState === 'point_vip') {
      // Pointing toward VIP platform on the left, other hand on turntable
      this.djCharacter
        .moveTo(djX - 40, djY - 5)
        .lineTo(djX - 110, djY - 45)
        .lineTo(djX - 150, djY - 55)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX - 150, djY - 55, 11)
        .fill({ color: 0xffea00 })
        .stroke({ width: 2, color: 0xffffff });

      // Right arm on mixer desk
      this.djCharacter
        .moveTo(djX + 40, djY - 5)
        .lineTo(djX + 70, djY - 20)
        .lineTo(djX + 90, djY - 45)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX + 90, djY - 45, 11)
        .fill({ color: 0x00e5ff })
        .stroke({ width: 2, color: 0xffffff });

    } else if (this.animState === 'headphone_cue') {
      // Left hand cupping headphone, right hand tweaking mixer EQ knob
      headTilt = -8;
      this.djCharacter
        .moveTo(djX - 40, djY - 5)
        .lineTo(djX - 55, djY - 35)
        .lineTo(djX - 32, djY - 60)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX - 32, djY - 60, 11)
        .fill({ color: 0x00ffff })
        .stroke({ width: 2, color: 0xffffff });

      // Right hand tweaking knob
      const knobMove = Math.sin(this.time * 6) * 10;
      this.djCharacter
        .moveTo(djX + 40, djY - 5)
        .lineTo(djX + 60, djY - 20)
        .lineTo(djX + 50 + knobMove, djY - 35)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX + 50 + knobMove, djY - 35, 11)
        .fill({ color: 0x00ff88 })
        .stroke({ width: 2, color: 0xffffff });

    } else {
      // Standard hands up rave
      this.djCharacter
        .moveTo(djX - 40, djY - 5)
        .lineTo(djX - 85, djY - 60 + armRaise)
        .lineTo(djX - 70, djY - 80 + armRaise)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX - 70, djY - 80 + armRaise, 11)
        .fill({ color: 0x00e5ff })
        .stroke({ width: 2, color: 0xffffff });

      this.djCharacter
        .moveTo(djX + 40, djY - 5)
        .lineTo(djX + 85, djY - 60 - armRaise)
        .lineTo(djX + 70, djY - 80 - armRaise)
        .stroke({ width: 14, color: 0x51638b, cap: 'round' });
      this.djCharacter
        .circle(djX + 70, djY - 80 - armRaise, 11)
        .fill({ color: 0x00e5ff })
        .stroke({ width: 2, color: 0xffffff });
    }

    // 5. Astronaut Helmet (Back view)
    this.djCharacter
      .circle(djX + headTilt * 0.5, djY - 55, 38)
      .fill({ color: 0x3d4b68 })
      .stroke({ width: 3, color: 0x1f2638 });

    // Helmet cyber headset & top rim glow
    this.djCharacter
      .ellipse(djX + headTilt * 0.5, djY - 65, 30, 14)
      .fill({ color: 0x8833ff, alpha: 0.7 + kick * 0.3 });
    this.djCharacter
      .ellipse(djX + headTilt * 0.5, djY - 65, 18, 8)
      .fill({ color: 0xffffff, alpha: 0.6 });

    // DJ Headphone band across back of helmet
    this.djCharacter
      .ellipse(djX + headTilt * 0.5, djY - 52, 42, 20)
      .stroke({ width: 7, color: 0x00e5ff, alpha: 0.95 });
  }

  private renderDeskSpotlights(kick: number) {
    this.spotlightGraphics.clear();

    const angleOffset = Math.sin(this.time * 2) * 0.2;

    const drawDeskLight = (x: number, baseAngle: number) => {
      const len = 950;
      const angle = baseAngle + angleOffset;
      const x1 = x + Math.sin(angle - 0.08) * len;
      const y1 = 1530 - Math.cos(angle - 0.08) * len;
      const x2 = x + Math.sin(angle + 0.08) * len;
      const y2 = 1530 - Math.cos(angle + 0.08) * len;

      this.spotlightGraphics
        .moveTo(x, 1530)
        .lineTo(x1, y1)
        .lineTo(x2, y2)
        .closePath()
        .fill({ color: 0x00f0ff, alpha: 0.18 + kick * 0.15 });

      this.spotlightGraphics
        .roundRect(x - 18, 1520, 36, 20, 5)
        .fill({ color: 0x0b1020 })
        .stroke({ width: 2, color: 0x00ffff });
    };

    drawDeskLight(260, -0.32);
    drawDeskLight(780, 0.32);
  }
}
