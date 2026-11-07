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
  private lunarAssetsGraphics: Graphics;
  private laserGraphics: Graphics;
  private stageWashGraphics: Graphics;
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

    // 6. Lunar Assets (Apollo Lander, Lunar Rover, Bio-Dome, Moon Rocks & Flag)
    this.lunarAssetsGraphics = new Graphics();
    this.container.addChild(this.lunarAssetsGraphics);

    // 7. Stage Wash / Moving Head Floor Floodlights
    this.stageWashGraphics = new Graphics();
    this.container.addChild(this.stageWashGraphics);

    // 8. Truss Towers & Neon Signs
    this.trussGraphics = new Graphics();
    this.container.addChild(this.trussGraphics);
    this.setupTrussSigns();

    // 9. Multi-color Stage Laser Beams & Spotlights
    this.laserGraphics = new Graphics();
    this.container.addChild(this.laserGraphics);
  }

  private initStars() {
    for (let i = 0; i < 180; i++) {
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
          blur: 14,
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
          blur: 14,
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
      .fill({ color: 0x03020e });

    // Multi-color nebula glows (Cyan, Violet, Hot Magenta, Deep Space Blue)
    this.spaceGraphics
      .ellipse(260, 240, 340, 220)
      .fill({ color: 0x2b0b5e, alpha: 0.5 });
    this.spaceGraphics
      .ellipse(820, 280, 320, 200)
      .fill({ color: 0x052d68, alpha: 0.52 });
    this.spaceGraphics
      .ellipse(540, 160, 280, 150)
      .fill({ color: 0x620875, alpha: 0.38 });
    this.spaceGraphics
      .ellipse(540, 380, 520, 140)
      .fill({ color: 0x005573, alpha: 0.3 });

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

    // Glowing Celestial Crescent Moon with Neon Orbital Ring in Sky (x: 880, y: 150)
    const moonX = 880;
    const moonY = 150;
    const moonR = 52;
    // Outer atmospheric lunar bloom
    this.spaceGraphics.circle(moonX, moonY, moonR + 18).fill({ color: 0xffea00, alpha: 0.12 });
    this.spaceGraphics.circle(moonX, moonY, moonR + 8).fill({ color: 0xfffae6, alpha: 0.22 });
    // Golden Moon surface
    this.spaceGraphics.circle(moonX, moonY, moonR).fill({ color: 0xfffae0 });
    // Shadow cutout creating iconic 3D crescent
    this.spaceGraphics.circle(moonX - 22, moonY - 12, moonR * 0.96).fill({ color: 0x03020e });
    // Neon Cyber Orbital Ring around the Moon
    this.spaceGraphics.ellipse(moonX, moonY, moonR * 1.55, moonR * 0.42).stroke({ width: 3, color: 0x00f0ff, alpha: 0.9 });
    this.spaceGraphics.ellipse(moonX, moonY, moonR * 1.3, moonR * 0.32).stroke({ width: 1.5, color: 0xff00bb, alpha: 0.75 });

    // 2. Cosmic Aurora Waves in the Lunar Sky
    this.renderCosmicAurora();

    // 3. Draw Planet Earth
    this.renderEarth();

    // 4. Draw Lunar Ground, Textured Regolith, Craters & Glowing Dance Floor
    this.renderLunarGround(kickIntensity);

    // 5. Draw Prominent Lunar Assets (Apollo Lander, Lunar Rover, Bio-Dome, Moon Rocks & Flag)
    this.renderLunarAssets(kickIntensity);

    // 6. Draw Stage Wash / Moving Head Floodlights
    this.renderStageWash(kickIntensity);

    // 7. Draw Truss Scaffolding
    this.renderTrussTowers();

    // 8. Multi-color Sweeping Lasers
    this.renderLasers(kickIntensity);
  }

  // Waving Cosmic Aurora Waves in the Lunar Sky
  private renderCosmicAurora() {
    this.auroraGraphics.clear();

    const t = this.time * 0.8;
    // Layer 1: Electric Cyan Aurora Wave
    this.auroraGraphics.moveTo(0, 180);
    for (let x = 0; x <= 1080; x += 30) {
      const y = 180 + Math.sin(t + x * 0.005) * 50 + Math.cos(t * 1.5 + x * 0.01) * 25;
      this.auroraGraphics.lineTo(x, y);
    }
    this.auroraGraphics
      .lineTo(1080, 360)
      .lineTo(0, 360)
      .closePath()
      .fill({ color: 0x00f0ff, alpha: 0.15 });

    // Layer 2: Neon Magenta / Violet Wave
    this.auroraGraphics.moveTo(0, 240);
    for (let x = 0; x <= 1080; x += 35) {
      const y = 240 + Math.sin(t * 1.2 + x * 0.007) * 45 + Math.sin(t * 0.7 - x * 0.004) * 30;
      this.auroraGraphics.lineTo(x, y);
    }
    this.auroraGraphics
      .lineTo(1080, 440)
      .lineTo(0, 440)
      .closePath()
      .fill({ color: 0xcc00ff, alpha: 0.16 });
  }

  private renderEarth() {
    const r = 115; // Earth radius

    // 1. Atmosphere halo (vibrant cyan/blue bloom)
    this.earthAtmosphere.clear();
    this.earthAtmosphere
      .circle(0, 0, r + 26)
      .fill({ color: 0x00e5ff, alpha: 0.14 });
    this.earthAtmosphere
      .circle(0, 0, r + 13)
      .fill({ color: 0x0077ff, alpha: 0.28 });
    this.earthAtmosphere
      .circle(0, 0, r + 3)
      .stroke({ width: 3.5, color: 0x88eeff, alpha: 0.95 });

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
    for (let i = 0; i < 7; i++) {
      const lx = -40 + Math.sin(rot + i) * 25;
      const ly = 10 + Math.cos(rot * 0.8 + i) * 35;
      this.earthGlobe.circle(lx, ly, 1.8).fill({ color: 0xffea77, alpha: 0.9 });
    }

    // Ocean sun reflection & shadow terminator
    this.earthGlobe
      .ellipse(25, -20, r * 0.85, r * 0.85)
      .fill({ color: 0xffffff, alpha: 0.1 });
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

  // Authentic Lunar Surface with Regolith, Craters & Pulsing Neon Stage Floor
  private renderLunarGround(kickIntensity: number) {
    this.groundGraphics.clear();

    const horizonY = 660;

    // 1. Distant lunar mountain ridge 1 (Back)
    this.groundGraphics
      .moveTo(0, horizonY + 10)
      .bezierCurveTo(240, horizonY - 45, 480, horizonY + 10, 720, horizonY - 35)
      .bezierCurveTo(890, horizonY - 50, 990, horizonY + 5, 1080, horizonY + 5)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x1a2138 });

    // Ridge 1 sunlit crest highlight
    this.groundGraphics
      .moveTo(0, horizonY + 10)
      .bezierCurveTo(240, horizonY - 45, 480, horizonY + 10, 720, horizonY - 35)
      .bezierCurveTo(890, horizonY - 50, 990, horizonY + 5, 1080, horizonY + 5)
      .stroke({ width: 2, color: 0x4a5d85, alpha: 0.7 });

    // 2. Midground lunar ridge 2 (Silver-grey lunar regolith soil)
    this.groundGraphics
      .moveTo(0, horizonY + 40)
      .bezierCurveTo(320, horizonY + 15, 680, horizonY + 48, 1080, horizonY + 25)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x222a42 });

    // Glowing cyan horizon light band
    this.groundGraphics
      .moveTo(0, horizonY + 40)
      .bezierCurveTo(320, horizonY + 15, 680, horizonY + 48, 1080, horizonY + 25)
      .stroke({ width: 3.5, color: 0x00f0ff, alpha: 0.75 + kickIntensity * 0.25 });

    // 3. Forehead Lunar Ground Soil (Textured dark slate & silver dust)
    this.groundGraphics
      .moveTo(0, horizonY + 70)
      .bezierCurveTo(380, horizonY + 55, 760, horizonY + 75, 1080, horizonY + 60)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x161c2e });

    // 4. Prominent Lunar Craters with glowing neon crystal rims & molten stardust
    const craters = [
      { x: 130, y: 725, rx: 70, ry: 26, rimCol: 0x00ffff, innerCol: 0x003355 },
      { x: 940, y: 735, rx: 85, ry: 30, rimCol: 0xff00bb, innerCol: 0x440033 },
      { x: 55, y: 920, rx: 100, ry: 36, rimCol: 0x00ff88, innerCol: 0x003319 },
      { x: 1025, y: 950, rx: 95, ry: 34, rimCol: 0xaa00ff, innerCol: 0x2a0044 },
      { x: 240, y: 1280, rx: 120, ry: 42, rimCol: 0x00f0ff, innerCol: 0x002244 },
      { x: 840, y: 1310, rx: 130, ry: 46, rimCol: 0xff0088, innerCol: 0x3d0020 }
    ];

    for (const c of craters) {
      // Crater deep pit
      this.groundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .fill({ color: c.innerCol, alpha: 0.85 });

      // Crater sunlit outer lip
      this.groundGraphics
        .ellipse(c.x, c.y - 2, c.rx + 2, c.ry + 2)
        .stroke({ width: 2.5, color: 0x6e88b8, alpha: 0.65 });

      // Glowing neon mineral rim
      this.groundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .stroke({ width: 3, color: c.rimCol, alpha: 0.75 + kickIntensity * 0.25 });

      // Glowing crystal mineral deposits
      this.groundGraphics
        .circle(c.x - c.rx * 0.3, c.y, 5)
        .fill({ color: c.rimCol, alpha: 0.95 });
      this.groundGraphics
        .circle(c.x + c.rx * 0.25, c.y + 2, 4)
        .fill({ color: 0xffffff, alpha: 0.9 });
    }

    // 5. Astronaut Boot Prints in the Lunar Dust
    const drawBootPrint = (bx: number, by: number, angle: number) => {
      this.groundGraphics
        .ellipse(bx, by, 7, 13)
        .stroke({ width: 1.5, color: 0x00e5ff, alpha: 0.45 });
      for (let r = -8; r <= 8; r += 4) {
        this.groundGraphics
          .moveTo(bx - 4, by + r)
          .lineTo(bx + 4, by + r)
          .stroke({ width: 1.2, color: 0x00e5ff, alpha: 0.35 });
      }
    };
    drawBootPrint(180, 860, 0.2);
    drawBootPrint(205, 895, 0.25);
    drawBootPrint(870, 880, -0.2);
    drawBootPrint(845, 915, -0.15);

    // 6. CYBERPUNK LUNAR PERSPECTIVE GRID WITH PULSING LED TILES
    const vpX = 540;
    const vpY = 640;
    const gridAlpha = 0.35 + kickIntensity * 0.25;

    // Radial perspective lines converging to horizon
    const lineXSpans = [-260, -60, 120, 300, 540, 780, 960, 1140, 1340];
    for (let i = 0; i < lineXSpans.length; i++) {
      const gx = lineXSpans[i];
      const col = i % 2 === 0 ? 0x00e5ff : 0xaa22ff;
      this.groundGraphics
        .moveTo(vpX, vpY + 50)
        .lineTo(gx, 1920)
        .stroke({ width: 2, color: col, alpha: gridAlpha });
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
          width: isVipBoundary ? 3.5 : 1.5,
          color: isVipBoundary ? 0xff00bb : 0x00e5ff,
          alpha: isVipBoundary ? 0.85 : gridAlpha * 0.85
        });
    }

    // 7. GLOWING VIP HEXAGONAL DANCEFLOOR MATRICES (Rich Rave Floor Colors)
    // Pulsing central rave dancefloor
    this.groundGraphics
      .moveTo(220, 1040)
      .lineTo(860, 1040)
      .lineTo(970, 1420)
      .lineTo(110, 1420)
      .closePath()
      .fill({ color: 0x220942, alpha: 0.45 + kickIntensity * 0.25 })
      .stroke({
        width: 4,
        color: 0x00f0ff,
        alpha: 0.85 + kickIntensity * 0.15
      });

    // Reactive Glowing LED Matrix Floor Panels inside dancefloor
    const panelRows = 5;
    const panelCols = 7;
    for (let pr = 0; pr < panelRows; pr++) {
      const py = 1070 + pr * 65;
      for (let pc = 0; pc < panelCols; pc++) {
        const px = 250 + pc * 85 + (pr % 2) * 42;
        const panelBeat = Math.sin(this.time * 5 + pr * 0.8 + pc * 0.6);
        const col = [0x00f0ff, 0xff00bb, 0x00ff88, 0xffea00][(pr + pc) % 4];
        const pAlpha = 0.16 + (panelBeat > 0 ? panelBeat * 0.32 : 0) + kickIntensity * 0.28;
        this.groundGraphics
          .roundRect(px - 36, py - 14, 72, 28, 5)
          .fill({ color: col, alpha: pAlpha })
          .stroke({ width: 1.5, color: col, alpha: pAlpha + 0.2 });
      }
    }

    // Central pulsing VIP circular hologram rings
    const vipRingRadius = 150 + kickIntensity * 18;
    this.groundGraphics
      .ellipse(540, 1230, vipRingRadius, vipRingRadius * 0.38)
      .fill({ color: 0xff00bb, alpha: 0.12 + kickIntensity * 0.12 })
      .stroke({
        width: 4.5,
        color: 0xff00aa,
        alpha: 0.9 + kickIntensity * 0.1
      });
    this.groundGraphics
      .ellipse(540, 1230, vipRingRadius * 0.65, vipRingRadius * 0.25)
      .stroke({
        width: 2.5,
        color: 0x00ffff,
        alpha: 0.85
      });
  }

  // Apollo Lunar Lander, Lunar Rover, Bio-Dome, Moon Rocks & Neon Flag
  private renderLunarAssets(kickIntensity: number) {
    this.lunarAssetsGraphics.clear();

    // =========================================================================
    // 1. APOLLO LUNAR LANDER (LEM) - Mid-Left Horizon (x: 100, y: 640)
    // =========================================================================
    const lemX = 90;
    const lemY = 645;

    // Four landing gear struts with round gold footpads
    // Left strut
    this.lunarAssetsGraphics
      .moveTo(lemX - 15, lemY - 10)
      .lineTo(lemX - 45, lemY + 22)
      .stroke({ width: 3, color: 0xc8a432 });
    this.lunarAssetsGraphics
      .ellipse(lemX - 45, lemY + 22, 10, 4)
      .fill({ color: 0xffd700 });

    // Right strut
    this.lunarAssetsGraphics
      .moveTo(lemX + 15, lemY - 10)
      .lineTo(lemX + 45, lemY + 22)
      .stroke({ width: 3, color: 0xc8a432 });
    this.lunarAssetsGraphics
      .ellipse(lemX + 45, lemY + 22, 10, 4)
      .fill({ color: 0xffd700 });

    // Descent Stage (Octagonal golden thermal foil body)
    this.lunarAssetsGraphics
      .roundRect(lemX - 25, lemY - 22, 50, 24, 4)
      .fill({ color: 0xd4af37 })
      .stroke({ width: 2, color: 0xffea00 });

    // Golden foil panel seams
    this.lunarAssetsGraphics
      .rect(lemX - 18, lemY - 18, 14, 16)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.7 });
    this.lunarAssetsGraphics
      .rect(lemX + 4, lemY - 18, 14, 16)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.7 });

    // Descent engine bell nozzle at bottom
    this.lunarAssetsGraphics
      .moveTo(lemX - 8, lemY + 2)
      .lineTo(lemX + 8, lemY + 2)
      .lineTo(lemX + 12, lemY + 12)
      .lineTo(lemX - 12, lemY + 12)
      .closePath()
      .fill({ color: 0x111625 })
      .stroke({ width: 1.5, color: 0x00f0ff });

    // Ascent Stage (Cockpit with glowing triangular cyber visor windows)
    this.lunarAssetsGraphics
      .roundRect(lemX - 20, lemY - 45, 40, 24, 6)
      .fill({ color: 0x33415c })
      .stroke({ width: 2, color: 0x111625 });

    // Glowing Cyan Cockpit Windows
    this.lunarAssetsGraphics
      .moveTo(lemX - 14, lemY - 38)
      .lineTo(lemX - 4, lemY - 38)
      .lineTo(lemX - 8, lemY - 30)
      .closePath()
      .fill({ color: 0x00ffff, alpha: 0.95 });
    this.lunarAssetsGraphics
      .moveTo(lemX + 4, lemY - 38)
      .lineTo(lemX + 14, lemY - 38)
      .lineTo(lemX + 8, lemY - 30)
      .closePath()
      .fill({ color: 0x00ffff, alpha: 0.95 });

    // VHF Antenna on top
    this.lunarAssetsGraphics
      .moveTo(lemX, lemY - 45)
      .lineTo(lemX, lemY - 60)
      .stroke({ width: 1.5, color: 0xffffff });
    this.lunarAssetsGraphics
      .circle(lemX, lemY - 60, 2.5)
      .fill({ color: 0x00ff88 });

    // =========================================================================
    // 2. APOLLO LUNAR RAVE FLAG (x: 290, y: 640)
    // =========================================================================
    const flagX = 290;
    const flagY = 642;
    this.lunarAssetsGraphics
      .moveTo(flagX, flagY)
      .lineTo(flagX, flagY - 55)
      .stroke({ width: 2.5, color: 0xe0e0e0 });

    // Fluttering neon holographic flag with crescent moon badge
    const wave = Math.sin(this.time * 3) * 4;
    this.lunarAssetsGraphics
      .moveTo(flagX, flagY - 55)
      .lineTo(flagX + 32, flagY - 53 + wave)
      .lineTo(flagX + 32, flagY - 33 + wave)
      .lineTo(flagX, flagY - 35)
      .closePath()
      .fill({ color: 0xff00bb })
      .stroke({ width: 2, color: 0x00ffff });

    // Crescent moon logo on flag
    this.lunarAssetsGraphics
      .circle(flagX + 14, flagY - 44 + wave * 0.5, 6)
      .fill({ color: 0xffea00 });
    this.lunarAssetsGraphics
      .circle(flagX + 17, flagY - 44 + wave * 0.5, 5)
      .fill({ color: 0xff00bb });

    // =========================================================================
    // 3. LUNAR OUTPOST BIO-DOME (Mid-Right Horizon, x: 790, y: 645)
    // =========================================================================
    const domeX = 790;
    const domeY = 645;
    // Outer geodesic dome shell with glowing cyan structural ribs
    this.lunarAssetsGraphics
      .ellipse(domeX, domeY, 56, 32)
      .fill({ color: 0x091428, alpha: 0.9 })
      .stroke({ width: 2.5, color: 0x00e5ff, alpha: 0.9 });

    // Glowing interior hydroponic garden windows
    this.lunarAssetsGraphics
      .ellipse(domeX, domeY - 6, 28, 16)
      .fill({ color: 0x00ffaa, alpha: 0.4 + kickIntensity * 0.25 })
      .stroke({ width: 2, color: 0xffffff });

    // Communications Tower & Rotating High-Gain Satellite Dish
    this.lunarAssetsGraphics
      .moveTo(domeX, domeY - 32)
      .lineTo(domeX, domeY - 65)
      .stroke({ width: 2.5, color: 0x00e5ff });
    // Satellite dish
    const dishAngle = Math.sin(this.time * 1.5) * 0.3;
    this.lunarAssetsGraphics
      .ellipse(domeX + Math.sin(dishAngle) * 8, domeY - 65, 14, 6)
      .stroke({ width: 2, color: 0xffea00 });

    // Beacon light at top
    const beaconCol = Math.sin(this.time * 5) > 0 ? 0xff0055 : 0x440011;
    this.lunarAssetsGraphics.circle(domeX, domeY - 65, 3.5).fill({ color: beaconCol });

    // =========================================================================
    // 4. LUNAR ROVER (LRV) - Far Right Horizon (x: 990, y: 648)
    // =========================================================================
    const roverX = 990;
    const roverY = 648;
    // Rover Wire Mesh Wheels (Left and Right)
    this.lunarAssetsGraphics
      .circle(roverX - 18, roverY + 10, 8)
      .stroke({ width: 2, color: 0x99aacc });
    this.lunarAssetsGraphics
      .circle(roverX + 18, roverY + 10, 8)
      .stroke({ width: 2, color: 0x99aacc });

    // Rover chassis
    this.lunarAssetsGraphics
      .roundRect(roverX - 22, roverY - 4, 44, 12, 3)
      .fill({ color: 0x242d44 })
      .stroke({ width: 1.5, color: 0x00ffff });

    // Headlight cone beaming left onto the stage
    this.lunarAssetsGraphics
      .moveTo(roverX - 22, roverY)
      .lineTo(roverX - 85, roverY - 12)
      .lineTo(roverX - 85, roverY + 16)
      .closePath()
      .fill({ color: 0x00ffff, alpha: 0.15 + kickIntensity * 0.1 });

    // Rover seats & umbrella antenna
    this.lunarAssetsGraphics
      .moveTo(roverX + 2, roverY - 4)
      .lineTo(roverX + 2, roverY - 18)
      .stroke({ width: 1.5, color: 0xffea00 });
    this.lunarAssetsGraphics
      .ellipse(roverX + 2, roverY - 18, 9, 4)
      .stroke({ width: 1.5, color: 0xffea00 });

    // =========================================================================
    // 5. 3D-SHADED MOON BOULDERS WITH GLOWING NEON CRYSTAL CRACKS
    // =========================================================================
    const drawMoonRock = (rx: number, ry: number, rw: number, rh: number, crystalCol: number) => {
      // Rock body with shadow and light facet
      this.lunarAssetsGraphics
        .ellipse(rx, ry, rw, rh)
        .fill({ color: 0x222a40 })
        .stroke({ width: 1.5, color: 0x4d5f85 });
      this.lunarAssetsGraphics
        .ellipse(rx - rw * 0.2, ry - rh * 0.2, rw * 0.5, rh * 0.4)
        .fill({ color: 0x364463 });
      // Glowing neon crystal vein crack
      this.lunarAssetsGraphics
        .moveTo(rx - rw * 0.4, ry)
        .lineTo(rx, ry + rh * 0.3)
        .lineTo(rx + rw * 0.4, ry - rh * 0.2)
        .stroke({ width: 2, color: crystalCol, alpha: 0.85 });
    };

    drawMoonRock(50, 780, 24, 15, 0x00ffff);
    drawMoonRock(1030, 810, 28, 17, 0xff00bb);
    drawMoonRock(40, 1080, 32, 18, 0x00ff88);
    drawMoonRock(1040, 1120, 34, 19, 0xffea00);
  }

  // Dynamic Moving Head Stage Floor Floodlights (Vibrant Color Washes)
  private renderStageWash(kickIntensity: number) {
    this.stageWashGraphics.clear();

    const t = this.time;
    // Left tower wash light (Vibrant Magenta wash sweeping across crowd)
    const washX1 = 380 + Math.sin(t * 1.8) * 220;
    this.stageWashGraphics
      .moveTo(160, 480)
      .lineTo(washX1 - 130, 1200)
      .lineTo(washX1 + 130, 1200)
      .closePath()
      .fill({ color: 0xff0099, alpha: 0.10 + kickIntensity * 0.12 });

    // Right tower wash light (Electric Cyan wash sweeping across crowd)
    const washX2 = 700 - Math.cos(t * 1.6) * 220;
    this.stageWashGraphics
      .moveTo(920, 480)
      .lineTo(washX2 - 130, 1200)
      .lineTo(washX2 + 130, 1200)
      .closePath()
      .fill({ color: 0x00e5ff, alpha: 0.10 + kickIntensity * 0.12 });

    // Center Golden Wash Light on heavy kick
    if (kickIntensity > 0.4) {
      this.stageWashGraphics
        .ellipse(540, 1150, 260, 110)
        .fill({ color: 0xffaa00, alpha: (kickIntensity - 0.4) * 0.22 });
    }
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

    // Neon Sign frames with glowing double neon border
    this.trussGraphics
      .roundRect(60, 510, 200, 50, 8)
      .fill({ color: 0x0b1026, alpha: 0.9 })
      .stroke({ width: 3.5, color: 0x00ffff, alpha: 0.95 });

    this.trussGraphics
      .roundRect(820, 510, 200, 50, 8)
      .fill({ color: 0x1a0724, alpha: 0.9 })
      .stroke({ width: 3.5, color: 0xff00bb, alpha: 0.95 });
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
        .fill({ color, alpha: 0.20 + kickIntensity * 0.16 });

      const cx = originX + Math.sin(angle) * len;
      const cy = originY - Math.cos(angle) * len;
      this.laserGraphics
        .moveTo(originX, originY)
        .lineTo(cx, cy)
        .stroke({ width: 3.5, color: 0xffffff, alpha: 0.8 + kickIntensity * 0.2 });
    };

    // Truss top projectors: multi-color lasers (Pink, Cyan, Amber, Neon Purple)
    drawLaserBeam(160, 480, this.laserAngle1 - 0.22, 0xff00aa, 0.045);
    drawLaserBeam(160, 480, this.laserAngle1 + 0.32, 0x00e5ff, 0.04);
    drawLaserBeam(160, 480, this.laserAngle1 + 0.05, 0xffbb00, 0.035);

    drawLaserBeam(920, 480, this.laserAngle2 + 0.22, 0x00ffcc, 0.045);
    drawLaserBeam(920, 480, this.laserAngle2 - 0.32, 0xff0077, 0.04);
    drawLaserBeam(920, 480, this.laserAngle2 - 0.05, 0xaa00ff, 0.035);
  }
}
