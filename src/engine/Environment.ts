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
  private earthContainer: Container;
  private earthGlobe: Graphics;
  private earthClouds: Graphics;
  private earthAtmosphere: Graphics;
  private groundGraphics: Graphics;
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

    // 1. Space & Nebula layer
    this.spaceGraphics = new Graphics();
    this.container.addChild(this.spaceGraphics);

    // 2. Stars
    this.initStars();

    // 3. Earth
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

    // 4. Lunar Surface & Perspective Grid
    this.groundGraphics = new Graphics();
    this.container.addChild(this.groundGraphics);

    // 5. Truss Towers & Neon Signs
    this.trussGraphics = new Graphics();
    this.container.addChild(this.trussGraphics);
    this.setupTrussSigns();

    // 6. Stage Laser Beams
    this.laserGraphics = new Graphics();
    this.container.addChild(this.laserGraphics);
  }

  private initStars() {
    for (let i = 0; i < 140; i++) {
      this.stars.push({
        x: Math.random() * 1080,
        y: Math.random() * 720, // stars in upper sky
        size: Math.random() < 0.85 ? 1 + Math.random() * 2 : 3 + Math.random() * 2.5,
        baseAlpha: 0.3 + Math.random() * 0.7,
        blinkSpeed: 1 + Math.random() * 3,
        color: [0xffffff, 0xcceeff, 0xffddee, 0x00f0ff][Math.floor(Math.random() * 4)]
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
          alpha: 0.9,
          angle: 0,
          blur: 10,
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
          alpha: 0.9,
          angle: 0,
          blur: 10,
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

    // 1. Draw Space, Nebulae and Stars
    this.spaceGraphics.clear();
    // Deep Cosmos background
    this.spaceGraphics
      .rect(0, 0, 1080, 1920)
      .fill({ color: 0x03020c });

    // Glowing Nebula clouds
    this.spaceGraphics
      .ellipse(320, 260, 280, 190)
      .fill({ color: 0x1f0b48, alpha: 0.35 });
    this.spaceGraphics
      .ellipse(750, 310, 260, 160)
      .fill({ color: 0x06284a, alpha: 0.4 });
    this.spaceGraphics
      .ellipse(540, 180, 220, 120)
      .fill({ color: 0x3d0b5e, alpha: 0.25 });

    // Twinkling Stars
    for (const s of this.stars) {
      const alpha = s.baseAlpha * (0.65 + 0.35 * Math.sin(this.time * s.blinkSpeed));
      this.spaceGraphics
        .circle(s.x, s.y, s.size)
        .fill({ color: s.color, alpha });

      // Cross sparkle for larger stars
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

    // 2. Draw Planet Earth
    this.renderEarth();

    // 3. Draw Lunar Horizon and Perspective Cyber Grid
    this.renderLunarGround(kickIntensity);

    // 4. Draw Truss Scaffolding
    this.renderTrussTowers();

    // 5. Draw Sweeping Laser Beams & Stage Spotlights
    this.renderLasers(kickIntensity);
  }

  private renderEarth() {
    const r = 115; // Earth radius

    // 1. Atmosphere halo (cyan/blue bloom)
    this.earthAtmosphere.clear();
    this.earthAtmosphere
      .circle(0, 0, r + 18)
      .fill({ color: 0x00d4ff, alpha: 0.12 });
    this.earthAtmosphere
      .circle(0, 0, r + 9)
      .fill({ color: 0x0088ff, alpha: 0.25 });
    this.earthAtmosphere
      .circle(0, 0, r + 3)
      .stroke({ width: 2.5, color: 0x88eeff, alpha: 0.85 });

    // 2. Earth Globe base (Deep Blue Ocean)
    this.earthGlobe.clear();
    this.earthGlobe
      .circle(0, 0, r)
      .fill({ color: 0x0a3b78 });

    // Procedural Continents (Africa, Europe, Americas stylized curves)
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

    // Ocean shading & day/night terminator gradient
    this.earthGlobe
      .ellipse(25, -20, r * 0.85, r * 0.85)
      .fill({ color: 0xffffff, alpha: 0.08 });
    this.earthGlobe
      .ellipse(-40, 20, r * 0.9, r * 0.9)
      .fill({ color: 0x000000, alpha: 0.35 });

    // 3. Clouds layer (swirling white arcs)
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

    // Distant lunar hills
    this.groundGraphics
      .moveTo(0, horizonY + 20)
      .bezierCurveTo(280, horizonY - 25, 450, horizonY + 15, 680, horizonY - 15)
      .bezierCurveTo(860, horizonY - 35, 980, horizonY + 5, 1080, horizonY + 10)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x141829 });

    // Main lunar surface body (rich dark slate with crater shading)
    this.groundGraphics
      .moveTo(0, horizonY + 45)
      .bezierCurveTo(340, horizonY + 30, 720, horizonY + 55, 1080, horizonY + 35)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x101321 });

    // Horizon line highlight
    this.groundGraphics
      .moveTo(0, horizonY + 45)
      .bezierCurveTo(340, horizonY + 30, 720, horizonY + 55, 1080, horizonY + 35)
      .stroke({ width: 2, color: 0x3d4b68, alpha: 0.6 });

    // Lunar Craters with rim lighting
    const craters = [
      { x: 120, y: 720, rx: 60, ry: 22 },
      { x: 940, y: 735, rx: 75, ry: 26 },
      { x: 50, y: 920, rx: 90, ry: 32 },
      { x: 1020, y: 950, rx: 85, ry: 30 },
      { x: 280, y: 1250, rx: 110, ry: 38 },
      { x: 800, y: 1290, rx: 120, ry: 42 }
    ];

    for (const c of craters) {
      // Crater interior shadow
      this.groundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .fill({ color: 0x0a0c16, alpha: 0.75 });
      // Crater illuminated rim
      this.groundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .stroke({ width: 1.5, color: 0x3b4863, alpha: 0.5 });
    }

    // --- CYBERPUNK PERSPECTIVE GRID ---
    // Convergence point slightly above horizon center (540, 640)
    const vpX = 540;
    const vpY = 640;
    const gridAlpha = 0.22 + kickIntensity * 0.15;

    // Radial perspective lines converging to horizon
    const lineXSpans = [-200, 0, 180, 360, 540, 720, 900, 1080, 1280];
    for (const gx of lineXSpans) {
      this.groundGraphics
        .moveTo(vpX, vpY + 50)
        .lineTo(gx, 1920)
        .stroke({ width: 1.5, color: 0x00d4ff, alpha: gridAlpha });
    }

    // Horizontal perspective grid rungs (getting closer together in distance)
    const rungY = [710, 770, 840, 930, 1040, 1180, 1360, 1580, 1820];
    for (let i = 0; i < rungY.length; i++) {
      const y = rungY[i];
      const isVipBoundary = (y === 1040 || y === 1360);
      this.groundGraphics
        .moveTo(0, y)
        .lineTo(1080, y)
        .stroke({
          width: isVipBoundary ? 2.5 : 1,
          color: isVipBoundary ? 0xff00bb : 0x00e5ff,
          alpha: isVipBoundary ? 0.7 : gridAlpha * 0.75
        });
    }

    // VIP Hexagonal / Trapezoidal Dancefloor glowing boundary lines
    this.groundGraphics
      .moveTo(220, 1040)
      .lineTo(860, 1040)
      .lineTo(960, 1420)
      .lineTo(120, 1420)
      .closePath()
      .stroke({
        width: 3,
        color: 0x00f0ff,
        alpha: 0.55 + kickIntensity * 0.25
      });

    // Central pulsing VIP circular hologram ring
    const vipRingRadius = 140 + kickIntensity * 15;
    this.groundGraphics
      .ellipse(540, 1230, vipRingRadius, vipRingRadius * 0.38)
      .stroke({
        width: 3.5,
        color: 0xff00aa,
        alpha: 0.75 + kickIntensity * 0.25
      });
    this.groundGraphics
      .ellipse(540, 1230, vipRingRadius * 0.65, vipRingRadius * 0.25)
      .stroke({
        width: 1.5,
        color: 0x00ffff,
        alpha: 0.65
      });
  }

  private renderTrussTowers() {
    this.trussGraphics.clear();

    const drawTruss = (x: number, y: number, w: number, h: number) => {
      // Outer vertical posts
      this.trussGraphics
        .rect(x, y, 6, h)
        .fill({ color: 0x222a44 });
      this.trussGraphics
        .rect(x + w - 6, y, 6, h)
        .fill({ color: 0x222a44 });

      // Cross lacing braces
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

    // Left tower & Right tower
    drawTruss(70, 480, 180, 210);
    drawTruss(830, 480, 180, 210);

    // Neon Sign frames
    // Left: "LUNAR RAVE"
    this.trussGraphics
      .roundRect(60, 510, 200, 50, 8)
      .fill({ color: 0x0b1026, alpha: 0.85 })
      .stroke({ width: 3, color: 0x00ffff, alpha: 0.9 });

    // Right: "MOON CLUB"
    this.trussGraphics
      .roundRect(820, 510, 200, 50, 8)
      .fill({ color: 0x1a0724, alpha: 0.85 })
      .stroke({ width: 3, color: 0xff00bb, alpha: 0.9 });
  }

  private renderLasers(kickIntensity: number) {
    this.laserGraphics.clear();

    // Laser sweeps
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

      // Soft glow cone
      this.laserGraphics
        .moveTo(originX, originY)
        .lineTo(x1, y1)
        .lineTo(x2, y2)
        .closePath()
        .fill({ color, alpha: 0.16 + kickIntensity * 0.12 });

      // Intense center beam
      const cx = originX + Math.sin(angle) * len;
      const cy = originY - Math.cos(angle) * len;
      this.laserGraphics
        .moveTo(originX, originY)
        .lineTo(cx, cy)
        .stroke({ width: 3.5, color: 0xffffff, alpha: 0.75 + kickIntensity * 0.25 });
    };

    // Truss top projectors
    // Left tower pink & cyan lasers
    drawLaserBeam(160, 480, this.laserAngle1 - 0.2, 0xff00aa, 0.04);
    drawLaserBeam(160, 480, this.laserAngle1 + 0.35, 0x00e5ff, 0.035);

    // Right tower cyan & green lasers
    drawLaserBeam(920, 480, this.laserAngle2 + 0.2, 0x00ffcc, 0.04);
    drawLaserBeam(920, 480, this.laserAngle2 - 0.35, 0xff0077, 0.035);

    // Cross spotlights shining from trusses onto crowd
    const spotX1 = 540 + Math.sin(this.time * 2.2) * 280;
    this.laserGraphics
      .moveTo(160, 480)
      .lineTo(spotX1 - 40, 1150)
      .lineTo(spotX1 + 40, 1150)
      .closePath()
      .fill({ color: 0x00f0ff, alpha: 0.1 + kickIntensity * 0.1 });

    const spotX2 = 540 - Math.cos(this.time * 1.9) * 280;
    this.laserGraphics
      .moveTo(920, 480)
      .lineTo(spotX2 - 40, 1150)
      .lineTo(spotX2 + 40, 1150)
      .closePath()
      .fill({ color: 0xff00bb, alpha: 0.1 + kickIntensity * 0.1 });
  }
}
