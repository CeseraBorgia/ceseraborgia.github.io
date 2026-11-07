import { Container, Graphics, Text, TextStyle } from 'pixi.js';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  blinkSpeed: number;
  color: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
}

export class Environment {
  public container: Container;
  private staticSpaceGraphics: Graphics;
  private spaceGraphics: Graphics;
  private auroraGraphics: Graphics;
  private earthContainer: Container;
  private earthGlobe: Graphics;
  private earthClouds: Graphics;
  private earthAtmosphere: Graphics;
  private staticGroundGraphics: Graphics;
  private groundGraphics: Graphics;
  private dancefloorGraphics: Graphics;
  private staticAssetsGraphics: Graphics;
  private lunarAssetsGraphics: Graphics;
  private laserGraphics: Graphics;
  private stageWashGraphics: Graphics;
  private cryoGraphics: Graphics;
  private staticArchGraphics: Graphics;
  private stageArchGraphics: Graphics;
  private droneGraphics: Graphics;

  private stars: Star[] = [];
  private comets: Comet[] = [];
  private earthRotation: number = 0;
  private laserAngle1: number = -0.3;
  private laserAngle2: number = 0.3;
  private time: number = 0;

  // Concentric Bass Ripple Waves on Floor
  private bassRipples: { radius: number; maxRadius: number; alpha: number; color: number }[] = [];

  constructor() {
    this.container = new Container();
    this.container.label = 'EnvironmentContainer';

    // 1. Deep Space & Cosmos layer (Static base + dynamic comets)
    this.staticSpaceGraphics = new Graphics();
    this.spaceGraphics = new Graphics();
    this.container.addChild(this.staticSpaceGraphics);
    this.container.addChild(this.spaceGraphics);

    // 2. Waving Cosmic Aurora Curtains (Lunar Northern Lights)
    this.auroraGraphics = new Graphics();
    this.container.addChild(this.auroraGraphics);

    // 3. Stars
    this.initStars();

    // 4. Earth in the sky
    this.earthContainer = new Container();
    this.earthContainer.x = 540;
    this.earthContainer.y = 220;
    this.container.addChild(this.earthContainer);

    this.earthAtmosphere = new Graphics();
    this.earthGlobe = new Graphics();
    this.earthClouds = new Graphics();
    this.earthContainer.addChild(this.earthAtmosphere);
    this.earthContainer.addChild(this.earthGlobe);
    this.earthContainer.addChild(this.earthClouds);

    // 5. Lunar Surface & Regolith Terrain (Static craters/mountains + dynamic horizon pulse)
    this.staticGroundGraphics = new Graphics();
    this.groundGraphics = new Graphics();
    this.container.addChild(this.staticGroundGraphics);
    this.container.addChild(this.groundGraphics);

    // 6. Tiered Holographic Cyber Dance Floor (Interactive LED Panels & Circuit Traces)
    this.dancefloorGraphics = new Graphics();
    this.container.addChild(this.dancefloorGraphics);

    // 7. Lunar Assets (Static Apollo Lander, Rover, Rocks + dynamic flag/beacon)
    this.staticAssetsGraphics = new Graphics();
    this.lunarAssetsGraphics = new Graphics();
    this.container.addChild(this.staticAssetsGraphics);
    this.container.addChild(this.lunarAssetsGraphics);

    // 8. Stage Wash & Floor Floodlights
    this.stageWashGraphics = new Graphics();
    this.container.addChild(this.stageWashGraphics);

    // 9. Curved Cyber Stage Gateway Arch with Moving Heads & Festival Banners (Static arch + dynamic dots)
    this.staticArchGraphics = new Graphics();
    this.stageArchGraphics = new Graphics();
    this.container.addChild(this.staticArchGraphics);
    this.container.addChild(this.stageArchGraphics);
    this.setupFestivalBanners();

    // 10. Floating Broadcast Camera Drones
    this.droneGraphics = new Graphics();
    this.container.addChild(this.droneGraphics);

    // 11. Multi-color Stage Laser Beams & Spotlights
    this.laserGraphics = new Graphics();
    this.container.addChild(this.laserGraphics);

    // 12. Stage Edge CO2 Cryo Smoke Jets & Plasma Mist
    this.cryoGraphics = new Graphics();
    this.container.addChild(this.cryoGraphics);

    // Initialize all static background layers ONCE (Enormous CPU savings for OBS / TikTok LIVE Studio)
    this.initStaticLayers();
  }

  private initStars() {
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * 1080,
        y: Math.random() * 740,
        size: Math.random() < 0.85 ? 1 + Math.random() * 2 : 3 + Math.random() * 2.5,
        baseAlpha: 0.35 + Math.random() * 0.65,
        blinkSpeed: 1 + Math.random() * 3,
        color: [0xffffff, 0xcceeff, 0xffddee, 0x00f0ff, 0xffea00][Math.floor(Math.random() * 5)]
      });
    }

    // Occasional shooting comets
    for (let i = 0; i < 2; i++) {
      this.spawnComet();
    }
  }

  private spawnComet() {
    this.comets.push({
      x: Math.random() * 800,
      y: Math.random() * 200,
      vx: 3 + Math.random() * 4,
      vy: 1.5 + Math.random() * 2,
      length: 70 + Math.random() * 80,
      alpha: 0.8
    });
  }

  private setupFestivalBanners() {
    // Left sign: "LUNAR RAVE FESTIVAL"
    const leftText = new Text({
      text: '✦ LUNAR RAVE ✦',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 22,
        fill: 0x00ffff,
        letterSpacing: 2,
        dropShadow: {
          alpha: 1.0,
          angle: 0,
          blur: 16,
          color: 0x00ffff,
          distance: 0
        }
      })
    });
    leftText.anchor.set(0.5);
    leftText.x = 180;
    leftText.y = 500;

    // Right sign: "MOON CLUB ARENA"
    const rightText = new Text({
      text: '✦ MOON CLUB ✦',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 22,
        fill: 0xff00bb,
        letterSpacing: 2,
        dropShadow: {
          alpha: 1.0,
          angle: 0,
          blur: 16,
          color: 0xff00bb,
          distance: 0
        }
      })
    });
    rightText.anchor.set(0.5);
    rightText.x = 900;
    rightText.y = 500;

    this.container.addChild(leftText);
    this.container.addChild(rightText);
  }

  // =========================================================================
  // STATIC BACKGROUND LAYERS (Rendered ONCE at startup - 0 per-frame overhead)
  // =========================================================================
  private initStaticLayers() {
    this.initStaticSpace();
    this.initStaticEarth();
    this.initStaticGround();
    this.initStaticAssets();
    this.initStaticArch();
  }

  private initStaticSpace() {
    this.staticSpaceGraphics.clear();
    // Deep Space canvas background
    this.staticSpaceGraphics.rect(0, 0, 1080, 1920).fill({ color: 0x02010c });

    // Multi-color glowing nebulae (Cyan, Violet, Hot Magenta, Deep Space Blue)
    this.staticSpaceGraphics.ellipse(260, 240, 360, 230).fill({ color: 0x2b095e, alpha: 0.55 });
    this.staticSpaceGraphics.ellipse(820, 280, 340, 210).fill({ color: 0x052d68, alpha: 0.55 });
    this.staticSpaceGraphics.ellipse(540, 150, 300, 160).fill({ color: 0x6e0885, alpha: 0.42 });
    this.staticSpaceGraphics.ellipse(540, 380, 540, 150).fill({ color: 0x005573, alpha: 0.32 });

    // Base Stars
    for (const s of this.stars) {
      this.staticSpaceGraphics.circle(s.x, s.y, s.size).fill({ color: s.color, alpha: s.baseAlpha * 0.85 });

      if (s.size > 3) {
        this.staticSpaceGraphics
          .moveTo(s.x - s.size * 2, s.y)
          .lineTo(s.x + s.size * 2, s.y)
          .stroke({ width: 0.8, color: 0xffffff, alpha: s.baseAlpha * 0.7 });
        this.staticSpaceGraphics
          .moveTo(s.x, s.y - s.size * 2)
          .lineTo(s.x, s.y + s.size * 2)
          .stroke({ width: 0.8, color: 0xffffff, alpha: s.baseAlpha * 0.7 });
      }
    }

    // Saturn
    const saturnX = 180;
    const saturnY = 125;
    const saturnR = 36;
    this.staticSpaceGraphics.circle(saturnX, saturnY, saturnR + 14).fill({ color: 0xaa00ff, alpha: 0.15 });
    this.staticSpaceGraphics
      .ellipse(saturnX, saturnY, saturnR * 2.5, saturnR * 0.65)
      .stroke({ width: 7, color: 0xd4af37, alpha: 0.55 });
    this.staticSpaceGraphics
      .ellipse(saturnX, saturnY, saturnR * 2.1, saturnR * 0.52)
      .stroke({ width: 4, color: 0x00f0ff, alpha: 0.7 });
    this.staticSpaceGraphics.circle(saturnX, saturnY, saturnR).fill({ color: 0xd9b36c });
    this.staticSpaceGraphics.ellipse(saturnX, saturnY - 8, saturnR * 0.95, 6).fill({ color: 0xb58b41, alpha: 0.6 });
    this.staticSpaceGraphics.ellipse(saturnX, saturnY + 8, saturnR * 0.95, 7).fill({ color: 0x8f652b, alpha: 0.6 });
    this.staticSpaceGraphics.ellipse(saturnX - 10, saturnY + 8, saturnR * 0.9, saturnR * 0.85).fill({ color: 0x000000, alpha: 0.4 });
    this.staticSpaceGraphics
      .ellipse(saturnX, saturnY, saturnR * 2.5, saturnR * 0.65)
      .stroke({ width: 7, color: 0xf5d77f, alpha: 0.85 });
    this.staticSpaceGraphics
      .ellipse(saturnX, saturnY, saturnR * 2.1, saturnR * 0.52)
      .stroke({ width: 4, color: 0x00ffff, alpha: 0.9 });

    // Crescent Moon with cyber rings
    const moonX = 890;
    const moonY = 150;
    const moonR = 54;
    this.staticSpaceGraphics.circle(moonX, moonY, moonR + 20).fill({ color: 0xffea00, alpha: 0.14 });
    this.staticSpaceGraphics.circle(moonX, moonY, moonR + 9).fill({ color: 0xfffae6, alpha: 0.25 });
    this.staticSpaceGraphics.circle(moonX, moonY, moonR).fill({ color: 0xfffae0 });
    this.staticSpaceGraphics.circle(moonX - 24, moonY - 12, moonR * 0.96).fill({ color: 0x02010c });
    this.staticSpaceGraphics.ellipse(moonX, moonY, moonR * 1.55, moonR * 0.42).stroke({ width: 3.5, color: 0x00f0ff, alpha: 0.95 });
    this.staticSpaceGraphics.ellipse(moonX, moonY, moonR * 1.3, moonR * 0.32).stroke({ width: 2, color: 0xff00bb, alpha: 0.85 });
  }

  private initStaticEarth() {
    const r = 115;
    this.earthAtmosphere.clear();
    this.earthAtmosphere.circle(0, 0, r + 26).fill({ color: 0x00e5ff, alpha: 0.14 });
    this.earthAtmosphere.circle(0, 0, r + 13).fill({ color: 0x0077ff, alpha: 0.28 });
    this.earthAtmosphere.circle(0, 0, r + 3).stroke({ width: 3.5, color: 0x88eeff, alpha: 0.95 });
  }

  private initStaticGround() {
    this.staticGroundGraphics.clear();
    const horizonY = 660;

    // 1. Distant mountain ridge 1 (Back)
    this.staticGroundGraphics
      .moveTo(0, horizonY + 10)
      .bezierCurveTo(240, horizonY - 45, 480, horizonY + 10, 720, horizonY - 35)
      .bezierCurveTo(890, horizonY - 50, 990, horizonY + 5, 1080, horizonY + 5)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x1b233a });

    this.staticGroundGraphics
      .moveTo(0, horizonY + 10)
      .bezierCurveTo(240, horizonY - 45, 480, horizonY + 10, 720, horizonY - 35)
      .bezierCurveTo(890, horizonY - 50, 990, horizonY + 5, 1080, horizonY + 5)
      .stroke({ width: 2.5, color: 0x4a5d85, alpha: 0.75 });

    // 2. Midground lunar ridge 2 (Silver-grey regolith soil)
    this.staticGroundGraphics
      .moveTo(0, horizonY + 40)
      .bezierCurveTo(320, horizonY + 15, 680, horizonY + 48, 1080, horizonY + 25)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x222a44 });

    // Base horizon line
    this.staticGroundGraphics
      .moveTo(0, horizonY + 40)
      .bezierCurveTo(320, horizonY + 15, 680, horizonY + 48, 1080, horizonY + 25)
      .stroke({ width: 3.5, color: 0x00f0ff, alpha: 0.75 });

    // 3. Forehead Lunar Ground Soil
    this.staticGroundGraphics
      .moveTo(0, horizonY + 70)
      .bezierCurveTo(380, horizonY + 55, 760, horizonY + 75, 1080, horizonY + 60)
      .lineTo(1080, 1920)
      .lineTo(0, 1920)
      .closePath()
      .fill({ color: 0x151b2e });

    // Futuristic contour elevation curves
    this.staticGroundGraphics
      .moveTo(0, 740)
      .bezierCurveTo(280, 720, 640, 750, 1080, 730)
      .stroke({ width: 1.5, color: 0x7700ff, alpha: 0.45 });
    this.staticGroundGraphics
      .moveTo(0, 830)
      .bezierCurveTo(360, 810, 780, 840, 1080, 820)
      .stroke({ width: 1.5, color: 0x00d4ff, alpha: 0.4 });
    this.staticGroundGraphics
      .moveTo(0, 930)
      .bezierCurveTo(300, 950, 740, 920, 1080, 940)
      .stroke({ width: 2, color: 0xff00bb, alpha: 0.45 });

    // 4. Lunar Craters
    const craters = [
      { x: 130, y: 725, rx: 70, ry: 26, rimCol: 0x00ffff, innerCol: 0x003355 },
      { x: 940, y: 735, rx: 85, ry: 30, rimCol: 0xff00bb, innerCol: 0x440033 },
      { x: 55, y: 920, rx: 100, ry: 36, rimCol: 0x00ff88, innerCol: 0x003319 },
      { x: 1025, y: 950, rx: 95, ry: 34, rimCol: 0xaa00ff, innerCol: 0x2a0044 },
      { x: 240, y: 1280, rx: 120, ry: 42, rimCol: 0x00f0ff, innerCol: 0x002244 },
      { x: 840, y: 1310, rx: 130, ry: 46, rimCol: 0xff0088, innerCol: 0x3d0020 }
    ];

    for (const c of craters) {
      this.staticGroundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .fill({ color: c.innerCol, alpha: 0.85 });
      this.staticGroundGraphics
        .ellipse(c.x, c.y - 2, c.rx + 2, c.ry + 2)
        .stroke({ width: 2.5, color: 0x6e88b8, alpha: 0.65 });
      this.staticGroundGraphics
        .ellipse(c.x, c.y, c.rx, c.ry)
        .stroke({ width: 3.5, color: c.rimCol, alpha: 0.85 });
      this.staticGroundGraphics
        .circle(c.x - c.rx * 0.3, c.y, 5)
        .fill({ color: c.rimCol, alpha: 0.95 });
      this.staticGroundGraphics
        .circle(c.x + c.rx * 0.25, c.y + 2, 4)
        .fill({ color: 0xffffff, alpha: 0.9 });
    }

    // 5. Boot prints
    const drawBootPrint = (bx: number, by: number) => {
      this.staticGroundGraphics
        .ellipse(bx, by, 7, 13)
        .stroke({ width: 1.5, color: 0x00e5ff, alpha: 0.55 });
      for (let r = -8; r <= 8; r += 4) {
        this.staticGroundGraphics
          .moveTo(bx - 4, by + r)
          .lineTo(bx + 4, by + r)
          .stroke({ width: 1.2, color: 0x00e5ff, alpha: 0.45 });
      }
    };
    drawBootPrint(180, 860);
    drawBootPrint(205, 895);
    drawBootPrint(870, 880);
    drawBootPrint(845, 915);
  }

  private initStaticAssets() {
    this.staticAssetsGraphics.clear();

    // 1. Apollo LEM
    const lemX = 90;
    const lemY = 645;
    this.staticAssetsGraphics.moveTo(lemX - 15, lemY - 10).lineTo(lemX - 45, lemY + 22).stroke({ width: 3, color: 0xc8a432 });
    this.staticAssetsGraphics.ellipse(lemX - 45, lemY + 22, 10, 4).fill({ color: 0xffd700 });
    this.staticAssetsGraphics.moveTo(lemX + 15, lemY - 10).lineTo(lemX + 45, lemY + 22).stroke({ width: 3, color: 0xc8a432 });
    this.staticAssetsGraphics.ellipse(lemX + 45, lemY + 22, 10, 4).fill({ color: 0xffd700 });
    this.staticAssetsGraphics.roundRect(lemX - 25, lemY - 22, 50, 24, 4).fill({ color: 0xd4af37 }).stroke({ width: 2, color: 0xffea00 });
    this.staticAssetsGraphics.rect(lemX - 18, lemY - 18, 14, 16).stroke({ width: 1, color: 0xffffff, alpha: 0.7 });
    this.staticAssetsGraphics.rect(lemX + 4, lemY - 18, 14, 16).stroke({ width: 1, color: 0xffffff, alpha: 0.7 });
    this.staticAssetsGraphics.moveTo(lemX - 8, lemY + 2).lineTo(lemX + 8, lemY + 2).lineTo(lemX + 12, lemY + 12).lineTo(lemX - 12, lemY + 12).closePath().fill({ color: 0x111625 }).stroke({ width: 1.5, color: 0x00f0ff });
    this.staticAssetsGraphics.roundRect(lemX - 20, lemY - 45, 40, 24, 6).fill({ color: 0x33415c }).stroke({ width: 2, color: 0x111625 });
    this.staticAssetsGraphics.moveTo(lemX - 14, lemY - 38).lineTo(lemX - 4, lemY - 38).lineTo(lemX - 8, lemY - 30).closePath().fill({ color: 0x00ffff, alpha: 0.95 });
    this.staticAssetsGraphics.moveTo(lemX + 4, lemY - 38).lineTo(lemX + 14, lemY - 38).lineTo(lemX + 8, lemY - 30).closePath().fill({ color: 0x00ffff, alpha: 0.95 });
    this.staticAssetsGraphics.moveTo(lemX, lemY - 45).lineTo(lemX, lemY - 60).stroke({ width: 1.5, color: 0xffffff });
    this.staticAssetsGraphics.circle(lemX, lemY - 60, 2.5).fill({ color: 0x00ff88 });

    // 2. Flagpole
    this.staticAssetsGraphics.moveTo(290, 642).lineTo(290, 642 - 55).stroke({ width: 2.5, color: 0xe0e0e0 });

    // 3. Bio-Dome Base
    const domeX = 790;
    const domeY = 645;
    this.staticAssetsGraphics.ellipse(domeX, domeY, 56, 32).fill({ color: 0x091428, alpha: 0.9 }).stroke({ width: 2.5, color: 0x00e5ff, alpha: 0.9 });
    this.staticAssetsGraphics.ellipse(domeX, domeY - 6, 28, 16).fill({ color: 0x00ffaa, alpha: 0.5 }).stroke({ width: 2, color: 0xffffff });
    this.staticAssetsGraphics.moveTo(domeX, domeY - 32).lineTo(domeX, domeY - 65).stroke({ width: 2.5, color: 0x00e5ff });
    this.staticAssetsGraphics.ellipse(domeX, domeY - 65, 14, 6).stroke({ width: 2, color: 0xffea00 });

    // 4. Lunar Rover Base
    const roverX = 990;
    const roverY = 648;
    this.staticAssetsGraphics.circle(roverX - 18, roverY + 10, 8).stroke({ width: 2, color: 0x99aacc });
    this.staticAssetsGraphics.circle(roverX + 18, roverY + 10, 8).stroke({ width: 2, color: 0x99aacc });
    this.staticAssetsGraphics.roundRect(roverX - 22, roverY - 4, 44, 12, 3).fill({ color: 0x242d44 }).stroke({ width: 1.5, color: 0x00ffff });
    this.staticAssetsGraphics.moveTo(roverX + 2, roverY - 4).lineTo(roverX + 2, roverY - 18).stroke({ width: 1.5, color: 0xffea00 });
    this.staticAssetsGraphics.ellipse(roverX + 2, roverY - 18, 9, 4).stroke({ width: 1.5, color: 0xffea00 });

    // 5. Moon Rocks & Crystals
    const drawMoonRock = (rx: number, ry: number, rw: number, rh: number, crystalCol: number) => {
      this.staticAssetsGraphics.ellipse(rx, ry, rw, rh).fill({ color: 0x222a44 }).stroke({ width: 1.5, color: 0x4d5f85 });
      this.staticAssetsGraphics.ellipse(rx - rw * 0.2, ry - rh * 0.2, rw * 0.5, rh * 0.4).fill({ color: 0x364463 });
      this.staticAssetsGraphics.moveTo(rx - rw * 0.4, ry).lineTo(rx, ry + rh * 0.3).lineTo(rx + rw * 0.4, ry - rh * 0.2).stroke({ width: 2, color: crystalCol, alpha: 0.85 });
    };
    drawMoonRock(50, 780, 24, 15, 0x00ffff);
    drawMoonRock(1030, 810, 28, 17, 0xff00bb);
    drawMoonRock(40, 1080, 32, 18, 0x00ff88);
    drawMoonRock(1040, 1120, 34, 19, 0xffea00);
  }

  private initStaticArch() {
    this.staticArchGraphics.clear();

    // 1. Curved Overhead Stage Arch Steel Beam
    this.staticArchGraphics
      .moveTo(80, 680)
      .bezierCurveTo(180, 420, 900, 420, 1000, 680)
      .stroke({ width: 8, color: 0x1f2740 });

    // 2. Central Golden Holographic Moon Rave Crest (At top center: 540, 435)
    const crestX = 540;
    const crestY = 435;
    this.staticArchGraphics
      .circle(crestX, crestY, 26)
      .fill({ color: 0x050d1a, alpha: 0.95 })
      .stroke({ width: 3, color: 0xffea00, alpha: 0.95 });
    this.staticArchGraphics.circle(crestX, crestY, 14).fill({ color: 0xffea00 });
    this.staticArchGraphics.circle(crestX - 6, crestY - 3, 12).fill({ color: 0x050d1a });
    this.staticArchGraphics.moveTo(crestX - 26, crestY).lineTo(crestX - 60, crestY - 8).lineTo(crestX - 24, crestY + 8).closePath().fill({ color: 0x00f0ff, alpha: 0.85 });
    this.staticArchGraphics.moveTo(crestX + 26, crestY).lineTo(crestX + 60, crestY - 8).lineTo(crestX + 24, crestY + 8).closePath().fill({ color: 0x00f0ff, alpha: 0.85 });

    // 3. Moving Head Fixture Housings
    const movingHeadSpots = [0.25, 0.40, 0.60, 0.75];
    for (let m = 0; m < movingHeadSpots.length; m++) {
      const p = movingHeadSpots[m];
      const mx = 80 + (1000 - 80) * p;
      const my = 680 - Math.sin(p * Math.PI) * 245;
      this.staticArchGraphics.roundRect(mx - 10, my - 6, 20, 16, 4).fill({ color: 0x0f1526 }).stroke({ width: 2, color: 0x00ffff });
    }

    // 4. Side Truss Towers
    const drawTruss = (x: number, y: number, w: number, h: number) => {
      this.staticArchGraphics.rect(x, y, 6, h).fill({ color: 0x222a44 });
      this.staticArchGraphics.rect(x + w - 6, y, 6, h).fill({ color: 0x222a44 });
      const steps = 6;
      const stepH = h / steps;
      for (let i = 0; i < steps; i++) {
        const sy = y + i * stepH;
        this.staticArchGraphics.moveTo(x + 3, sy).lineTo(x + w - 3, sy + stepH).stroke({ width: 2, color: 0x3d4a6e });
        this.staticArchGraphics.moveTo(x + w - 3, sy).lineTo(x + 3, sy + stepH).stroke({ width: 2, color: 0x3d4a6e });
      }
    };
    drawTruss(80, 480, 180, 200);
    drawTruss(820, 480, 180, 200);

    // Neon Banners frames
    this.staticArchGraphics.roundRect(70, 475, 220, 52, 10).fill({ color: 0x071120 }).stroke({ width: 2.5, color: 0x00ffff, alpha: 0.9 });
    this.staticArchGraphics.roundRect(790, 475, 220, 52, 10).fill({ color: 0x160720 }).stroke({ width: 2.5, color: 0xff00bb, alpha: 0.9 });
  }

  public update(dt: number, kickIntensity: number) {
    this.time += dt;
    this.earthRotation += dt * 0.12;

    // Trigger floor bass ripple wave on heavy kick (soft, subtle pulse)
    if (kickIntensity > 0.65 && Math.random() < 0.22) {
      this.bassRipples.push({
        radius: 50,
        maxRadius: 620,
        alpha: 0.38,
        color: Math.random() > 0.5 ? 0x00f0ff : 0xff00bb
      });
    }

    // 1. Draw Deep Cosmos, Nebulae, Stars & Saturn
    this.renderSpace();

    // 2. Cosmic Aurora Waves in the Lunar Sky
    this.renderCosmicAurora();

    // 3. Draw Planet Earth
    this.renderEarth();

    // 4. Draw Lunar Ground & Regolith Terrain
    this.renderLunarGround(kickIntensity);

    // 5. Draw Tiered Holographic LED Dance Floor & Bass Ripples
    this.renderHoloDancefloor(dt, kickIntensity);

    // 6. Draw Prominent Lunar Assets (Apollo Lander, Lunar Rover, Bio-Dome, Moon Rocks & Flag)
    this.renderLunarAssets(kickIntensity);

    // 7. Draw Stage Wash / Moving Head Floor Floodlights
    this.renderStageWash(kickIntensity);

    // 8. Draw Massive Curved Stage Gateway Arch & Sharpy Moving Heads
    this.renderStageArch(kickIntensity);

    // 9. Floating Hover Camera Drones
    this.renderDrones();

    // 10. Multi-color Sweeping Lasers
    this.renderLasers(kickIntensity);

    // 11. CO2 Cryo Smoke Jets & Stage Mist
    this.renderCryoJets(kickIntensity);
  }

  // Deep Cosmos Shooting Comets (Base space, nebulae, stars, saturn are static in staticSpaceGraphics)
  private renderSpace() {
    this.spaceGraphics.clear();

    // Shooting comets
    for (let i = this.comets.length - 1; i >= 0; i--) {
      const c = this.comets[i];
      c.x += c.vx;
      c.y += c.vy;
      c.alpha -= 0.003;
      if (c.alpha <= 0 || c.x > 1150) {
        this.comets.splice(i, 1);
        if (Math.random() < 0.4) this.spawnComet();
        continue;
      }
      this.spaceGraphics
        .moveTo(c.x, c.y)
        .lineTo(c.x - c.vx * (c.length / 5), c.y - c.vy * (c.length / 5))
        .stroke({ width: 2, color: 0x00ffff, alpha: c.alpha });
      this.spaceGraphics.circle(c.x, c.y, 2.5).fill({ color: 0xffffff, alpha: c.alpha });
    }
  }

  // Waving Cosmic Aurora Waves in the Lunar Sky
  private renderCosmicAurora() {
    this.auroraGraphics.clear();

    const t = this.time * 0.8;
    // Layer 1: Electric Cyan Aurora Wave
    this.auroraGraphics.moveTo(0, 180);
    for (let x = 0; x <= 1080; x += 30) {
      const y = 180 + Math.sin(t + x * 0.005) * 52 + Math.cos(t * 1.5 + x * 0.01) * 26;
      this.auroraGraphics.lineTo(x, y);
    }
    this.auroraGraphics
      .lineTo(1080, 360)
      .lineTo(0, 360)
      .closePath()
      .fill({ color: 0x00f0ff, alpha: 0.16 });

    // Layer 2: Neon Magenta / Violet Wave
    this.auroraGraphics.moveTo(0, 240);
    for (let x = 0; x <= 1080; x += 35) {
      const y = 240 + Math.sin(t * 1.2 + x * 0.007) * 48 + Math.sin(t * 0.7 - x * 0.004) * 32;
      this.auroraGraphics.lineTo(x, y);
    }
    this.auroraGraphics
      .lineTo(1080, 440)
      .lineTo(0, 440)
      .closePath()
      .fill({ color: 0xcc00ff, alpha: 0.18 });
  }

  private renderEarth() {
    const r = 115; // Earth radius (Atmosphere is in static earthAtmosphere)

    // 1. Earth Globe base (Deep Blue Ocean)
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

    // 2. Clouds layer
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

  // Authentic Lunar Surface (Craters, ridges, contour lines are in staticGroundGraphics)
  private renderLunarGround(kickIntensity: number) {
    this.groundGraphics.clear();
    if (kickIntensity > 0.05) {
      const horizonY = 660;
      this.groundGraphics
        .moveTo(0, horizonY + 40)
        .bezierCurveTo(320, horizonY + 15, 680, horizonY + 48, 1080, horizonY + 25)
        .stroke({ width: 4, color: 0x00f0ff, alpha: 0.8 + kickIntensity * 0.2 });
    }
  }

  // Tiered Holographic Cyber Dance Floor with LED Panels & Concentric Bass Ripples
  private renderHoloDancefloor(dt: number, kickIntensity: number) {
    this.dancefloorGraphics.clear();

    const vpX = 540;
    const vpY = 640;
    const gridAlpha = 0.35 + kickIntensity * 0.25;

    // 1. Perspective Radial Grid Rays
    const lineXSpans = [-260, -60, 120, 300, 540, 780, 960, 1140, 1340];
    for (let i = 0; i < lineXSpans.length; i++) {
      const gx = lineXSpans[i];
      const col = i % 2 === 0 ? 0x00e5ff : 0xaa22ff;
      this.dancefloorGraphics
        .moveTo(vpX, vpY + 50)
        .lineTo(gx, 1920)
        .stroke({ width: 2, color: col, alpha: gridAlpha });
    }

    // 2. Perspective Rung Lines
    const rungY = [710, 770, 840, 930, 1040, 1180, 1360, 1580, 1820];
    for (let i = 0; i < rungY.length; i++) {
      const y = rungY[i];
      const isVipBoundary = (y === 1040 || y === 1360);
      this.dancefloorGraphics
        .moveTo(0, y)
        .lineTo(1080, y)
        .stroke({
          width: isVipBoundary ? 4 : 1.5,
          color: isVipBoundary ? 0xff00bb : 0x00e5ff,
          alpha: isVipBoundary ? 0.9 : gridAlpha * 0.85
        });
    }

    // 3. Pulsing Central VIP Hexagonal / Runway Platform
    this.dancefloorGraphics
      .moveTo(220, 1040)
      .lineTo(860, 1040)
      .lineTo(970, 1420)
      .lineTo(110, 1420)
      .closePath()
      .fill({ color: 0x24074d, alpha: 0.5 + kickIntensity * 0.25 })
      .stroke({
        width: 4.5,
        color: 0x00f0ff,
        alpha: 0.9 + kickIntensity * 0.1
      });

    // 4. Reactive Glowing LED Matrix Floor Panels inside dancefloor
    const panelRows = 5;
    const panelCols = 7;
    for (let pr = 0; pr < panelRows; pr++) {
      const py = 1070 + pr * 65;
      for (let pc = 0; pc < panelCols; pc++) {
        const px = 250 + pc * 85 + (pr % 2) * 42;
        const panelBeat = Math.sin(this.time * 5 + pr * 0.8 + pc * 0.6);
        const col = [0x00f0ff, 0xff00bb, 0x00ff88, 0xffea00][(pr + pc) % 4];
        const pAlpha = 0.22 + (panelBeat > 0 ? panelBeat * 0.38 : 0) + kickIntensity * 0.35;
        this.dancefloorGraphics
          .roundRect(px - 36, py - 14, 72, 28, 6)
          .fill({ color: col, alpha: pAlpha })
          .stroke({ width: 1.8, color: col, alpha: pAlpha + 0.25 });
      }
    }

    // 5. Electric Energy Pulse Traces rushing from DJ booth towards crowd (Softened glow)
    for (let i = 0; i < 4; i++) {
      const traceX = 340 + i * 130;
      const pulseY = 1420 - ((this.time * 240 + i * 120) % 360);
      this.dancefloorGraphics
        .circle(traceX, pulseY, 3.5)
        .fill({ color: 0x00ffff, alpha: 0.45 });
      this.dancefloorGraphics
        .moveTo(traceX, pulseY)
        .lineTo(traceX, pulseY + 18)
        .stroke({ width: 1.5, color: 0x00ffff, alpha: 0.3 });
    }

    // 6. Concentric Bass Ripple Waves expanding across the floor (Softened ethereal glow)
    for (let i = this.bassRipples.length - 1; i >= 0; i--) {
      const r = this.bassRipples[i];
      r.radius += dt * 250;
      r.alpha -= dt * 0.45;
      if (r.alpha <= 0 || r.radius > r.maxRadius) {
        this.bassRipples.splice(i, 1);
        continue;
      }
      // Soft outer diffuse halo
      this.dancefloorGraphics
        .ellipse(540, 1260, r.radius, r.radius * 0.38)
        .stroke({ width: 3.2, color: r.color, alpha: r.alpha * 0.22 });
      // Soft delicate ripple contour
      this.dancefloorGraphics
        .ellipse(540, 1260, r.radius, r.radius * 0.38)
        .stroke({ width: 1.4, color: 0xffffff, alpha: r.alpha * 0.45 });
    }
  }

  // Lunar Assets (Apollo LEM, Rover, Bio-Dome, Moon Rocks are in staticAssetsGraphics)
  private renderLunarAssets(kickIntensity: number) {
    this.lunarAssetsGraphics.clear();

    // 1. Animated Waving Neon Flag
    const flagX = 290;
    const flagY = 642;
    const wave = Math.sin(this.time * 3) * 4;
    this.lunarAssetsGraphics
      .moveTo(flagX, flagY - 55)
      .lineTo(flagX + 32, flagY - 53 + wave)
      .lineTo(flagX + 32, flagY - 33 + wave)
      .lineTo(flagX, flagY - 35)
      .closePath()
      .fill({ color: 0xff00bb })
      .stroke({ width: 2, color: 0x00ffff });

    this.lunarAssetsGraphics.circle(flagX + 14, flagY - 44 + wave * 0.5, 6).fill({ color: 0xffea00 });
    this.lunarAssetsGraphics.circle(flagX + 17, flagY - 44 + wave * 0.5, 5).fill({ color: 0xff00bb });

    // 2. Dome Blinking Beacon Light
    const domeX = 790;
    const domeY = 645;
    const beaconCol = Math.sin(this.time * 5) > 0 ? 0xff0055 : 0x440011;
    this.lunarAssetsGraphics.circle(domeX, domeY - 65, 3.5).fill({ color: beaconCol });

    // 3. Rover Headlight Beam
    const roverX = 990;
    const roverY = 648;
    this.lunarAssetsGraphics
      .moveTo(roverX - 22, roverY)
      .lineTo(roverX - 85, roverY - 12)
      .lineTo(roverX - 85, roverY + 16)
      .closePath()
      .fill({ color: 0x00ffff, alpha: 0.15 + kickIntensity * 0.1 });
  }


  // Dynamic Moving Head Stage Floor Floodlights (Vibrant Color Washes)
  private renderStageWash(kickIntensity: number) {
    this.stageWashGraphics.clear();

    const t = this.time;
    // Left tower wash light (Vibrant Magenta wash sweeping across crowd)
    const washX1 = 380 + Math.sin(t * 1.8) * 220;
    this.stageWashGraphics
      .moveTo(180, 480)
      .lineTo(washX1 - 140, 1200)
      .lineTo(washX1 + 140, 1200)
      .closePath()
      .fill({ color: 0xff0099, alpha: 0.12 + kickIntensity * 0.14 });

    // Right tower wash light (Electric Cyan wash sweeping across crowd)
    const washX2 = 700 - Math.cos(t * 1.6) * 220;
    this.stageWashGraphics
      .moveTo(900, 480)
      .lineTo(washX2 - 140, 1200)
      .lineTo(washX2 + 140, 1200)
      .closePath()
      .fill({ color: 0x00e5ff, alpha: 0.12 + kickIntensity * 0.14 });

    // Center Golden Wash Light on heavy kick
    if (kickIntensity > 0.35) {
      this.stageWashGraphics
        .ellipse(540, 1150, 280, 120)
        .fill({ color: 0xffaa00, alpha: (kickIntensity - 0.35) * 0.25 });
    }
  }

  // Curved Cyber Stage Gateway Arch (Steel beams, trusses, and fixtures are in staticArchGraphics)
  private renderStageArch(kickIntensity: number) {
    this.stageArchGraphics.clear();

    // 1. Inner Arch Neon Outline pulse
    this.stageArchGraphics
      .moveTo(95, 680)
      .bezierCurveTo(190, 435, 890, 435, 985, 680)
      .stroke({ width: 3.5, color: 0x00f0ff, alpha: 0.85 + kickIntensity * 0.15 });

    // 2. Animated RGB LED Chaser Pixel Dots along the arch
    const dotCount = 24;
    for (let i = 0; i <= dotCount; i++) {
      const p = i / dotCount;
      const ax = 80 + (1000 - 80) * p;
      const archHeight = Math.sin(p * Math.PI) * 245;
      const ay = 680 - archHeight;

      const dotColor = [0x00f0ff, 0xff00bb, 0xffea00, 0x00ff88][(i + Math.floor(this.time * 6)) % 4];
      this.stageArchGraphics
        .circle(ax, ay, 4)
        .fill({ color: dotColor, alpha: 0.95 });
    }

    // 3. 4 Sweeping pencil-beam rays down to crowd
    const movingHeadSpots = [0.25, 0.40, 0.60, 0.75];
    for (let m = 0; m < movingHeadSpots.length; m++) {
      const p = movingHeadSpots[m];
      const mx = 80 + (1000 - 80) * p;
      const my = 680 - Math.sin(p * Math.PI) * 245;

      const beamAngle = Math.sin(this.time * 2 + m * 1.2) * 0.35;
      const targetX = mx + Math.sin(beamAngle) * 550;
      const targetY = my + Math.cos(beamAngle) * 550;

      const beamCol = [0x00f0ff, 0xff00bb, 0xffea00, 0x00ff88][m % 4];
      this.stageArchGraphics
        .moveTo(mx, my + 8)
        .lineTo(targetX - 25, targetY)
        .lineTo(targetX + 25, targetY)
        .closePath()
        .fill({ color: beamCol, alpha: 0.12 + kickIntensity * 0.15 });
    }
  }

  // Floating Broadcast Camera Drones
  private renderDrones() {
    this.droneGraphics.clear();

    const drawDrone = (baseX: number, baseY: number, tOffset: number) => {
      const dx = baseX + Math.sin(this.time * 1.5 + tOffset) * 25;
      const dy = baseY + Math.cos(this.time * 2 + tOffset) * 15;

      // Drone Quadcopter Chassis
      this.droneGraphics
        .roundRect(dx - 18, dy - 6, 36, 12, 4)
        .fill({ color: 0x111624 })
        .stroke({ width: 2, color: 0x00ffff });

      // Four rotor arms & spinning rotor discs
      const rotors = [-22, 22];
      for (const rx of rotors) {
        this.droneGraphics.moveTo(dx, dy).lineTo(dx + rx, dy - 6).stroke({ width: 2, color: 0x556688 });
        // Spinning rotor disc blur
        this.droneGraphics.ellipse(dx + rx, dy - 6, 12, 3).stroke({ width: 1.5, color: 0x00e5ff, alpha: 0.7 });
      }

      // Blinking Navigation LEDs (Green on right, Red on left)
      const blink = Math.sin(this.time * 6 + tOffset) > 0;
      this.droneGraphics.circle(dx - 18, dy, 2.5).fill({ color: blink ? 0xff0033 : 0x440011 });
      this.droneGraphics.circle(dx + 18, dy, 2.5).fill({ color: blink ? 0x00ff66 : 0x004411 });

      // Camera lens searchlight cone beaming onto the crowd
      this.droneGraphics
        .moveTo(dx, dy + 6)
        .lineTo(dx - 45, dy + 180)
        .lineTo(dx + 45, dy + 180)
        .closePath()
        .fill({ color: 0x00f0ff, alpha: 0.10 });
    };

    drawDrone(240, 780, 0);
    drawDrone(840, 810, 2.5);
  }

  // Multi-color Stage Lasers
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

    // Arch & Truss laser projectors: multi-color lasers (Pink, Cyan, Amber, Neon Purple)
    drawLaserBeam(180, 480, this.laserAngle1 - 0.22, 0xff00aa, 0.045);
    drawLaserBeam(180, 480, this.laserAngle1 + 0.32, 0x00e5ff, 0.04);
    drawLaserBeam(180, 480, this.laserAngle1 + 0.05, 0xffbb00, 0.035);

    drawLaserBeam(900, 480, this.laserAngle2 + 0.22, 0x00ffcc, 0.045);
    drawLaserBeam(900, 480, this.laserAngle2 - 0.32, 0xff0077, 0.04);
    drawLaserBeam(900, 480, this.laserAngle2 - 0.05, 0xaa00ff, 0.035);
  }

  // CO2 Cryo Smoke Jets & Soft Stage Plasma Mist
  private renderCryoJets(kickIntensity: number) {
    this.cryoGraphics.clear();

    // Stage Front Cryo Nozzles at bottom of dancefloor (Shooting upward soft plumes of cold smoke)
    const cryoNozzles = [220, 400, 680, 860];
    const isCryoBlasting = kickIntensity > 0.62;

    for (let i = 0; i < cryoNozzles.length; i++) {
      const nx = cryoNozzles[i];
      const ny = 1430;

      // Fixture nozzle base
      this.cryoGraphics.roundRect(nx - 7, ny, 14, 10, 2).fill({ color: 0x111624 }).stroke({ width: 1.2, color: 0x00e5ff, alpha: 0.8 });

      // Soft, Billowy Plume of CO2 Cryo Gas (Organic wisps, feather-soft opacity)
      if (isCryoBlasting) {
        const blastHeight = 110 + kickIntensity * 120;
        const numPuffs = 6;
        for (let p = 0; p < numPuffs; p++) {
          const progress = p / (numPuffs - 1);
          const py = ny - progress * blastHeight;
          const wobble = Math.sin(this.time * 7 + i * 2.1 + p * 1.3) * (progress * 12);
          const px = nx + wobble;
          const radX = 10 + progress * 26;
          const radY = 7 + progress * 18;

          // Soft translucent outer cyan cloud glow
          const hazeAlpha = (0.04 + (1 - progress * 0.5) * 0.07) * kickIntensity;
          this.cryoGraphics
            .ellipse(px, py, radX * 1.35, radY * 1.3)
            .fill({ color: 0x00f0ff, alpha: hazeAlpha });

          // Soft inner wispy cryo steam puff
          const coreAlpha = (0.07 + (1 - progress * 0.5) * 0.11) * kickIntensity;
          this.cryoGraphics
            .ellipse(px, py, radX, radY)
            .fill({ color: 0xe8f8ff, alpha: coreAlpha });
        }
      }
    }

    // Low-lying lunar plasma mist layer hugging the base of the arena (Softened)
    const mistY = 1450;
    this.cryoGraphics.moveTo(0, mistY);
    for (let x = 0; x <= 1080; x += 40) {
      const my = mistY + Math.sin(this.time * 2 + x * 0.01) * 10;
      this.cryoGraphics.lineTo(x, my);
    }
    this.cryoGraphics.lineTo(1080, 1530).lineTo(0, 1530).closePath().fill({ color: 0x5500aa, alpha: 0.07 });
  }
}
