import { Container, Graphics, Text, TextStyle } from 'pixi.js';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  blinkSpeed: number;
  color: number;
}

export class Environment {
  public container: Container;
  private spaceGraphics: Graphics;
  private auroraGraphics: Graphics;
  private earthContainer: Container;
  private earthGlobe: Graphics;
  private earthClouds: Graphics;
  private earthAtmosphere: Graphics;
  private groundGraphics: Graphics;
  private moonBaseGraphics: Graphics;
  private laserGraphics: Graphics;
  private trussGraphics: Graphics;

  private stars: Star[] = [];
  private earthRotation: number = 0;
  private laserAngle1: number = -0.3;
  private laserAngle2: number = 0.3;
  private time: number = 0;

  constructor() {
    this.container = new Container();
    this.container.label = 'EnvironmentContainer';

    // 1. Deep Space & Cosmos layer
    this.spaceGraphics = new Graphics();
    this.container.addChild(this.spaceGraphics);

    // 2. Waving Cosmic Aurora Curtains (Lunar Northern Lights)
    this.auroraGraphics = new Graphics();
    this.container.addChild(this.auroraGraphics);

    // 3. Stars
    this.initStars();

    // 4. Earth in the sky
    this.earthContainer = new Container();
    this.earthContainer.x = 540;
    this.earthContainer.y = 230;
    this.container.addChild(this.earthContainer);

    this.earthAtmosphere = new Graphics();
    this.earthGlobe = new Graphics();
    this.earthClouds = new Graphics();
    this.earthContainer.addChild(this.earthAtmosphere);
    this.earthContainer.addChild(this.earthGlobe);
    this.earthContainer.addChild(this.earthClouds);

    // 5. Lunar Surface, Horizon & Perspective Grid
    this.groundGraphics = new Graphics();
    this.container.addChild(this.groundGraphics);

    // 6. Lunar Base Dome & Moon Outpost on the horizon
    this.moonBaseGraphics = new Graphics();
    this.container.addChild(this.moonBaseGraphics);

    // 7. Truss Towers & Neon Signs
    this.trussGraphics = new Graphics();
    this.container.addChild(this.trussGraphics);
    this.setupTrussSigns();

    // 8. Multi-color Stage Laser Beams & Spotlights
    this.laserGraphics = new Graphics();
    this.container.addChild(this.laserGraphics);
  }

  private initStars() {
    for (let i = 0; i < 160; i++) {
      this.stars.push({
        x: Math.random() * 1080,
        y: Math.random() * 720,
        size: Math.random() < 0.85 ? 1 + Math.random() * 2 : 3 + Math.random() * 2.5,
        baseAlpha: 0.35 + Math.random() * 0.65,
        blinkSpeed: 1 + Math.random() * 3,
        color: [0xffffff, 0xcceeff, 0xffddee, 0x00f0ff, 0xffea00][Math.floor(Math.random() * 5)]
      });
    }
  }

  private setupTrussSigns() {
    // Left sign: "LUNAR RAVE"
    const leftText = new Text({
      text: 'LUNAR RAVE',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 22,
        fill: 0x00ffff,
        letterSpacing: 2,
        dropShadow: {
          alpha: 0.95,
          angle: 0,
          blur: 12,
          color: 0x00ffff,
          distance: 0
        }
      })
    });
    leftText.anchor.set(0.5);
    leftText.x = 160;
    leftText.y = 535;

    // Right sign: "MOON CLUB"
    const rightText = new Text({
      text: 'MOON CLUB',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 22,
        fill: 0xff00bb,
        letterSpacing: 2,
        dropShadow: {
          alpha: 0.95,
          angle: 0,
          blur: 12,
          color: 0xff00bb,
          distance: 0
        }
      })
    });
    rightText.anchor.set(0.5);
    rightText.x = 920;
    rightText.y = 535;

    this.container.addChild(leftText);
    this.container.addChild(rightText);
  }

  public update(dt: number, kickIntensity: number) {
    this.time += dt;
    this.earthRotation += dt * 0.12;

    // 1. Draw Space & Glowing Nebulae
    this.spaceGraphics.clear();
    this.spaceGraphics
      .rect(0, 0, 1080, 1920)
      .fill({ color: 0x02010a });

    // Multi-color nebula glows (Cyan, Violet, Hot Magenta, Deep Space Blue)
    this.spaceGraphics
      .ellipse(280, 240, 320, 210)
      .fill({ color: 0x22074d, alpha: 0.42 });
    this.spaceGraphics
      .ellipse(820, 280, 300, 190)
      .fill({ color: 0x042454, alpha: 0.45 });
    this.spaceGraphics
      .ellipse(540, 160, 260, 140)
      .fill({ color: 0x4d065e, alpha: 0.32 });
    this.spaceGraphics
      .ellipse(540, 380, 480, 130)
      .fill({ color: 0x00475e, alpha: 0.22 });

    // Twinkling Stars & Cross Sparkles
    for (const s of this.stars) {
      const alpha = s.baseAlpha * (0.65 + 0.35 * Math.sin(this.time * s.blinkSpeed));
      this.spaceGraphics
        .circle(s.x, s.y, s.size)
        .fill({ color: s.color, alpha });

      if (s.size > 3) {
        this.spaceGraphics
          .moveTo(s.x - s.size * 2, s.y)
          .lineTo(s.x + s.size * 2, s.y)
          .stroke({ width: 0.8, color: 0xffffff, alpha: alpha * 0.8 });
        this.spaceGraphics
          .moveTo(s.x, s.y - s.size * 2)
          .lineTo(s.x, s.y + s.size * 2)
          .stroke({ width: 0.8, color: 0xffffff, alpha: alpha * 0.8 });
      }
    }

    // 2. Cosmic Aurora Curtains in the lunar sky
    this.renderCosmicAurora();

    // 3. Draw Planet Earth
    this.renderEarth();

    // 4. Draw Lunar Ground, Craters & Neon Floor Grid
    this.renderLunarGround(kickIntensity);

    // 5. Draw Moon Base Outpost & Rover on horizon
    this.renderMoonBase();

    // 6. Draw Truss Scaffolding
    this.renderTrussTowers();

    // 7. Multi-color Sweeping Lasers
    this.renderLasers(kickIntensity);
  }

  // Waving Cosmic Aurora Waves in the Lunar Sky
  private renderCosmicAurora() {
    this.auroraGraphics.clear();

    const t = this.time * 0.8;
    // Layer 1: Electric Cyan Aurora Wave
    this.auroraGraphics.moveTo(0, 200);
    for (let x = 0; x <= 1080; x += 30) {
      const y = 200 + Math.sin(t + x * 0.005) * 45 + Math.cos(t * 1.5 + x * 0.01) * 20;
      this.auroraGraphics.lineTo(x, y);
    }
    this.auroraGraphics
      .lineTo(1080, 340)
      .lineTo(0, 340)
      .closePath()
      .fill({ color: 0x00f0ff, alpha: 0.10 });

    // Layer 2: Neon Magenta / Violet Wave
    this.auroraGraphics.moveTo(0, 260);
    for (let x = 0; x <= 1080; x += 35) {
      const y = 260 + Math.sin(t * 1.2 + x * 0.007) * 40 + Math.sin(t * 0.7 - x * 0.004) * 25;
      this.auroraGraphics.lineTo(x, y);
    }
    this.auroraGraphics
      .lineTo(1080, 420)
      .lineTo(0, 420)
      .closePath()
      .fill({ color: 0xaa00ff, alpha: 0.12 });
  }

  private renderEarth() {
    const r = 115; // Earth radius

    // 1. Atmosphere halo (vibrant cyan/blue bloom)
    this.earthAtmosphere.clear();
    this.earthAtmosphere
      .circle(0, 0, r + 24)
      .fill({ color: 0x00e5ff, alpha: 0.10 });
    this.earthAtmosphere
      .circle(0, 0, r + 12)
      .fill({ color: 0x0077ff, alpha: 0.22 });
    this.earthAtmosphere
      .circle(0, 0, r + 3)
      .stroke({ width: 3, color: 0x88eeff, alpha: 0.9 });

    // 2. Earth Globe base (Deep Blue Ocean)
    this.earthGlobe.clear();
    this.earthGlobe
      .circle(0, 0, r)
      .fill({ color: 0x0a3b78 });

    // Procedural Continents (Stylized green & golden brown)
    const rot = this.earthRotation;
    this.earthGlobe
      .circle(Math.sin(rot) * 45 - 20, Math.cos(rot * 0.5) * 15 - 10, 48)
      .fill({ color: 0x3d7042, alpha: 0.9 });
    this.earthGlobe
      .circle(Math.sin(rot + 1.2) * 55 + 25, Math.cos(rot * 0.7) * 20 + 15, 40)
      .fill({ color: 0xc89e63, alpha: 0.85 });
    this.earthGlobe
      .circle(Math.sin(rot + 2.8) * 60 - 35, Math.cos(rot * 0.6) * 25 + 30, 36)
      .fill({ color: 0x2b6038, alpha: 0.9 });

    // City lights on dark night side
    for (let i = 0; i < 6; i++) {
      const lx = -40 + Math.sin(rot + i) * 25;
      const ly = 10 + Math.cos(rot * 0.8 + i) * 35;
      this.earthGlobe.circle(lx, ly, 1.5).fill({ color: 0xffea77, alpha: 0.85 });
    }

    // Ocean sun reflection & shadow terminator
    this.earthGlobe
      .ellipse(25, -20, r * 0.85, r * 0.85)
      .fill({ color: 0xffffff, alpha: 0.08 });
    this.earthGlobe
      .ellipse(-45, 20, r * 0.9, r * 0.9)
      .fill({ color: 0x000000, alpha: 0.38 });

    // 3. Clouds layer
    this.earthClouds.clear();
    const cRot = this.earthRotation * 1.35;
    this.earthClouds
      .ellipse(Math.sin(cRot) * 40, -30, 65, 14)
      .fill({ color: 0xffffff, alpha: 0.65 });
    this.earthClouds
      .ellipse(Math.sin(cRot + 2) * 50, 15, 75, 18)
      .fill({ color: 0xffffff, alpha: 0.6 });
    this.earthClouds
      .ellipse(Math.sin(cRot + 4) * 45, 45, 55, 12)
      .fill({ color: 0xffffff, alpha: 0.55 });
  }

  private renderLunarGround(kickIntensity: number) {
    this.groundGraphics.clear();

    const horizonY = 660;

    // Distant lunar mountains
    this.groundGraphics
      .moveTo(0, horizonY + 20)
      .bezierCurveTo(280, horizonY - 30, 450, horizonY + 15, 680, horizonY - 20)
      .bezierCurveTo(860, horizonY - 40, 980, horizonY + 5, 1080, horizonY + 10)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x141829 });

    // Main lunar surface (rich slate with crater shading)
    this.groundGraphics
      .moveTo(0, horizonY + 45)
      .bezierCurveTo(340, horizonY + 30, 720, horizonY + 55, 1080, horizonY + 35)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x0e111d });

    // Horizon line glowing highlight
    this.groundGraphics
      .moveTo(0, horizonY + 45)
      .bezierCurveTo(340, horizonY + 30, 720, horizonY + 55, 1080, horizonY + 35)
      .stroke({ width: 2.5, color: 0x00e5ff, alpha: 0.55 });

    // Lunar Craters with glowing neon mineral rims
    const craters = [
      { x: 120, y: 720, rx: 65, ry: 24, rimCol: 0x00f0ff },
      { x: 940, y: 735, rx: 80, ry: 28, rimCol: 0xff00bb },
      { x: 45, y: 920, rx: 95, ry: 34, rimCol: 0x00ff88 },
      { x: 1025, y: 950, rx: 90, ry: 32, rimCol: 0xaa00ff },
      { x: 260, y: 1270, rx: 115, ry: 40, rimCol: 0x00e5ff },
      { x: 820, y: 1310, rx: 125, ry: 44, rimCol: 0xff00aa }
    ];

    for (const c of craters) {
      this.groundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .fill({ color: 0x070912, alpha: 0.85 });

      this.groundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .stroke({ width: 2, color: c.rimCol, alpha: 0.45 });

      // Glowing crystal mineral deposits inside crater
      this.groundGraphics
        .circle(c.x - c.rx * 0.25, c.y, 4)
        .fill({ color: c.rimCol, alpha: 0.7 });
      this.groundGraphics
        .circle(c.x + c.rx * 0.2, c.y + 2, 3)
        .fill({ color: 0xffffff, alpha: 0.8 });
    }

    // --- CYBERPUNK LUNAR PERSPECTIVE GRID ---
    const vpX = 540;
    const vpY = 640;
    const gridAlpha = 0.25 + kickIntensity * 0.18;

    // Radial perspective lines converging to horizon
    const lineXSpans = [-240, -40, 140, 320, 540, 760, 940, 1120, 1320];
    for (let i = 0; i < lineXSpans.length; i++) {
      const gx = lineXSpans[i];
      const col = i % 2 === 0 ? 0x00d4ff : 0xaa22ff;
      this.groundGraphics
        .moveTo(vpX, vpY + 50)
        .lineTo(gx, 1920)
        .stroke({ width: 1.5, color: col, alpha: gridAlpha });
    }

    // Horizontal perspective grid rungs
    const rungY = [710, 770, 840, 930, 1040, 1180, 1360, 1580, 1820];
    for (let i = 0; i < rungY.length; i++) {
      const y = rungY[i];
      const isVipBoundary = (y === 1040 || y === 1360);
      this.groundGraphics
        .moveTo(0, y)
        .lineTo(1080, y)
        .stroke({
          width: isVipBoundary ? 3 : 1.2,
          color: isVipBoundary ? 0xff00bb : 0x00e5ff,
          alpha: isVipBoundary ? 0.75 : gridAlpha * 0.8
        });
    }

    // VIP Hexagonal dancefloor boundary lines
    this.groundGraphics
      .moveTo(220, 1040)
      .lineTo(860, 1040)
      .lineTo(970, 1420)
      .lineTo(110, 1420)
      .closePath()
      .stroke({
        width: 3.5,
        color: 0x00f0ff,
        alpha: 0.6 + kickIntensity * 0.3
      });

    // Central pulsing VIP circular hologram ring
    const vipRingRadius = 145 + kickIntensity * 16;
    this.groundGraphics
      .ellipse(540, 1230, vipRingRadius, vipRingRadius * 0.38)
      .stroke({
        width: 4,
        color: 0xff00aa,
        alpha: 0.8 + kickIntensity * 0.2
      });
    this.groundGraphics
      .ellipse(540, 1230, vipRingRadius * 0.65, vipRingRadius * 0.25)
      .stroke({
        width: 2,
        color: 0x00ffff,
        alpha: 0.7
      });
  }

  // Futuristic Moon Base Dome & Neon Flag on Horizon
  private renderMoonBase() {
    this.moonBaseGraphics.clear();

    // 1. Lunar Outpost Bio-Dome (Right horizon, x: 740, y: 640)
    const domeX = 750;
    const domeY = 645;
    // Outer geodesic dome shell
    this.moonBaseGraphics
      .ellipse(domeX, domeY, 48, 28)
      .fill({ color: 0x091428, alpha: 0.85 })
      .stroke({ width: 2, color: 0x00e5ff, alpha: 0.85 });

    // Geodesic hexagon windows
    this.moonBaseGraphics
      .ellipse(domeX, domeY - 5, 24, 14)
      .fill({ color: 0x00ffff, alpha: 0.35 })
      .stroke({ width: 1.5, color: 0xffffff });

    // Communications Antenna Tower
    this.moonBaseGraphics
      .moveTo(domeX, domeY - 28)
      .lineTo(domeX, domeY - 55)
      .stroke({ width: 2, color: 0x00e5ff });
    // Blinking red beacon light at top
    const beaconBlink = Math.sin(this.time * 4) > 0 ? 0xff0055 : 0x440011;
    this.moonBaseGraphics.circle(domeX, domeY - 55, 3.5).fill({ color: beaconBlink });

    // 2. Apollo Lunar Rave Flag on Left ridge (x: 320, y: 630)
    const flagX = 330;
    const flagY = 638;
    this.moonBaseGraphics
      .moveTo(flagX, flagY)
      .lineTo(flagX, flagY - 45)
      .stroke({ width: 2, color: 0xcccccc });

    // Fluttering neon flag
    const wave = Math.sin(this.time * 3) * 3;
    this.moonBaseGraphics
      .moveTo(flagX, flagY - 45)
      .lineTo(flagX + 24, flagY - 43 + wave)
      .lineTo(flagX + 24, flagY - 27 + wave)
      .lineTo(flagX, flagY - 30)
      .closePath()
      .fill({ color: 0xff0088 })
      .stroke({ width: 1.5, color: 0x00ffff });
  }

  private renderTrussTowers() {
    this.trussGraphics.clear();

    const drawTruss = (x: number, y: number, w: number, h: number) => {
      this.trussGraphics
        .rect(x, y, 6, h)
        .fill({ color: 0x222a44 });
      this.trussGraphics
        .rect(x + w - 6, y, 6, h)
        .fill({ color: 0x222a44 });

      const steps = 7;
      const stepH = h / steps;
      for (let i = 0; i < steps; i++) {
        const sy = y + i * stepH;
        this.trussGraphics
          .moveTo(x + 3, sy)
          .lineTo(x + w - 3, sy + stepH)
          .stroke({ width: 2, color: 0x3d4a6e });
        this.trussGraphics
          .moveTo(x + w - 3, sy)
          .lineTo(x + 3, sy + stepH)
          .stroke({ width: 2, color: 0x3d4a6e });
        this.trussGraphics
          .moveTo(x, sy)
          .lineTo(x + w, sy)
          .stroke({ width: 2, color: 0x56658d });
      }
    };

    drawTruss(70, 480, 180, 210);
    drawTruss(830, 480, 180, 210);

    // Neon Sign frames
    this.trussGraphics
      .roundRect(60, 510, 200, 50, 8)
      .fill({ color: 0x0b1026, alpha: 0.85 })
      .stroke({ width: 3, color: 0x00ffff, alpha: 0.9 });

    this.trussGraphics
      .roundRect(820, 510, 200, 50, 8)
      .fill({ color: 0x1a0724, alpha: 0.85 })
      .stroke({ width: 3, color: 0xff00bb, alpha: 0.9 });
  }

  private renderLasers(kickIntensity: number) {
    this.laserGraphics.clear();

    this.laserAngle1 = Math.sin(this.time * 1.5) * 0.45;
    this.laserAngle2 = -Math.cos(this.time * 1.3) * 0.45;

    const drawLaserBeam = (
      originX: number,
      originY: number,
      angle: number,
      color: number,
      spread: number = 0.05
    ) => {
      const len = 1200;
      const x1 = originX + Math.sin(angle - spread) * len;
      const y1 = originY - Math.cos(angle - spread) * len;
      const x2 = originX + Math.sin(angle + spread) * len;
      const y2 = originY - Math.cos(angle + spread) * len;

      this.laserGraphics
        .moveTo(originX, originY)
        .lineTo(x1, y1)
        .lineTo(x2, y2)
        .closePath()
        .fill({ color, alpha: 0.18 + kickIntensity * 0.14 });

      const cx = originX + Math.sin(angle) * len;
      const cy = originY - Math.cos(angle) * len;
      this.laserGraphics
        .moveTo(originX, originY)
        .lineTo(cx, cy)
        .stroke({ width: 3.5, color: 0xffffff, alpha: 0.75 + kickIntensity * 0.25 });
    };

    // Truss top projectors: vibrant multi-color lasers (Pink, Cyan, Amber, Neon Purple)
    drawLaserBeam(160, 480, this.laserAngle1 - 0.22, 0xff00aa, 0.045);
    drawLaserBeam(160, 480, this.laserAngle1 + 0.32, 0x00e5ff, 0.04);
    drawLaserBeam(160, 480, this.laserAngle1 + 0.05, 0xffbb00, 0.03);

    drawLaserBeam(920, 480, this.laserAngle2 + 0.22, 0x00ffcc, 0.045);
    drawLaserBeam(920, 480, this.laserAngle2 - 0.32, 0xff0077, 0.04);
    drawLaserBeam(920, 480, this.laserAngle2 - 0.05, 0xaa00ff, 0.03);

    // Cross spotlights shining from trusses onto crowd
    const spotX1 = 540 + Math.sin(this.time * 2.2) * 280;
    this.laserGraphics
      .moveTo(160, 480)
      .lineTo(spotX1 - 45, 1150)
      .lineTo(spotX1 + 45, 1150)
      .closePath()
      .fill({ color: 0x00f0ff, alpha: 0.12 + kickIntensity * 0.1 });

    const spotX2 = 540 - Math.cos(this.time * 1.9) * 280;
    this.laserGraphics
      .moveTo(920, 480)
      .lineTo(spotX2 - 45, 1150)
      .lineTo(spotX2 + 45, 1150)
      .closePath()
      .fill({ color: 0xff00bb, alpha: 0.12 + kickIntensity * 0.1 });
  }
}
