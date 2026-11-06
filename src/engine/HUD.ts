import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class HUD {
  public container: Container;
  private partyMeterBg: Graphics;
  private partyMeterFill: Graphics;

  private partyMeterTitle: Text;
  private partyMeterPercent: Text;
  private raveBannerText: Text;

  // Party Meter State
  public partyMeter: number = 15; // Gerçek yayınla birlikte sıfırdan/düşükten başlar
  public isRaveMode: boolean = false;
  private raveTimer: number = 0;
  private time: number = 0;

  constructor() {
    this.container = new Container();
    this.container.label = 'HUDContainer';

    // Center: "PARTY METER"
    this.partyMeterTitle = new Text({
      text: '⚡ PARTY METER ⚡',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 24,
        letterSpacing: 3,
        fill: 0xffffff,
        dropShadow: {
          alpha: 0.85,
          angle: 0,
          blur: 10,
          color: 0x00f0ff,
          distance: 0
        }
      })
    });
    this.partyMeterTitle.anchor.set(0.5, 0);
    this.partyMeterTitle.x = 540;
    this.partyMeterTitle.y = 28;
    this.container.addChild(this.partyMeterTitle);

    // Party Meter Bar Container
    this.partyMeterBg = new Graphics();
    this.partyMeterFill = new Graphics();
    this.container.addChild(this.partyMeterBg);
    this.container.addChild(this.partyMeterFill);

    this.partyMeterPercent = new Text({
      text: '15%',
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

    // Rave Banner Text when 100% full
    this.raveBannerText = new Text({
      text: '⚡ LUNAR SUPER RAVE ACTIVE! ⚡',
      style: new TextStyle({
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 34,
        letterSpacing: 3,
        fill: 0xfff000,
        dropShadow: {
          alpha: 0.95,
          angle: 0,
          blur: 18,
          color: 0xff00bb,
          distance: 0
        }
      })
    });
    this.raveBannerText.anchor.set(0.5);
    this.raveBannerText.x = 540;
    this.raveBannerText.y = 125;
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

  public setMode(_isLive: boolean, _username: string = 'avokadobey') {
    // Üstteki gereksiz yazılar kaldırıldı
  }

  public update(dt: number, kickIntensity: number) {
    this.time += dt;

    // Party meter zamanla yavaşça azalır (etkileşim devam etmezse)
    if (!this.isRaveMode && this.partyMeter > 5) {
      this.partyMeter = Math.max(5, this.partyMeter - dt * 0.3);
    }

    // Super Rave Mode handling
    if (this.isRaveMode) {
      this.raveTimer -= dt;
      this.raveBannerText.scale.set(1 + Math.sin(this.time * 10) * 0.08);
      if (this.raveTimer <= 0) {
        this.isRaveMode = false;
        this.partyMeter = 20;
        this.raveBannerText.visible = false;
      }
    }

    this.partyMeterPercent.text = `${Math.floor(this.partyMeter)}%`;

    // Party Meter Bar (Center: x: 320..760, y: 64, w: 440, h: 22)
    const barW = 420;
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
