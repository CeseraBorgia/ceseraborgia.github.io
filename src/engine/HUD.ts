import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class HUD {
  public container: Container;
  private hudBg: Graphics;
  private partyMeterBg: Graphics;
  private partyMeterFill: Graphics;
  private statusBadge: Graphics;

  private statusText: Text;
  private partyMeterTitle: Text;
  private partyMeterPercent: Text;
  private viewerText: Text;
  private raveBannerText: Text;

  // Party Meter State
  public partyMeter: number = 68; // percentage (0 to 100)
  public isRaveMode: boolean = false;
  private raveTimer: number = 0;
  private viewerCount: number = 32040;
  private time: number = 0;

  constructor() {
    this.container = new Container();
    this.container.label = 'HUDContainer';

    this.hudBg = new Graphics();
    this.container.addChild(this.hudBg);

    this.statusBadge = new Graphics();
    this.container.addChild(this.statusBadge);

    // Left: "((•)) Simulation Mode: ACTIVE"
    this.statusText = new Text({
      text: '((•)) Simulation Mode:\nACTIVE',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0x00ff88,
        lineHeight: 22
      })
    });
    this.statusText.x = 45;
    this.statusText.y = 35;
    this.container.addChild(this.statusText);

    // Center: "PARTY METER"
    this.partyMeterTitle = new Text({
      text: 'PARTY METER',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 22,
        letterSpacing: 2,
        fill: 0xffffff,
        dropShadow: {
          alpha: 0.8,
          angle: 0,
          blur: 8,
          color: 0x00f0ff,
          distance: 0
        }
      })
    });
    this.partyMeterTitle.anchor.set(0.5, 0);
    this.partyMeterTitle.x = 540;
    this.partyMeterTitle.y = 30;
    this.container.addChild(this.partyMeterTitle);

    // Party Meter Bar Container
    this.partyMeterBg = new Graphics();
    this.partyMeterFill = new Graphics();
    this.container.addChild(this.partyMeterBg);
    this.container.addChild(this.partyMeterFill);

    this.partyMeterPercent = new Text({
      text: '68%',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff
      })
    });
    this.partyMeterPercent.anchor.set(0.5);
    this.partyMeterPercent.x = 540;
    this.partyMeterPercent.y = 75;
    this.container.addChild(this.partyMeterPercent);

    // Right: "Viewers 👥 32.0K"
    this.viewerText = new Text({
      text: 'Viewers 👥 32.0K',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff
      })
    });
    this.viewerText.anchor.set(1, 0.5);
    this.viewerText.x = 1040;
    this.viewerText.y = 52;
    this.container.addChild(this.viewerText);

    // Rave Banner Text when 100% full
    this.raveBannerText = new Text({
      text: '⚡ LUNAR SUPER RAVE ACTIVE! ⚡',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 32,
        letterSpacing: 3,
        fill: 0xfff000,
        dropShadow: {
          alpha: 0.9,
          angle: 0,
          blur: 15,
          color: 0xff00bb,
          distance: 0
        }
      })
    });
    this.raveBannerText.anchor.set(0.5);
    this.raveBannerText.x = 540;
    this.raveBannerText.y = 120;
    this.raveBannerText.visible = false;
    this.container.addChild(this.raveBannerText);
  }

  public addPartyScore(amount: number) {
    this.partyMeter = Math.min(100, this.partyMeter + amount);
    if (this.partyMeter >= 100 && !this.isRaveMode) {
      this.triggerSuperRave();
    }
  }

  private triggerSuperRave() {
    this.isRaveMode = true;
    this.raveTimer = 15; // 15 seconds of super rave
    this.raveBannerText.visible = true;
  }

  public setMode(isLive: boolean, username: string = 'avokadobey') {
    if (isLive) {
      this.statusText.text = `🔴 TikTok LIVE:\n@${username}`;
      this.statusText.style.fill = 0x00f0ff;
    } else {
      this.statusText.text = '((•)) Simulation Mode:\nACTIVE';
      this.statusText.style.fill = 0x00ff88;
    }
  }

  public update(dt: number, kickIntensity: number) {
    this.time += dt;

    // Organic viewer fluctuation
    if (Math.random() < 0.05) {
      this.viewerCount += Math.floor((Math.random() - 0.48) * 12);
      const displayK = (this.viewerCount / 1000).toFixed(1);
      this.viewerText.text = `Viewers 👥 ${displayK}K`;
    }

    // Party meter slowly decays if not active
    if (!this.isRaveMode && this.partyMeter > 20) {
      this.partyMeter = Math.max(20, this.partyMeter - dt * 0.4);
    }

    // Super Rave Mode handling
    if (this.isRaveMode) {
      this.raveTimer -= dt;
      this.raveBannerText.scale.set(1 + Math.sin(this.time * 10) * 0.08);
      if (this.raveTimer <= 0) {
        this.isRaveMode = false;
        this.partyMeter = 35;
        this.raveBannerText.visible = false;
      }
    }

    this.partyMeterPercent.text = `${Math.floor(this.partyMeter)}%`;

    // 1. Right Viewer pill background
    this.hudBg.clear();
    const vw = this.viewerText.width + 30;
    this.hudBg
      .roundRect(1040 - vw + 15, 32, vw, 40, 20)
      .fill({ color: 0x0a0e1c, alpha: 0.85 })
      .stroke({ width: 2, color: 0x3d4a6e });

    // 2. Party Meter Bar (Center: x: 340..740, y: 64, w: 400, h: 22)
    const barW = 380;
    const barH = 20;
    const barX = 540 - barW / 2;
    const barY = 65;

    this.partyMeterBg.clear();
    this.partyMeterBg
      .roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 12)
      .fill({ color: 0x0a0d1b, alpha: 0.9 })
      .stroke({
        width: 2.5,
        color: this.isRaveMode ? 0xfff000 : 0x00f0ff,
        alpha: 0.95
      });

    // Party Meter Fill
    this.partyMeterFill.clear();
    const fillW = Math.max(10, (barW * this.partyMeter) / 100);
    const fillColor = this.isRaveMode ? 0xff00bb : 0x00ffcc;

    this.partyMeterFill
      .roundRect(barX, barY, fillW, barH, 10)
      .fill({ color: fillColor, alpha: 0.85 + kickIntensity * 0.15 });

    // Glowing tip
    this.partyMeterFill
      .circle(barX + fillW - 5, barY + barH / 2, 8)
      .fill({ color: 0xffffff, alpha: 0.9 });
  }
}
