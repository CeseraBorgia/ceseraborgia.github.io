import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  AvatarProfile,
  EyewearType,
  HairStyle,
  LaneType,
  TopStyle,
  BottomStyle
} from '../types';
import { ParticleSystem } from './ParticleSystem';

// 5 Natural Skin Tones
const SKIN_TONES = [
  0xffe0bd, // Light / Fair
  0xf5c396, // Warm Peach
  0xd49b6a, // Golden Tan
  0x9d6232, // Warm Caramel
  0x4a2c13  // Deep Espresso
];

// 10 Hair Colors (Natural + Cyber Rave)
const HAIR_COLORS = [
  0x111111, // Jet Black
  0x4a2e18, // Chestnut Brown
  0xd4a359, // Golden Blonde
  0x8b321a, // Auburn Red
  0x00f0ff, // Neon Electric Cyan
  0xff00bb, // Hot Rave Pink
  0x39ff14, // Acid Lime
  0xaa44ff, // Cyber Violet
  0xffea00, // Solar Yellow
  0xe0e6ed  // Silver White
];

// Rave Clothes Palette
const CLOTHES_COLORS = [
  0x1e2433, // Midnight Slate
  0x2b3856, // Deep Space Navy
  0x551a8b, // Neon Purple
  0x8b1a4a, // Rave Magenta
  0x0f5257, // Cyber Teal
  0x4a5d4e, // Olive Camo
  0xff3366, // Hot Coral
  0xffaa00, // Electric Amber
  0x00d4ff, // Cyber Blue
  0x222226, // Matte Stealth Black
  0xf0f3f8, // Lunar Holographic White
  0x330066  // Ultra Violet
];

const ACCENT_COLORS = [
  0x00ffff, 0xff00aa, 0x00ff88, 0xffea00, 0xff3300, 0xaa00ff
];

export function generateAvatarProfile(seedStr: string): AvatarProfile {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const rng = (offset: number) => Math.abs((hash ^ (offset * 2654435761)) % 10000) / 10000;

  const hairStyles: HairStyle[] = [
    'short_fade', 'messy_spikes', 'curly_afro', 'long_ponytail',
    'cyber_braids', 'cap_backwards', 'buzzcut'
  ];
  const eyewearTypes: EyewearType[] = [
    'cyber_visor', 'neon_shades', 'rave_goggles', 'cat_eye', 'none'
  ];
  const topStyles: TopStyle[] = [
    'rave_hoodie', 'crop_top', 'lunar_jacket', 'tech_vest', 'cyber_tee'
  ];
  const bottomStyles: BottomStyle[] = [
    'cargo_pants', 'shorts_leggings', 'space_joggers', 'cyber_jeans'
  ];

  const skinColor = SKIN_TONES[Math.floor(rng(1) * SKIN_TONES.length)];
  const hairStyle = hairStyles[Math.floor(rng(2) * hairStyles.length)];
  const hairColor = HAIR_COLORS[Math.floor(rng(3) * HAIR_COLORS.length)];
  const eyewear = eyewearTypes[Math.floor(rng(4) * eyewearTypes.length)];
  const eyewearColor = ACCENT_COLORS[Math.floor(rng(5) * ACCENT_COLORS.length)];
  const topStyle = topStyles[Math.floor(rng(6) * topStyles.length)];
  const topColor = CLOTHES_COLORS[Math.floor(rng(7) * CLOTHES_COLORS.length)];
  const topAccent = ACCENT_COLORS[Math.floor(rng(8) * ACCENT_COLORS.length)];
  const bottomStyle = bottomStyles[Math.floor(rng(9) * bottomStyles.length)];
  const bottomColor = CLOTHES_COLORS[Math.floor(rng(10) * CLOTHES_COLORS.length)];
  const shoeColor = ACCENT_COLORS[Math.floor(rng(11) * ACCENT_COLORS.length)];
  const glowColor = ACCENT_COLORS[Math.floor(rng(12) * ACCENT_COLORS.length)];
  const hasHeadphones = rng(13) > 0.45;

  return {
    skinColor,
    hairStyle,
    hairColor,
    eyewear,
    eyewearColor,
    topStyle,
    topColor,
    topAccent,
    bottomStyle,
    bottomColor,
    shoeColor,
    glowColor,
    hasHeadphones
  };
}

export class Avatar {
  public id: string;
  public username: string;
  public container: Container;

  // 5 Dance Floor Tiers
  public lane: LaneType;
  public currentScale: number = 0.5;

  // Position
  public x: number;
  public y: number;
  public targetX: number;
  public targetY: number;

  // Jump / Transition Physics (Low-G Arc)
  public isJumping: boolean = false;
  public jumpProgress: number = 0;
  public jumpDuration: number = 1.1;
  public jumpStartX: number = 0;
  public jumpStartY: number = 0;
  public jumpStartScale: number = 0.5;
  public jumpTargetScale: number = 0.5;
  public jumpHeight: number = 130;

  // Tier Fallback Timers
  public likeTierTimer: number = 0; // Tier 3: 60 seconds
  public giftTierTimer: number = 0; // Tier 2: 10 seconds
  public vipTimer: number = 0;      // Tier 1: 15 seconds
  public totalDiamonds: number = 0; // Cumulative gift ranking score
  public isTop3Vip: boolean = false;
  public giftStreak: number = 0;
  public isFollower: boolean = false;

  // Character Visual Model
  public profile: AvatarProfile;
  private characterContainer: Container;
  private legsGfx: Graphics;
  private torsoGfx: Graphics;
  private headGfx: Graphics;
  private leftArmGfx: Graphics;
  private rightArmGfx: Graphics;

  // Name Tag & Speech Bubbles
  private nameContainer: Container;
  private nameText: Text;
  private nameBg: Graphics;
  private speechContainer: Container;
  private speechBubbleGfx: Graphics;
  private speechText: Text;
  private speechTimer: number = 0;

  // VIP FX (Aura & Orbiting Stars)
  private vipGfx: Graphics;

  // Animation Phase
  private animPhaseOffset: number;
  private danceSpeed: number;

  constructor(
    id: string,
    username: string,
    lane: LaneType,
    x: number,
    y: number,
    profile?: AvatarProfile
  ) {
    this.id = id;
    this.username = username;
    this.lane = lane;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.animPhaseOffset = Math.random() * Math.PI * 2;
    this.danceSpeed = 3.2 + Math.random() * 1.6;

    this.profile = profile || generateAvatarProfile(username || id);

    this.container = new Container();
    this.container.label = `Avatar_${username}`;

    // VIP FX behind
    this.vipGfx = new Graphics();
    this.container.addChild(this.vipGfx);

    // Human Character Container (GPU matrix animated)
    this.characterContainer = new Container();
    this.legsGfx = new Graphics();
    this.torsoGfx = new Graphics();
    this.headGfx = new Graphics();
    this.leftArmGfx = new Graphics();
    this.rightArmGfx = new Graphics();

    // Layering inside character
    this.characterContainer.addChild(this.legsGfx);
    this.characterContainer.addChild(this.torsoGfx);
    this.characterContainer.addChild(this.leftArmGfx);
    this.characterContainer.addChild(this.rightArmGfx);
    this.characterContainer.addChild(this.headGfx);
    this.container.addChild(this.characterContainer);

    // Build the visual graphics once (GPU-efficient!)
    this.buildHumanModel();

    // Name Tag
    this.nameContainer = new Container();
    this.nameBg = new Graphics();
    this.nameText = new Text({
      text: `@${username}`,
      style: new TextStyle({
        fontFamily: 'Orbitron, Arial, sans-serif',
        fontSize: 15,
        fontWeight: 'bold',
        fill: 0xffffff
      })
    });
    this.nameText.anchor.set(0.5);
    this.nameContainer.addChild(this.nameBg);
    this.nameContainer.addChild(this.nameText);
    this.container.addChild(this.nameContainer);
    this.updateNameTag();

    // Comic Speech Bubble
    this.speechContainer = new Container();
    this.speechContainer.visible = false;
    this.speechBubbleGfx = new Graphics();
    this.speechText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 17,
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
  }

  public updateLaneScale() {
    let target = 0.35;
    if (this.lane === 'tier5_viewer') target = 0.35;
    else if (this.lane === 'tier4_follower') target = 0.52;
    else if (this.lane === 'tier3_liker') target = 0.72;
    else if (this.lane === 'tier2_gifter') target = 0.98;
    else if (this.lane === 'tier1_vip') target = 1.28;

    this.currentScale = target;
    this.container.scale.set(this.currentScale);

    // Visual Optimization: In Tiers 4 & 5 hide dense name tags to avoid clutter
    // Only active interactors (VIP Tier 1, Gifters Tier 2, Likers Tier 3) show prominent name tags
    this.nameContainer.visible = this.lane === 'tier1_vip' || this.lane === 'tier2_gifter' || this.lane === 'tier3_liker';
  }

  // Draw the human character once with rich variety
  private buildHumanModel() {
    const p = this.profile;

    // 1. LEGS & SHOES (Bottom outfit)
    const legG = this.legsGfx;
    legG.clear();

    const legW = 14;
    const legH = 40;
    const legLeftX = -18;
    const legRightX = 4;
    const legY = 20;

    // Pants / Bottoms
    if (p.bottomStyle === 'shorts_leggings') {
      // Dark compression leggings
      legG.roundRect(legLeftX, legY, legW, legH, 4).fill({ color: 0x111622 });
      legG.roundRect(legRightX, legY, legW, legH, 4).fill({ color: 0x111622 });
      // Shorts on top
      legG.roundRect(legLeftX - 3, legY, legW + 6, 20, 5).fill({ color: p.bottomColor });
      legG.roundRect(legRightX - 3, legY, legW + 6, 20, 5).fill({ color: p.bottomColor });
    } else {
      // Cargo pants / space joggers
      legG.roundRect(legLeftX, legY, legW, legH, 5)
        .fill({ color: p.bottomColor })
        .stroke({ width: 1.5, color: 0x111622 });
      legG.roundRect(legRightX, legY, legW, legH, 5)
        .fill({ color: p.bottomColor })
        .stroke({ width: 1.5, color: 0x111622 });

      // Neon side stripes / buckle straps on joggers/cargo
      if (p.bottomStyle === 'space_joggers' || p.bottomStyle === 'cargo_pants') {
        legG.rect(legLeftX, legY + 8, 3, 24).fill({ color: p.topAccent });
        legG.rect(legRightX + legW - 3, legY + 8, 3, 24).fill({ color: p.topAccent });
      }
    }

    // High-top Rave Sneakers / Boots
    const shoeY = legY + legH - 2;
    // Left shoe
    legG.roundRect(legLeftX - 5, shoeY, legW + 8, 12, 4)
      .fill({ color: 0x1b2233 })
      .stroke({ width: 1.5, color: p.shoeColor });
    legG.rect(legLeftX - 5, shoeY + 9, legW + 8, 3)
      .fill({ color: p.shoeColor }); // Glowing sole

    // Right shoe
    legG.roundRect(legRightX - 3, shoeY, legW + 8, 12, 4)
      .fill({ color: 0x1b2233 })
      .stroke({ width: 1.5, color: p.shoeColor });
    legG.rect(legRightX - 3, shoeY + 9, legW + 8, 3)
      .fill({ color: p.shoeColor }); // Glowing sole

    // 2. TORSO & CLOTHES
    const torsoG = this.torsoGfx;
    torsoG.clear();

    const torsoW = 46;
    const torsoH = 48;
    const torsoX = -torsoW / 2;
    const torsoY = -26;

    // Mini space/oxygen cyber pack on back (lunar rave aesthetic)
    torsoG.roundRect(torsoX + 6, torsoY - 4, torsoW - 12, torsoH - 6, 8)
      .fill({ color: 0x151c2c })
      .stroke({ width: 1.5, color: p.glowColor, alpha: 0.8 });
    // Battery glow line
    torsoG.roundRect(torsoX + 16, torsoY + 2, torsoW - 32, 10, 3)
      .fill({ color: p.glowColor, alpha: 0.85 });

    // Main Upper Body Clothes
    if (p.topStyle === 'crop_top') {
      // Exposed midriff skin
      torsoG.roundRect(torsoX + 4, torsoY + 24, torsoW - 8, 18, 4)
        .fill({ color: p.skinColor });
      // Crop top
      torsoG.roundRect(torsoX + 2, torsoY, torsoW - 4, 26, 8)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: p.topAccent });
      // Rave straps across chest
      torsoG.moveTo(torsoX + 6, torsoY + 6)
        .lineTo(torsoX + torsoW - 6, torsoY + 20)
        .stroke({ width: 2, color: p.topAccent });
    } else if (p.topStyle === 'tech_vest') {
      // Inner tee
      torsoG.roundRect(torsoX + 3, torsoY, torsoW - 6, torsoH, 8)
        .fill({ color: 0x111622 });
      // Tactical neon vest
      torsoG.roundRect(torsoX, torsoY + 2, torsoW, torsoH - 8, 8)
        .fill({ color: p.topColor })
        .stroke({ width: 2, color: p.topAccent });
      // Glowing tech battery cells on vest
      torsoG.circle(torsoX + 12, torsoY + 18, 4).fill({ color: p.topAccent });
      torsoG.circle(torsoX + torsoW - 12, torsoY + 18, 4).fill({ color: p.topAccent });
    } else if (p.topStyle === 'rave_hoodie') {
      // Loose hoodie
      torsoG.roundRect(torsoX - 3, torsoY - 2, torsoW + 6, torsoH + 2, 10)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: 0x111622 });
      // Kangaroo pocket
      torsoG.roundRect(torsoX + 6, torsoY + 24, torsoW - 12, 18, 5)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: p.topAccent });
      // Glowing drawstrings
      torsoG.rect(torsoX + 16, torsoY + 4, 3, 14).fill({ color: p.topAccent });
      torsoG.rect(torsoX + torsoW - 19, torsoY + 4, 3, 14).fill({ color: p.topAccent });
    } else {
      // Lunar Jacket / Cyber Tee
      torsoG.roundRect(torsoX, torsoY, torsoW, torsoH, 9)
        .fill({ color: p.topColor })
        .stroke({ width: 2, color: 0x111622 });
      // Graphic cyber logo on chest
      torsoG.roundRect(torsoX + 12, torsoY + 10, torsoW - 24, 20, 4)
        .fill({ color: 0x111622 })
        .stroke({ width: 1.5, color: p.topAccent });
      torsoG.circle(0, torsoY + 20, 5).fill({ color: p.topAccent });
    }

    // 3. ARMS & HANDS (Left & Right)
    // Left arm
    const armW = 10;
    this.leftArmGfx.clear();
    this.leftArmGfx.position.set(-22, torsoY + 6);
    this.leftArmGfx.roundRect(-armW / 2, 0, armW, 36, 5)
      .fill({ color: p.topColor })
      .stroke({ width: 1.5, color: 0x111622 });
    // Hand (Skin tone + glow wristband)
    this.leftArmGfx.rect(-armW / 2, 26, armW, 3).fill({ color: p.topAccent });
    this.leftArmGfx.circle(0, 36, 6)
      .fill({ color: p.skinColor });

    // Right arm
    this.rightArmGfx.clear();
    this.rightArmGfx.position.set(22, torsoY + 6);
    this.rightArmGfx.roundRect(-armW / 2, 0, armW, 36, 5)
      .fill({ color: p.topColor })
      .stroke({ width: 1.5, color: 0x111622 });
    // Hand
    this.rightArmGfx.rect(-armW / 2, 26, armW, 3).fill({ color: p.topAccent });
    this.rightArmGfx.circle(0, 36, 6)
      .fill({ color: p.skinColor });

    // 4. HEAD, FACE, HAIR & EYEWEAR
    const headG = this.headGfx;
    headG.clear();

    const headCenterY = -48;
    const headR = 19;

    // Neck
    headG.rect(-6, headCenterY + 14, 12, 10).fill({ color: p.skinColor });

    // Headphones around neck if equipped
    if (p.hasHeadphones) {
      headG.ellipse(0, headCenterY + 16, 21, 9)
        .stroke({ width: 5, color: p.glowColor });
      headG.roundRect(-24, headCenterY + 11, 8, 12, 3)
        .fill({ color: 0x111622 })
        .stroke({ width: 1.5, color: p.glowColor });
      headG.roundRect(16, headCenterY + 11, 8, 12, 3)
        .fill({ color: 0x111622 })
        .stroke({ width: 1.5, color: p.glowColor });
    }

    // Human Head / Face Base
    headG.ellipse(0, headCenterY, headR - 1, headR + 2)
      .fill({ color: p.skinColor })
      .stroke({ width: 1.5, color: 0x221a14 });

    // Human Eyes (if no full visor)
    if (p.eyewear === 'none' || p.eyewear === 'neon_shades' || p.eyewear === 'cat_eye') {
      // Left eye
      headG.ellipse(-7, headCenterY - 1, 3.5, 2.5).fill({ color: 0xffffff });
      headG.circle(-6.5, headCenterY - 1, 1.8).fill({ color: 0x241810 });
      // Right eye
      headG.ellipse(7, headCenterY - 1, 3.5, 2.5).fill({ color: 0xffffff });
      headG.circle(6.5, headCenterY - 1, 1.8).fill({ color: 0x241810 });

      // Eyebrows
      headG.rect(-10, headCenterY - 6, 6, 1.8).fill({ color: p.hairColor });
      headG.rect(4, headCenterY - 6, 6, 1.8).fill({ color: p.hairColor });

      // Subtle smile
      headG.ellipse(0, headCenterY + 8, 4, 2).stroke({ width: 1.5, color: 0x5a2d1d });
    }

    // Eyewear
    if (p.eyewear === 'cyber_visor') {
      // Daft Punk style horizontal glowing visor
      headG.roundRect(-16, headCenterY - 4, 32, 10, 4)
        .fill({ color: 0x05070e })
        .stroke({ width: 2, color: p.eyewearColor });
      headG.rect(-13, headCenterY - 1, 26, 4)
        .fill({ color: p.eyewearColor });
    } else if (p.eyewear === 'neon_shades') {
      // Cool dark shades with glowing rims
      headG.roundRect(-15, headCenterY - 4, 13, 8, 2)
        .fill({ color: 0x08080c })
        .stroke({ width: 1.5, color: p.eyewearColor });
      headG.roundRect(2, headCenterY - 4, 13, 8, 2)
        .fill({ color: 0x08080c })
        .stroke({ width: 1.5, color: p.eyewearColor });
      headG.rect(-2, headCenterY - 2, 4, 2).fill({ color: p.eyewearColor });
    } else if (p.eyewear === 'rave_goggles') {
      // Cyber goggles with glowing twin lenses
      headG.circle(-8, headCenterY - 2, 7)
        .fill({ color: 0x111625 })
        .stroke({ width: 2, color: p.eyewearColor });
      headG.circle(-8, headCenterY - 2, 4)
        .fill({ color: p.eyewearColor, alpha: 0.9 });

      headG.circle(8, headCenterY - 2, 7)
        .fill({ color: 0x111625 })
        .stroke({ width: 2, color: p.eyewearColor });
      headG.circle(8, headCenterY - 2, 4)
        .fill({ color: p.eyewearColor, alpha: 0.9 });
    } else if (p.eyewear === 'cat_eye') {
      // Sharp cat eye rave frames
      headG.moveTo(-16, headCenterY - 5)
        .lineTo(-1, headCenterY - 1)
        .lineTo(-3, headCenterY + 4)
        .lineTo(-15, headCenterY + 1)
        .closePath()
        .fill({ color: 0x090d18 })
        .stroke({ width: 1.5, color: p.eyewearColor });
      headG.moveTo(16, headCenterY - 5)
        .lineTo(1, headCenterY - 1)
        .lineTo(3, headCenterY + 4)
        .lineTo(15, headCenterY + 1)
        .closePath()
        .fill({ color: 0x090d18 })
        .stroke({ width: 1.5, color: p.eyewearColor });
    }

    // Hair Styles
    const hairY = headCenterY - 12;
    if (p.hairStyle === 'curly_afro') {
      // Full afro puff
      headG.circle(0, hairY - 3, 21).fill({ color: p.hairColor });
      headG.circle(-12, hairY - 2, 11).fill({ color: p.hairColor });
      headG.circle(12, hairY - 2, 11).fill({ color: p.hairColor });
    } else if (p.hairStyle === 'messy_spikes') {
      // Spiky anime rave hair
      headG.circle(0, hairY, 17).fill({ color: p.hairColor });
      // Spikes
      headG.moveTo(-14, hairY - 2).lineTo(-18, hairY - 16).lineTo(-8, hairY - 8).fill({ color: p.hairColor });
      headG.moveTo(-8, hairY - 8).lineTo(-4, hairY - 20).lineTo(4, hairY - 8).fill({ color: p.hairColor });
      headG.moveTo(4, hairY - 8).lineTo(14, hairY - 18).lineTo(12, hairY - 2).fill({ color: p.hairColor });
    } else if (p.hairStyle === 'long_ponytail') {
      // Hair on top
      headG.circle(0, hairY, 17).fill({ color: p.hairColor });
      // Flowing ponytail to the left/back
      headG.roundRect(-24, hairY - 4, 12, 32, 6).fill({ color: p.hairColor });
      headG.circle(-18, hairY + 28, 5).fill({ color: p.hairColor });
    } else if (p.hairStyle === 'cyber_braids') {
      // Braids with neon beads
      headG.circle(0, hairY, 16).fill({ color: p.hairColor });
      // Braids dropping on sides
      headG.roundRect(-19, hairY + 2, 5, 24, 2).fill({ color: p.hairColor });
      headG.rect(-19, hairY + 20, 5, 3).fill({ color: p.topAccent }); // Neon bead
      headG.roundRect(14, hairY + 2, 5, 24, 2).fill({ color: p.hairColor });
      headG.rect(14, hairY + 20, 5, 3).fill({ color: p.topAccent }); // Neon bead
    } else if (p.hairStyle === 'cap_backwards') {
      // Backwards streetwear cap
      headG.roundRect(-18, hairY - 4, 36, 16, 8)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: p.topAccent });
      // Backwards brim
      headG.roundRect(-14, hairY + 8, 28, 5, 2)
        .fill({ color: p.topAccent });
    } else {
      // Short fade / buzzcut
      headG.circle(0, hairY + 2, 17).fill({ color: p.hairColor });
    }
  }

  public updateNameTag() {
    const textWidth = this.nameText.width + 18;
    const textHeight = 24;

    this.nameBg.clear();
    const borderColor = this.isTop3Vip ? 0xffea00 : this.lane === 'tier2_gifter' ? 0xff00bb : 0x00e5ff;

    this.nameBg
      .roundRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10)
      .fill({ color: 0x090d1a, alpha: 0.85 })
      .stroke({
        width: 2,
        color: borderColor,
        alpha: 0.95
      });

    this.nameContainer.y = 78;
  }

  // Comic speech bubble
  public say(message: string, duration: number = 4.5) {
    this.speechText.text = message;
    const paddingX = 20;
    const paddingY = 14;
    const bw = Math.max(75, this.speechText.width + paddingX * 2);
    const bh = Math.max(42, this.speechText.height + paddingY * 2);

    this.speechBubbleGfx.clear();

    // Drop shadow
    this.speechBubbleGfx
      .roundRect(-bw / 2 + 2, -bh - 95, bw, bh, 12)
      .fill({ color: 0x000000, alpha: 0.45 });

    // Bubble body
    const strokeColor = this.isTop3Vip ? 0xffea00 : this.lane === 'tier2_gifter' ? 0xff00bb : 0x00d4ff;
    this.speechBubbleGfx
      .roundRect(-bw / 2, -bh - 97, bw, bh, 12)
      .fill({ color: 0xf5f8ff })
      .stroke({
        width: 3,
        color: strokeColor,
        alpha: 1.0
      });

    // Pointer tail
    this.speechBubbleGfx
      .moveTo(-8, -97)
      .lineTo(0, -82)
      .lineTo(8, -97)
      .closePath()
      .fill({ color: 0xf5f8ff })
      .stroke({ width: 2, color: strokeColor });

    this.speechText.x = 0;
    this.speechText.y = -bh / 2 - 97;

    this.speechContainer.visible = true;
    this.speechContainer.alpha = 1.0;
    this.speechTimer = duration;
  }

  // Parabolic Low-G arc jump to new position & tier
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

    let targetS = 0.35;
    if (newLane === 'tier5_viewer') targetS = 0.35;
    else if (newLane === 'tier4_follower') targetS = 0.52;
    else if (newLane === 'tier3_liker') targetS = 0.72;
    else if (newLane === 'tier2_gifter') targetS = 0.98;
    else if (newLane === 'tier1_vip') targetS = 1.28;

    this.jumpTargetScale = targetS;
    this.jumpHeight = Math.abs(targetY - this.y) * 0.35 + 90;
  }

  public update(dt: number, time: number, kickIntensity: number, particles: ParticleSystem) {
    // 1. Jump Physics (Parabolic arc)
    if (this.isJumping) {
      this.jumpProgress += dt / this.jumpDuration;

      if (this.jumpProgress >= 1.0) {
        this.jumpProgress = 1.0;
        this.isJumping = false;
        this.x = this.targetX;
        this.y = this.targetY;
        this.currentScale = this.jumpTargetScale;
        this.updateLaneScale();

        // Landing dust effect
        if (this.lane === 'tier1_vip' || this.lane === 'tier2_gifter') {
          particles.triggerSmallGift(this.x, this.y + 35 * this.currentScale, this.profile.glowColor);
        }
      } else {
        const p = this.jumpProgress;
        const easeX = 0.5 - 0.5 * Math.cos(p * Math.PI);
        this.x = this.jumpStartX + (this.targetX - this.jumpStartX) * easeX;

        const baseCurY = this.jumpStartY + (this.targetY - this.jumpStartY) * p;
        const arcY = Math.sin(p * Math.PI) * this.jumpHeight;
        this.y = baseCurY - arcY;

        this.currentScale = this.jumpStartScale + (this.jumpTargetScale - this.jumpStartScale) * p;
        this.container.scale.set(this.currentScale);

        // Jetpack thruster sparks during jump
        if (Math.random() < 0.45 && (this.lane === 'tier1_vip' || this.lane === 'tier2_gifter' || this.lane === 'tier3_liker')) {
          particles.emitJetpackThruster(
            this.x,
            this.y + 15 * this.currentScale,
            this.profile.glowColor,
            1
          );
        }
      }
    }

    // 2. Speech Bubble Timer
    if (this.speechTimer > 0) {
      this.speechTimer -= dt;
      if (this.speechTimer < 0.5) {
        this.speechContainer.alpha = Math.max(0, this.speechTimer / 0.5);
      }
      this.speechContainer.y = Math.sin(time * 3 + this.animPhaseOffset) * 3;
      if (this.speechTimer <= 0) {
        this.speechContainer.visible = false;
      }
    }

    // 3. Low-G Dance Movement (GPU Matrix Translation - ZERO DRAW CALLS!)
    this.container.x = this.x;
    this.container.y = this.y;

    const phase = time * this.danceSpeed + this.animPhaseOffset;
    let bounce = 0;
    let sway = 0;
    let armRot = 0;

    if (this.lane === 'tier1_vip') {
      // High-energy VIP dance with hands in the air!
      bounce = -Math.abs(Math.sin(phase * 1.5)) * 26 * (0.8 + kickIntensity * 0.5);
      sway = Math.sin(phase * 0.75) * 0.12;
      armRot = 2.4 + Math.sin(phase * 1.5) * 0.45;
    } else if (this.lane === 'tier2_gifter') {
      // Excited gifter dance with hands waving!
      bounce = -Math.abs(Math.sin(phase * 1.3)) * 18 * (0.7 + kickIntensity * 0.4);
      sway = Math.sin(phase * 0.65) * 0.08;
      armRot = 1.9 + Math.sin(phase * 1.3) * 0.35;
    } else if (this.lane === 'tier3_liker') {
      // Liker bounce with heart rhythm
      bounce = -Math.abs(Math.sin(phase * 1.1)) * 14 * (0.6 + kickIntensity * 0.4);
      sway = Math.sin(phase * 0.5) * 0.06;
      armRot = Math.sin(phase * 1.1) * 0.4;
    } else if (this.lane === 'tier4_follower') {
      // Follower rhythm bounce
      bounce = -Math.abs(Math.sin(phase)) * 10 * (0.5 + kickIntensity * 0.3);
      sway = Math.sin(phase * 0.4) * 0.05;
      armRot = Math.sin(phase) * 0.3;
    } else {
      // Tier 5 (Ambient lurkers: gentle sway)
      bounce = -Math.abs(Math.sin(phase * 0.8)) * 6;
      sway = Math.sin(phase * 0.3) * 0.03;
      armRot = Math.sin(phase * 0.8) * 0.15;
    }

    this.characterContainer.y = bounce;
    this.characterContainer.rotation = sway;
    this.leftArmGfx.rotation = armRot;
    this.rightArmGfx.rotation = -armRot;

    // 4. VIP Podium Aura & Orbiting Stars (Tier 1 & Tier 2)
    this.renderVipEffects(time, kickIntensity);
  }

  private renderVipEffects(time: number, kick: number) {
    this.vipGfx.clear();

    if (this.lane === 'tier1_vip') {
      // Golden Floor Ring
      const ringR = 56 + kick * 10;
      this.vipGfx
        .ellipse(0, 72, ringR, ringR * 0.35)
        .stroke({ width: 3.5, color: 0xffea00, alpha: 0.95 });
      this.vipGfx
        .ellipse(0, 72, ringR * 0.7, ringR * 0.25)
        .stroke({ width: 2, color: 0xff00bb, alpha: 0.85 });

      // Orbiting Golden Stars
      for (let i = 0; i < 4; i++) {
        const ang = time * 3.5 + (i * Math.PI * 2) / 4;
        const sx = Math.cos(ang) * 52;
        const sy = -48 + Math.sin(ang) * 20;

        this.vipGfx.circle(sx, sy, 4.5).fill({ color: 0xffea00 });
        this.vipGfx.moveTo(sx - 7, sy).lineTo(sx + 7, sy).stroke({ width: 1.5, color: 0xffffff });
        this.vipGfx.moveTo(sx, sy - 7).lineTo(sx, sy + 7).stroke({ width: 1.5, color: 0xffffff });
      }
    } else if (this.lane === 'tier2_gifter') {
      // Neon Magenta Floor Ring
      const ringR = 45 + kick * 6;
      this.vipGfx
        .ellipse(0, 68, ringR, ringR * 0.32)
        .stroke({ width: 2.5, color: 0xff00bb, alpha: 0.85 });
    }
  }
}
