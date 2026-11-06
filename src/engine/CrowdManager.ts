import { Container } from 'pixi.js';
import { Avatar } from './Avatar';
import { AvatarColorScheme, GiftTier, LaneType } from '../types';
import { ParticleSystem } from './ParticleSystem';
import { soundEngine } from './AudioEngine';

const COLOR_PALETTES: AvatarColorScheme[] = [
  {
    suitColor: 0x4a5d85,
    suitAccent: 0x00f0ff,
    visorGlow: 0x00ffff,
    jetpackFlame: 0x00d4ff,
    nameColor: '#00ffff'
  },
  {
    suitColor: 0x6e4a85,
    suitAccent: 0xff00bb,
    visorGlow: 0xff00bb,
    jetpackFlame: 0xff33cc,
    nameColor: '#ff00bb'
  },
  {
    suitColor: 0x3d7465,
    suitAccent: 0x00ff88,
    visorGlow: 0x00ff99,
    jetpackFlame: 0x33ffbb,
    nameColor: '#00ff88'
  },
  {
    suitColor: 0x7c6d3d,
    suitAccent: 0xffbb00,
    visorGlow: 0xffcc00,
    jetpackFlame: 0xff9900,
    nameColor: '#ffbb00'
  },
  {
    suitColor: 0x3b5072,
    suitAccent: 0x33aaff,
    visorGlow: 0x66ccff,
    jetpackFlame: 0x00e5ff,
    nameColor: '#33aaff'
  },
  {
    suitColor: 0x85435a,
    suitAccent: 0xff2a6d,
    visorGlow: 0xff0077,
    jetpackFlame: 0xff0055,
    nameColor: '#ff2a6d'
  }
];

export class CrowdManager {
  public container: Container;
  public avatars: Avatar[] = [];
  private nextId: number = 1;

  // Front VIP slots (3-4 prominent foreground spots near the DJ)
  private vipSlots = [
    { x: 310, y: 1220, occupiedBy: null as Avatar | null },
    { x: 540, y: 1260, occupiedBy: null as Avatar | null },
    { x: 770, y: 1220, occupiedBy: null as Avatar | null },
    { x: 420, y: 1140, occupiedBy: null as Avatar | null },
    { x: 660, y: 1140, occupiedBy: null as Avatar | null }
  ];

  constructor() {
    this.container = new Container();
    this.container.label = 'CrowdContainer';
  }

  // Initial population of crowd across the 3 visual lanes
  public initCrowd() {
    // 1. Back Tier (24-30 normal viewers / lurkers)
    const backNames = [
      'ali_kaya', 'mert_34', 'ayse_space', 'kerem_tr', 'selin_cosmic',
      'baran_99', 'defne_star', 'burak_moon', 'ceren_g', 'deniz_x',
      'emre_tr', 'gamze_lunar', 'hakan_06', 'irem_rave', 'kaan_ast',
      'leyla_sky', 'oguz_v', 'pelinduran', 'serkan_m', 'tolga_dj',
      'umut_c', 'yasemin_k', 'zafer_9', 'ozge_pulsar'
    ];

    const backCols = 8;
    for (let i = 0; i < backNames.length; i++) {
      const row = Math.floor(i / backCols);
      const col = i % backCols;
      const x = 140 + col * 115 + (row % 2) * 55 + (Math.random() - 0.5) * 30;
      const y = 700 + row * 40 + (Math.random() - 0.5) * 15;

      const palette = COLOR_PALETTES[i % COLOR_PALETTES.length];
      const av = new Avatar(
        `user_${this.nextId++}`,
        backNames[i],
        'back',
        x,
        y,
        palette,
        'moon_bounce'
      );
      this.addAvatar(av);
    }

    // 2. Middle Tier (Followers)
    const midNames = ['can_99', 'merve_7', 'baris_beat', 'sinem_orbit'];
    const midPositions = [
      { x: 230, y: 920 },
      { x: 440, y: 960 },
      { x: 640, y: 960 },
      { x: 850, y: 920 }
    ];

    for (let i = 0; i < midNames.length; i++) {
      const pos = midPositions[i];
      const palette = COLOR_PALETTES[(i + 2) % COLOR_PALETTES.length];
      const av = new Avatar(
        `user_${this.nextId++}`,
        midNames[i],
        'mid',
        pos.x,
        pos.y,
        palette,
        i % 2 === 0 ? 'electronic_jump' : 'zero_g_flip'
      );
      this.addAvatar(av);
    }

    // 3. Front VIP Tier (3 gifters from concept reference: efe_türk, etc.)
    const vipNames = ['efe_türk', 'aylin_vip', 'cem_galaxy'];
    const vipSlots = [this.vipSlots[0], this.vipSlots[1], this.vipSlots[2]];

    for (let i = 0; i < vipNames.length; i++) {
      const slot = vipSlots[i];
      const palette = COLOR_PALETTES[i % COLOR_PALETTES.length];
      const av = new Avatar(
        `user_${this.nextId++}`,
        vipNames[i],
        'front',
        slot.x,
        slot.y,
        palette,
        'vip_rave'
      );
      av.isVip = true;
      av.vipTimer = 25; // seconds
      slot.occupiedBy = av;
      this.addAvatar(av);
    }

    // Initial initial speech bubbles like in the reference art!
    setTimeout(() => {
      this.findAvatar('efe_türk')?.say('TŞK DJ!', 5);
      this.findAvatar('can_99')?.say('Harika!', 5);
      this.findAvatar('merve_7')?.say('Takipteyim! 🚀', 5);
    }, 600);
  }

  private addAvatar(av: Avatar) {
    this.avatars.push(av);
    this.container.addChild(av.container);
  }

  public findAvatar(username: string): Avatar | undefined {
    return this.avatars.find(a => a.username.toLowerCase() === username.toLowerCase());
  }

  public getOrCreateAvatar(username: string, defaultLane: LaneType = 'back'): Avatar {
    let av = this.findAvatar(username);
    if (!av) {
      const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      const x = 120 + Math.random() * 840;
      const y = defaultLane === 'back' ? 700 + Math.random() * 100 : 920;
      av = new Avatar(
        `user_${this.nextId++}`,
        username,
        defaultLane,
        x,
        y,
        palette,
        'moon_bounce'
      );
      this.addAvatar(av);
    }
    return av;
  }

  // Follow event: viewer leaps from back row forward into mid row!
  public handleFollow(username: string): Avatar {
    let av = this.findAvatar(username);
    if (!av) {
      // Pick a random back-row lurker to promote!
      const backAvatars = this.avatars.filter(a => a.lane === 'back' && !a.isJumping);
      if (backAvatars.length > 0) {
        av = backAvatars[Math.floor(Math.random() * backAvatars.length)];
        av.username = username;
        av['nameText'].text = `@${username}`;
        av['updateNameTag']();
      } else {
        av = this.getOrCreateAvatar(username, 'back');
      }
    }

    // Target spot in mid tier
    const targetX = 180 + Math.random() * 720;
    const targetY = 880 + Math.random() * 120;

    av.danceStyle = 'electronic_jump';
    av.jumpTo(targetX, targetY, 'mid', 1.3);

    // Follower speech bubble
    setTimeout(() => {
      av?.say('Takipteyim! 🚀', 4);
    }, 900);

    return av;
  }

  // Gift event: moves avatar to VIP front row with high-energy FX!
  public handleGift(
    username: string,
    giftName: string,
    tier: GiftTier,
    particles: ParticleSystem
  ): Avatar {
    const av = this.getOrCreateAvatar(username, 'mid');
    av.giftStreak++;
    av.isVip = true;
    av.vipTimer = tier === 'big' ? 35 : tier === 'medium' ? 25 : 18;
    av.danceStyle = 'vip_rave';

    // Find best VIP slot
    let slot = this.vipSlots.find(s => s.occupiedBy === null || s.occupiedBy === av);
    if (!slot) {
      // Evict oldest VIP slot back to mid tier
      slot = this.vipSlots.reduce((oldest, cur) => {
        if (!oldest.occupiedBy) return oldest;
        if (!cur.occupiedBy) return cur;
        return cur.occupiedBy.vipTimer < oldest.occupiedBy.vipTimer ? cur : oldest;
      });

      if (slot.occupiedBy && slot.occupiedBy !== av) {
        const evicted = slot.occupiedBy;
        evicted.isVip = false;
        evicted.danceStyle = 'electronic_jump';
        const midX = 180 + Math.random() * 720;
        const midY = 900 + Math.random() * 100;
        evicted.jumpTo(midX, midY, 'mid', 1.0);
      }
    }

    slot.occupiedBy = av;

    // Smooth low-G arc jump or leap into front row
    av.jumpTo(slot.x, slot.y, 'front', 0.9);

    // Sound effect
    soundEngine.playGiftSFX(tier);

    // Trigger visual FX based on tier
    setTimeout(() => {
      if (tier === 'small') {
        particles.triggerSmallGift(av.x, av.y, av.colorScheme.visorGlow);
        av.say(`🎁 ${giftName}!`, 3.5);
      } else if (tier === 'medium') {
        particles.triggerMediumGift(av.x, av.y, av.colorScheme.visorGlow);
        av.say(`🔥 ${giftName} x${av.giftStreak}!`, 4);
      } else {
        // BIG GIFT (Space Laser + Supernova)
        particles.triggerBigGift(av.x, av.y, av.colorScheme.visorGlow);
        av.say(`🪐 TŞK DJ! ${giftName}! 💎`, 5);
      }
    }, 450);

    return av;
  }

  // Comment event
  public handleComment(username: string, text: string): Avatar {
    const av = this.getOrCreateAvatar(username, 'mid');
    av.say(text, 4.5);
    return av;
  }

  // Like event
  public handleLike(username: string, particles: ParticleSystem): Avatar {
    const av = this.getOrCreateAvatar(username, 'mid');
    particles.triggerHearts(av.x, av.y - 20, 4);
    return av;
  }

  // Join event
  public handleJoin(username: string): Avatar {
    // Spawn in back lane
    const x = 120 + Math.random() * 840;
    const y = 700 + Math.random() * 100;
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const av = new Avatar(
      `user_${this.nextId++}`,
      username,
      'back',
      x,
      y,
      palette,
      'moon_bounce'
    );
    this.addAvatar(av);
    return av;
  }

  public update(dt: number, time: number, kickIntensity: number, particles: ParticleSystem) {
    // 1. Update all avatars
    for (const av of this.avatars) {
      av.update(dt, time, kickIntensity, particles);
    }

    // 2. Free up VIP slots if timer expired and avatar left VIP
    for (const slot of this.vipSlots) {
      if (slot.occupiedBy && (!slot.occupiedBy.isVip || slot.occupiedBy.lane !== 'front')) {
        slot.occupiedBy = null;
      }
    }

    // 3. Y-Depth Sorting: elements with higher Y (closer to foreground) appear in front!
    this.container.children.sort((a, b) => a.y - b.y);
  }
}
