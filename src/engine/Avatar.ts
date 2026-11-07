import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  AvatarProfile,
  DanceStyle,
  EyewearType,
  HairStyle,
  LaneType,
  TopStyle,
  BottomStyle
} from '../types';
import { ParticleSystem } from './ParticleSystem';

// 6 Diverse Natural Human Skin Tones
const SKIN_TONES = [
  0xffdfc4, // Fair / Light Ivory
  0xf0c08a, // Warm Peach
  0xdba377, // Golden Olive / Tan
  0xa86e3b, // Rich Caramel
  0x784421, // Deep Bronze
  0x472714  // Deep Espresso
];

// Eye Iris Colors
const EYE_COLORS = [
  0x3d2314, // Deep Brown
  0x1b4d3e, // Forest Green
  0x1e3f66, // Ocean Blue
  0x6e431f, // Amber / Hazel
  0x00d4ff, // Cyber Cyan
  0x8a2be2  // Cyber Violet
];

// 10 Hair Colors (Natural + Cyber Rave)
const HAIR_COLORS = [
  0x151515, // Jet Black
  0x402511, // Dark Brown
  0xd19d53, // Honey Blonde
  0x872912, // Auburn Ginger
  0x00f0ff, // Neon Electric Cyan
  0xff00bb, // Hot Rave Pink
  0x39ff14, // Acid Lime
  0x9933ff, // Cyber Purple
  0xffea00, // Solar Yellow
  0xdce2ec  // Platinum White
];

// Rave Clothes Palette
const CLOTHES_COLORS = [
  0x161a29, // Midnight Slate
  0x1e2e4e, // Deep Space Navy
  0x4c166d, // Neon Purple
  0x7c1448, // Rave Magenta
  0x0f4b52, // Cyber Teal
  0x3b4a3e, // Olive Camo
  0xff2a5f, // Hot Coral
  0xff9900, // Electric Amber
  0x00c8f8, // Cyber Blue
  0x1c1c22, // Matte Stealth Black
  0xe8ecf5, // Lunar Holographic White
  0x2a0052  // Ultra Violet
];

const ACCENT_COLORS = [
  0x00ffff, 0xff00aa, 0x00ff88, 0xffea00, 0xff3300, 0xaa00ff
];

// High-diffusion FNV-1a Hash + Bit-Avalanche for maximum avatar diversity
export function generateAvatarProfile(seedStr: string): AvatarProfile {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }

  const rng = (offset: number) => {
    let s = (h ^ (offset * 0x45d9f3b)) >>> 0;
    s = ((s >> 16) ^ s) * 0x45d9f3b;
    s = ((s >> 16) ^ s) * 0x45d9f3b;
    s = (s >> 16) ^ s;
    return (s >>> 0) / 4294967296;
  };

  const hairStyles: HairStyle[] = [
    'short_fade', 'messy_spikes', 'curly_afro', 'long_ponytail',
    'cyber_braids', 'cap_backwards', 'curtains_parted', 'buzzcut'
  ];
  const eyewearTypes: EyewearType[] = [
    'none', 'none', 'none', // 50% natural faces without eyewear
    'cyber_visor', 'neon_shades', 'rave_goggles'
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
  const eyeColor = EYE_COLORS[Math.floor(rng(4) * EYE_COLORS.length)];
  const eyewear = eyewearTypes[Math.floor(rng(5) * eyewearTypes.length)];
  const eyewearColor = ACCENT_COLORS[Math.floor(rng(6) * ACCENT_COLORS.length)];
  const topStyle = topStyles[Math.floor(rng(7) * topStyles.length)];
  const topColor = CLOTHES_COLORS[Math.floor(rng(8) * CLOTHES_COLORS.length)];
  const topAccent = ACCENT_COLORS[Math.floor(rng(9) * ACCENT_COLORS.length)];
  const bottomStyle = bottomStyles[Math.floor(rng(10) * bottomStyles.length)];
  const bottomColor = CLOTHES_COLORS[Math.floor(rng(11) * CLOTHES_COLORS.length)];
  const shoeColor = ACCENT_COLORS[Math.floor(rng(12) * ACCENT_COLORS.length)];
  const glowColor = ACCENT_COLORS[Math.floor(rng(13) * ACCENT_COLORS.length)];
  const hasHeadphones = rng(14) > 0.6;
  const hasPiercing = rng(15) > 0.65;

  return {
    skinColor,
    hairStyle,
    hairColor,
    eyeColor,
    eyewear,
    eyewearColor,
    topStyle,
    topColor,
    topAccent,
    bottomStyle,
    bottomColor,
    shoeColor,
    glowColor,
    hasHeadphones,
    hasPiercing
  };
}

export class Avatar {
  public id: string;
  public username: string;
  public container: Container;

  // Lane & Transform
  public lane: LaneType;
  public currentScale: number = 0.50;

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
  public jumpStartScale: number = 0.50;
  public jumpTargetScale: number = 0.50;
  public jumpHeight: number = 130;

  // Timers & User Metrics
  public likeCount: number = 0;      // 50 likes -> character morphs
  public costumeTimer: number = 0;   // 5 minutes (300s) -> character morphs
  public likeTierTimer: number = 0;  // Tier 3: 60s
  public djStageTimer: number = 0;   // DJ Stage VIP: 180s (3 dakika)
  public totalDiamonds: number = 0;  // Cumulative gift diamonds
  public isFollower: boolean = false;
  public isPlaceholder: boolean = false; // Başlangıç dummy avatarı mı?
  public giftStreak: number = 0;

  // Dance Style
  public danceStyle: DanceStyle;

  // Visual Model
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

  // VIP Aura FX
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
    this.danceSpeed = 3.0 + Math.random() * 1.8;

    const danceStyles: DanceStyle[] = [
      'hands_up_rave', 'shuffle_groove', 'headbang_bounce',
      'hiphop_dab', 'disco_point', 'lunar_bounce', 'zero_g_float'
    ];
    this.danceStyle = danceStyles[Math.floor(Math.random() * danceStyles.length)];

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

    this.characterContainer.addChild(this.legsGfx);
    this.characterContainer.addChild(this.torsoGfx);
    this.characterContainer.addChild(this.leftArmGfx);
    this.characterContainer.addChild(this.rightArmGfx);
    this.characterContainer.addChild(this.headGfx);
    this.container.addChild(this.characterContainer);

    // Build the detailed human model
    this.buildHumanModel();

    // Name Tag
    this.nameContainer = new Container();
    this.nameBg = new Graphics();
    this.nameText = new Text({
      text: `@${username}`,
      style: new TextStyle({
        fontFamily: 'Orbitron, Arial, sans-serif',
        fontSize: 16,
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
  }

  // Update scale according to new 4-tier + DJ Stage system
  public updateLaneScale() {
    let target = 0.50;
    if (this.lane === 'tier1_viewer') target = 0.50;      // En arka: 0.50
    else if (this.lane === 'tier2_follower') target = 0.68; // Bir ön: 0.68
    else if (this.lane === 'tier3_liker') target = 0.90;    // Bir ön: 0.90
    else if (this.lane === 'tier4_gifter') target = 1.15;   // En ön: 1.15 (Hediye atanlar kalıcı en önde)
    else if (this.lane === 'dj_stage') target = 1.35;       // DJ yanı VIP: 1.35

    this.currentScale = target;
    this.container.scale.set(this.currentScale);

    // Sadece DJ Stage VIP ve En Ön Sıradaki Hediye Atanlar (Tier 4) için isim etiketi gösterilir
    // Böylece kalabalık dans pisti tertemiz ve net görünür
    this.nameContainer.visible = this.lane === 'dj_stage' || this.lane === 'tier4_gifter';
  }

  // Mutate appearance when 50 likes reached or 5 minutes elapsed
  public mutateCostume(particles?: ParticleSystem) {
    const salt = `${Date.now()}_${Math.random()}`;
    this.profile = generateAvatarProfile(this.username + salt);
    this.buildHumanModel();
    this.updateNameTag();

    // Sparkle transform FX
    if (particles) {
      particles.triggerSmallGift(this.x, this.y, this.profile.glowColor);
    }
  }

  // Register like and check 50-like threshold
  public registerLike(particles?: ParticleSystem) {
    this.likeCount++;
    if (this.likeCount % 50 === 0) {
      this.mutateCostume(particles);
      this.say(`✨ 50 BEĞENİ! Yeni Stil! ✨`, 4);
    }
  }

  // Draw the detailed human character (Face with eyes, eyebrows, nose, mouth, hair, ears, clothes)
  private buildHumanModel() {
    const p = this.profile;

    // 1. LEGS & PANTS
    const legG = this.legsGfx;
    legG.clear();

    const legW = 14;
    const legH = 50;
    const legY = 22;
    const legLeftX = -18;
    const legRightX = 4;

    if (p.bottomStyle === 'shorts_leggings') {
      // Shorts with cyber leggings underneath
      legG.roundRect(legLeftX, legY, legW, 20, 4).fill({ color: p.bottomColor });
      legG.roundRect(legRightX, legY, legW, 20, 4).fill({ color: p.bottomColor });
      legG.roundRect(legLeftX + 1, legY + 20, legW - 2, 30, 2).fill({ color: 0x111622 });
      legG.roundRect(legRightX + 1, legY + 20, legW - 2, 30, 2).fill({ color: 0x111622 });
      legG.rect(legLeftX, legY + 36, legW, 2.5).fill({ color: p.glowColor });
      legG.rect(legRightX, legY + 36, legW, 2.5).fill({ color: p.glowColor });
    } else {
      // Cargo pants / space joggers / cyber jeans
      legG.roundRect(legLeftX, legY, legW, legH, 5)
        .fill({ color: p.bottomColor })
        .stroke({ width: 1.5, color: 0x111622 });
      legG.roundRect(legRightX, legY, legW, legH, 5)
        .fill({ color: p.bottomColor })
        .stroke({ width: 1.5, color: 0x111622 });

      if (p.bottomStyle === 'cargo_pants') {
        legG.roundRect(legLeftX - 3, legY + 16, 5, 14, 2)
          .fill({ color: p.bottomColor })
          .stroke({ width: 1, color: p.glowColor });
        legG.roundRect(legRightX + legW - 2, legY + 16, 5, 14, 2)
          .fill({ color: p.bottomColor })
          .stroke({ width: 1, color: p.glowColor });
      } else {
        legG.rect(legLeftX, legY + 22, legW, 2).fill({ color: p.glowColor });
        legG.rect(legRightX, legY + 22, legW, 2).fill({ color: p.glowColor });
      }
    }

    // High-top Rave Sneakers with Glowing Neon Soles
    const shoeY = legY + legH - 2;
    legG.roundRect(legLeftX - 5, shoeY, legW + 8, 12, 4)
      .fill({ color: 0x1a2233 })
      .stroke({ width: 1.5, color: p.shoeColor });
    legG.rect(legLeftX - 5, shoeY + 9, legW + 8, 3)
      .fill({ color: p.shoeColor });

    legG.roundRect(legRightX - 3, shoeY, legW + 8, 12, 4)
      .fill({ color: 0x1a2233 })
      .stroke({ width: 1.5, color: p.shoeColor });
    legG.rect(legRightX - 3, shoeY + 9, legW + 8, 3)
      .fill({ color: p.shoeColor });

    // 2. TORSO & CLOTHES
    const torsoG = this.torsoGfx;
    torsoG.clear();

    const torsoW = 46;
    const torsoH = 48;
    const torsoX = -torsoW / 2;
    const torsoY = -26;

    // Mini cyber backpack with glowing energy cell
    torsoG.roundRect(torsoX + 6, torsoY - 4, torsoW - 12, torsoH - 6, 8)
      .fill({ color: 0x151c2c })
      .stroke({ width: 1.5, color: p.glowColor, alpha: 0.8 });
    torsoG.roundRect(torsoX + 16, torsoY + 2, torsoW - 32, 10, 3)
      .fill({ color: p.glowColor, alpha: 0.85 });

    // Upper body tops
    if (p.topStyle === 'crop_top') {
      torsoG.roundRect(torsoX + 4, torsoY + 24, torsoW - 8, 18, 4).fill({ color: p.skinColor });
      torsoG.roundRect(torsoX + 2, torsoY, torsoW - 4, 26, 8)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: p.topAccent });
      torsoG.moveTo(torsoX + 6, torsoY + 6)
        .lineTo(torsoX + torsoW - 6, torsoY + 20)
        .stroke({ width: 2, color: p.topAccent });
    } else if (p.topStyle === 'tech_vest') {
      torsoG.roundRect(torsoX + 3, torsoY, torsoW - 6, torsoH, 8).fill({ color: 0x111622 });
      torsoG.roundRect(torsoX, torsoY + 2, torsoW, torsoH - 8, 8)
        .fill({ color: p.topColor })
        .stroke({ width: 2, color: p.topAccent });
      torsoG.circle(torsoX + 12, torsoY + 18, 4).fill({ color: p.topAccent });
      torsoG.circle(torsoX + torsoW - 12, torsoY + 18, 4).fill({ color: p.topAccent });
    } else if (p.topStyle === 'rave_hoodie') {
      torsoG.roundRect(torsoX - 3, torsoY - 2, torsoW + 6, torsoH + 2, 10)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: 0x111622 });
      torsoG.roundRect(torsoX + 6, torsoY + 24, torsoW - 12, 18, 5)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: p.topAccent });
      torsoG.rect(torsoX + 16, torsoY + 4, 3, 14).fill({ color: p.topAccent });
      torsoG.rect(torsoX + torsoW - 19, torsoY + 4, 3, 14).fill({ color: p.topAccent });
    } else {
      torsoG.roundRect(torsoX, torsoY, torsoW, torsoH, 9)
        .fill({ color: p.topColor })
        .stroke({ width: 2, color: 0x111622 });
      torsoG.roundRect(torsoX + 12, torsoY + 10, torsoW - 24, 20, 4)
        .fill({ color: 0x111622 })
        .stroke({ width: 1.5, color: p.topAccent });
      torsoG.circle(0, torsoY + 20, 5).fill({ color: p.topAccent });
    }

    // 3. ARMS & HANDS
    const armW = 10;
    this.leftArmGfx.clear();
    this.leftArmGfx.position.set(-22, torsoY + 6);
    this.leftArmGfx.roundRect(-armW / 2, 0, armW, 36, 5)
      .fill({ color: p.topColor })
      .stroke({ width: 1.5, color: 0x111622 });
    this.leftArmGfx.rect(-armW / 2, 26, armW, 3).fill({ color: p.topAccent });
    this.leftArmGfx.circle(0, 36, 6).fill({ color: p.skinColor });

    this.rightArmGfx.clear();
    this.rightArmGfx.position.set(22, torsoY + 6);
    this.rightArmGfx.roundRect(-armW / 2, 0, armW, 36, 5)
      .fill({ color: p.topColor })
      .stroke({ width: 1.5, color: 0x111622 });
    this.rightArmGfx.rect(-armW / 2, 26, armW, 3).fill({ color: p.topAccent });
    this.rightArmGfx.circle(0, 36, 6).fill({ color: p.skinColor });

    // 4. REAL HUMAN HEAD, FACE & FEATURES
    // Proper Artistic Layering Order:
    // 1) Neck & Neck Headphones
    // 2) Hair Back / Volume
    // 3) Head / Face Skin Base
    // 4) Ears & Piercings
    // 5) Blush, Nose, Mouth (Teeth)
    // 6) Eyes (Sclera, Iris, Pupil, Catchlight, Eyelashes)
    // 7) Eyebrows
    // 8) Hair Front Bangs / Fringe (neatly above eyes)
    // 9) Eyewear (Visor / Shades / Goggles)
    const headG = this.headGfx;
    headG.clear();

    const headCenterY = -50;
    const headR = 19;

    // 1) Neck
    headG.rect(-6, headCenterY + 14, 12, 10).fill({ color: p.skinColor });

    // Headphones around neck if equipped
    if (p.hasHeadphones) {
      headG.ellipse(0, headCenterY + 16, 22, 9).stroke({ width: 5, color: p.glowColor });
      headG.roundRect(-25, headCenterY + 11, 8, 12, 3)
        .fill({ color: 0x111622 })
        .stroke({ width: 1.5, color: p.glowColor });
      headG.roundRect(17, headCenterY + 11, 8, 12, 3)
        .fill({ color: 0x111622 })
        .stroke({ width: 1.5, color: p.glowColor });
    }

    // 2) Hair Back / Crown Volume
    const hairTopY = headCenterY - 14;
    if (p.hairStyle === 'curly_afro') {
      headG.circle(0, hairTopY - 3, 23).fill({ color: p.hairColor });
      headG.circle(-14, hairTopY, 15).fill({ color: p.hairColor });
      headG.circle(14, hairTopY, 15).fill({ color: p.hairColor });
    } else if (p.hairStyle === 'messy_spikes') {
      headG.circle(0, hairTopY, 19).fill({ color: p.hairColor });
      headG.moveTo(-16, hairTopY - 2).lineTo(-21, hairTopY - 16).lineTo(-10, hairTopY - 8).fill({ color: p.hairColor });
      headG.moveTo(-10, hairTopY - 8).lineTo(-4, hairTopY - 21).lineTo(4, hairTopY - 8).fill({ color: p.hairColor });
      headG.moveTo(4, hairTopY - 8).lineTo(15, hairTopY - 19).lineTo(14, hairTopY - 2).fill({ color: p.hairColor });
    } else if (p.hairStyle === 'long_ponytail') {
      headG.circle(0, hairTopY, 19).fill({ color: p.hairColor });
      headG.roundRect(-25, hairTopY - 2, 12, 36, 6).fill({ color: p.hairColor });
      headG.circle(-19, hairTopY + 32, 5).fill({ color: p.hairColor });
    } else if (p.hairStyle === 'cyber_braids') {
      headG.circle(0, hairTopY, 18).fill({ color: p.hairColor });
      headG.roundRect(-20, hairTopY + 2, 5, 26, 2).fill({ color: p.hairColor });
      headG.rect(-20, hairTopY + 22, 5, 3).fill({ color: p.topAccent });
      headG.roundRect(15, hairTopY + 2, 5, 26, 2).fill({ color: p.hairColor });
      headG.rect(15, hairTopY + 22, 5, 3).fill({ color: p.topAccent });
    } else if (p.hairStyle === 'cap_backwards') {
      headG.roundRect(-18, hairTopY - 5, 36, 17, 8)
        .fill({ color: p.topColor })
        .stroke({ width: 1.5, color: p.topAccent });
      headG.roundRect(-14, hairTopY + 8, 28, 5, 2).fill({ color: p.topAccent });
    } else if (p.hairStyle === 'curtains_parted') {
      headG.circle(0, hairTopY, 19).fill({ color: p.hairColor });
    } else {
      // Short fade / buzzcut
      headG.circle(0, hairTopY + 1, 19).fill({ color: p.hairColor });
    }

    // 3) Head Base (Natural Skin)
    headG.ellipse(0, headCenterY, headR, headR + 3)
      .fill({ color: p.skinColor })
      .stroke({ width: 1.5, color: 0x1a120c });

    // 4) Human Ears & Piercings
    headG.ellipse(-headR - 1, headCenterY, 3.5, 6.5).fill({ color: p.skinColor });
    headG.ellipse(headR + 1, headCenterY, 3.5, 6.5).fill({ color: p.skinColor });
    if (p.hasPiercing) {
      headG.circle(-headR - 2, headCenterY + 4, 1.8).fill({ color: 0xffd700 });
      headG.circle(headR + 2, headCenterY + 4, 1.8).fill({ color: 0xffd700 });
    }

    // 5) Cute Rosy Cheeks / Blush
    headG.circle(-10, headCenterY + 4, 4.5).fill({ color: 0xff4d6d, alpha: 0.28 });
    headG.circle(10, headCenterY + 4, 4.5).fill({ color: 0xff4d6d, alpha: 0.28 });

    // Expressive Human Nose Bridge & Tip
    headG.moveTo(-1, headCenterY - 2)
      .lineTo(1, headCenterY + 3)
      .lineTo(-1, headCenterY + 4)
      .stroke({ width: 1.5, color: 0x5a331d, alpha: 0.65 });

    // Expressive Smiling Mouth with teeth/lips
    headG.moveTo(-6, headCenterY + 8.5)
      .quadraticCurveTo(0, headCenterY + 14.5, 6, headCenterY + 8.5)
      .fill({ color: 0x4a1818 })
      .stroke({ width: 1.8, color: 0x3d1414 });
    // White teeth smile
    headG.roundRect(-4, headCenterY + 8.5, 8, 3, 1).fill({ color: 0xffffff });

    // 6) Human Eyes (Always crisp, sparkling, clear!)
    // Left Eye
    headG.ellipse(-8, headCenterY - 2, 4.5, 3.2).fill({ color: 0xffffff });
    headG.circle(-7.5, headCenterY - 2, 2.5).fill({ color: p.eyeColor });
    headG.circle(-7.5, headCenterY - 2, 1.4).fill({ color: 0x050505 });
    headG.circle(-6.5, headCenterY - 3, 1).fill({ color: 0xffffff });
    headG.ellipse(-8, headCenterY - 4.5, 4.5, 1.3).fill({ color: 0x111111 });

    // Right Eye
    headG.ellipse(8, headCenterY - 2, 4.5, 3.2).fill({ color: 0xffffff });
    headG.circle(8.5, headCenterY - 2, 2.5).fill({ color: p.eyeColor });
    headG.circle(8.5, headCenterY - 2, 1.4).fill({ color: 0x050505 });
    headG.circle(9.5, headCenterY - 3, 1).fill({ color: 0xffffff });
    headG.ellipse(8, headCenterY - 4.5, 4.5, 1.3).fill({ color: 0x111111 });

    // 7) Expressive Eyebrows
    headG.moveTo(-12, headCenterY - 7)
      .quadraticCurveTo(-7, headCenterY - 9.5, -3, headCenterY - 7)
      .stroke({ width: 2.2, color: p.hairColor, cap: 'round' });

    headG.moveTo(3, headCenterY - 7)
      .quadraticCurveTo(7, headCenterY - 9.5, 12, headCenterY - 7)
      .stroke({ width: 2.2, color: p.hairColor, cap: 'round' });

    // 8) Front Hair Framing / Fringe (Positioned neatly above eyebrows, not covering eyes)
    if (p.hairStyle === 'curtains_parted') {
      headG.roundRect(-17, hairTopY + 4, 7, 10, 3).fill({ color: p.hairColor });
      headG.roundRect(10, hairTopY + 4, 7, 10, 3).fill({ color: p.hairColor });
    } else if (p.hairStyle === 'cap_backwards') {
      headG.moveTo(-9, hairTopY + 8).lineTo(-5, hairTopY + 12).lineTo(0, hairTopY + 8).fill({ color: p.hairColor });
      headG.moveTo(0, hairTopY + 8).lineTo(5, hairTopY + 12).lineTo(9, hairTopY + 8).fill({ color: p.hairColor });
    }

    // 9) Eyewear (Placed over eyes if equipped)
    if (p.eyewear === 'cyber_visor') {
      headG.roundRect(-16, headCenterY - 6.5, 32, 9, 3.5)
        .fill({ color: 0x05070e, alpha: 0.88 })
        .stroke({ width: 2, color: p.eyewearColor });
      headG.rect(-13, headCenterY - 4, 26, 3.5).fill({ color: p.eyewearColor, alpha: 0.9 });
    } else if (p.eyewear === 'neon_shades') {
      headG.roundRect(-15, headCenterY - 5.5, 13, 7.5, 2)
        .fill({ color: 0x08080c, alpha: 0.82 })
        .stroke({ width: 1.5, color: p.eyewearColor });
      headG.roundRect(2, headCenterY - 5.5, 13, 7.5, 2)
        .fill({ color: 0x08080c, alpha: 0.82 })
        .stroke({ width: 1.5, color: p.eyewearColor });
      headG.rect(-2, headCenterY - 3.5, 4, 2).fill({ color: p.eyewearColor });
    } else if (p.eyewear === 'rave_goggles') {
      headG.circle(-8, headCenterY - 3, 6.5)
        .fill({ color: 0x111625 })
        .stroke({ width: 2, color: p.eyewearColor });
      headG.circle(-8, headCenterY - 3, 3.8).fill({ color: p.eyewearColor, alpha: 0.85 });
      headG.circle(8, headCenterY - 3, 6.5)
        .fill({ color: 0x111625 })
        .stroke({ width: 2, color: p.eyewearColor });
      headG.circle(8, headCenterY - 3, 3.8).fill({ color: p.eyewearColor, alpha: 0.85 });
    }
  }

  public updateNameTag() {
    const textWidth = this.nameText.width + 18;
    const textHeight = 24;

    this.nameBg.clear();
    const isVip = this.lane === 'dj_stage';
    const isGifter = this.lane === 'tier4_gifter';
    const borderColor = isVip ? 0xffea00 : isGifter ? 0xff00bb : 0x00e5ff;

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

  // Comic speech bubble (High-contrast, positioned cleanly above the head)
  public say(message: string, duration: number = 4.5) {
    this.speechText.text = message;
    const paddingX = 22;
    const paddingY = 15;
    const bw = Math.max(80, this.speechText.width + paddingX * 2);
    const bh = Math.max(44, this.speechText.height + paddingY * 2);

    this.speechBubbleGfx.clear();

    const isVip = this.lane === 'dj_stage';
    const isGifter = this.lane === 'tier4_gifter';
    const strokeColor = isVip ? 0xffea00 : isGifter ? 0xff00bb : 0x00d4ff;

    // Drop shadow
    this.speechBubbleGfx
      .roundRect(-bw / 2 + 2, -bh - 95, bw, bh, 12)
      .fill({ color: 0x000000, alpha: 0.45 });

    // Bubble body
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

  // Jump to new lane & coordinates
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

    let targetS = 0.50;
    if (newLane === 'tier1_viewer') targetS = 0.50;
    else if (newLane === 'tier2_follower') targetS = 0.68;
    else if (newLane === 'tier3_liker') targetS = 0.90;
    else if (newLane === 'tier4_gifter') targetS = 1.15;
    else if (newLane === 'dj_stage') targetS = 1.35;

    this.jumpTargetScale = targetS;
    this.jumpHeight = Math.abs(targetY - this.y) * 0.35 + 90;
  }

  public update(dt: number, time: number, kickIntensity: number, particles: ParticleSystem) {
    // 1. 5-Minute Costume Auto-Mutation
    this.costumeTimer += dt;
    if (this.costumeTimer >= 300) {
      this.costumeTimer = 0;
      this.mutateCostume(particles);
    }

    // 2. Jump Physics (Parabolic arc)
    if (this.isJumping) {
      this.jumpProgress += dt / this.jumpDuration;

      if (this.jumpProgress >= 1.0) {
        this.jumpProgress = 1.0;
        this.isJumping = false;
        this.x = this.targetX;
        this.y = this.targetY;
        this.currentScale = this.jumpTargetScale;
        this.updateLaneScale();

        if (this.lane === 'dj_stage' || this.lane === 'tier4_gifter') {
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

        if (Math.random() < 0.4 && (this.lane === 'dj_stage' || this.lane === 'tier4_gifter')) {
          particles.emitJetpackThruster(this.x, this.y + 15 * this.currentScale, this.profile.glowColor, 1);
        }
      }
    }

    // 3. Speech Bubble Timer
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

    // 4. Multiple Distinct Dance Animations & Figures
    this.container.x = this.x;
    this.container.y = this.y;

    const phase = time * this.danceSpeed + this.animPhaseOffset;
    let bounce = 0;
    let sway = 0;
    let leftArmRot = 0;
    let rightArmRot = 0;

    if (this.lane === 'dj_stage') {
      // High-energy DJ Stage VIP Dance
      bounce = -Math.abs(Math.sin(phase * 1.6)) * 28 * (0.8 + kickIntensity * 0.6);
      sway = Math.sin(phase * 0.8) * 0.14;
      leftArmRot = 2.4 + Math.sin(phase * 1.6) * 0.5;
      rightArmRot = -2.4 - Math.sin(phase * 1.6) * 0.5;
    } else if (this.lane === 'tier4_gifter') {
      // Front row gifter celebration dance
      bounce = -Math.abs(Math.sin(phase * 1.4)) * 22 * (0.7 + kickIntensity * 0.5);
      sway = Math.sin(phase * 0.7) * 0.10;
      leftArmRot = 2.0 + Math.sin(phase * 1.4) * 0.4;
      rightArmRot = -2.0 - Math.sin(phase * 1.4) * 0.4;
    } else {
      // Dance Style routines across general crowd:
      if (this.danceStyle === 'hands_up_rave') {
        bounce = -Math.abs(Math.sin(phase * 1.2)) * 16 * (0.7 + kickIntensity * 0.4);
        sway = Math.sin(phase * 0.6) * 0.08;
        leftArmRot = 2.2 + Math.sin(phase * 1.2) * 0.35;
        rightArmRot = -2.2 - Math.sin(phase * 1.2) * 0.35;
      } else if (this.danceStyle === 'shuffle_groove') {
        bounce = -Math.abs(Math.sin(phase * 1.5)) * 12;
        sway = Math.sin(phase * 1.5) * 0.12;
        leftArmRot = Math.sin(phase * 1.5) * 0.6;
        rightArmRot = Math.cos(phase * 1.5) * 0.6;
      } else if (this.danceStyle === 'headbang_bounce') {
        bounce = -Math.abs(Math.sin(phase * 1.8)) * 18 * (0.8 + kickIntensity * 0.4);
        sway = Math.sin(phase * 0.9) * 0.04;
        this.headGfx.y = Math.sin(phase * 1.8) * 5;
        leftArmRot = 0.5 + Math.sin(phase * 1.8) * 0.4;
        rightArmRot = -0.5 - Math.sin(phase * 1.8) * 0.4;
      } else if (this.danceStyle === 'hiphop_dab') {
        bounce = -Math.abs(Math.sin(phase)) * 14;
        sway = Math.sin(phase * 0.5) * 0.07;
        leftArmRot = 1.4 + Math.sin(phase) * 0.3;
        rightArmRot = -0.6 + Math.sin(phase) * 0.3;
      } else if (this.danceStyle === 'disco_point') {
        bounce = -Math.abs(Math.sin(phase * 1.1)) * 15;
        sway = Math.sin(phase * 0.55) * 0.08;
        const toggle = Math.sin(phase * 0.5) > 0;
        leftArmRot = toggle ? 2.3 : -0.2;
        rightArmRot = toggle ? 0.2 : -2.3;
      } else if (this.danceStyle === 'lunar_bounce') {
        // High bounce with lunar gravity wave
        bounce = -Math.abs(Math.sin(phase * 1.3)) * 20 * (0.8 + kickIntensity * 0.4);
        sway = Math.sin(phase * 0.65) * 0.12;
        leftArmRot = 1.6 + Math.sin(phase * 1.3) * 0.5;
        rightArmRot = -1.6 - Math.sin(phase * 1.3) * 0.5;
      } else {
        // Zero-G float & sway
        bounce = Math.sin(phase * 0.7) * 10;
        sway = Math.sin(phase * 0.35) * 0.05;
        leftArmRot = Math.sin(phase * 0.7) * 0.4;
        rightArmRot = -Math.sin(phase * 0.7) * 0.4;
      }
    }

    this.characterContainer.rotation = sway;
    this.characterContainer.y = bounce;
    this.leftArmGfx.rotation = leftArmRot;
    this.rightArmGfx.rotation = rightArmRot;

    // 5. VIP Effects
    this.renderVipEffects(time, kickIntensity);
  }

  private renderVipEffects(time: number, kick: number) {
    this.vipGfx.clear();

    if (this.lane === 'dj_stage') {
      // Golden VIP Podium Spotlight & Ring
      const ringR = 60 + kick * 10;
      this.vipGfx
        .ellipse(0, 75, ringR, ringR * 0.35)
        .stroke({ width: 3.5, color: 0xffea00, alpha: 0.95 });
      this.vipGfx
        .ellipse(0, 75, ringR * 0.7, ringR * 0.25)
        .stroke({ width: 2, color: 0xff00bb, alpha: 0.85 });

      // Orbiting Golden Stars
      for (let i = 0; i < 4; i++) {
        const ang = time * 3.5 + (i * Math.PI * 2) / 4;
        const sx = Math.cos(ang) * 54;
        const sy = -50 + Math.sin(ang) * 20;

        this.vipGfx.circle(sx, sy, 4.5).fill({ color: 0xffea00 });
        this.vipGfx.moveTo(sx - 7, sy).lineTo(sx + 7, sy).stroke({ width: 1.5, color: 0xffffff });
        this.vipGfx.moveTo(sx, sy - 7).lineTo(sx, sy + 7).stroke({ width: 1.5, color: 0xffffff });
      }
    } else if (this.lane === 'tier4_gifter') {
      // Permanent front row Gifter Neon Ring
      const ringR = 48 + kick * 6;
      this.vipGfx
        .ellipse(0, 70, ringR, ringR * 0.32)
        .stroke({ width: 2.5, color: 0xff00bb, alpha: 0.85 });
    }
  }
}
