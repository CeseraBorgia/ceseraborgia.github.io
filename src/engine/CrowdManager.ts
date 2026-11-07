import { Container } from 'pixi.js';
import { Avatar, generateAvatarProfile } from './Avatar';
import { GiftTier, LaneType } from '../types';
import { ParticleSystem } from './ParticleSystem';
import { soundEngine } from './AudioEngine';

export class CrowdManager {
  public container: Container;
  public avatars: Avatar[] = [];
  private nextId: number = 1;
  public readonly MAX_CROWD: number = 200;

  // Designated VIP Platforms next to the DJ Booth (30s duration)
  private djStageSlots = [
    { rank: 1, x: 230, y: 1540, occupiedBy: null as Avatar | null }, // Left DJ Stage Wing
    { rank: 2, x: 850, y: 1540, occupiedBy: null as Avatar | null }  // Right DJ Stage Wing
  ];

  constructor() {
    this.container = new Container();
    this.container.label = 'CrowdContainer';
  }

  // Populate exactly 200 avatars across the 4 dance floor tiers + DJ Stage VIPs
  public initCrowd() {
    // 1. Tier 1 (En arkada: 135 izleyiciler / lurkers)
    // Moved forward from previous deep background so speech bubbles are crystal clear
    const tier1Count = 135;
    const tier1Cols = 17;
    for (let i = 0; i < tier1Count; i++) {
      const row = Math.floor(i / tier1Cols);
      const col = i % tier1Cols;
      const x = 80 + col * 58 + (row % 2) * 29 + (Math.random() - 0.5) * 14;
      const y = 740 + row * 11 + (Math.random() - 0.5) * 8;
      const uname = `izleyici_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier1_viewer', x, y);
      // Randomize initial costume timer so all 200 don't mutate at the exact same frame
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // 2. Tier 2 (Bir önünde: 35 takipçiler)
    const tier2Count = 35;
    const tier2Cols = 12;
    for (let i = 0; i < tier2Count; i++) {
      const row = Math.floor(i / tier2Cols);
      const col = i % tier2Cols;
      const x = 110 + col * 75 + (row % 2) * 37 + (Math.random() - 0.5) * 16;
      const y = 840 + row * 26 + (Math.random() - 0.5) * 10;
      const uname = `takipci_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier2_follower', x, y);
      av.isFollower = true;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // 3. Tier 3 (Bir önünde: 18 beğeni atanlar - 1dk / 60sn kalır)
    const tier3Count = 18;
    const tier3Cols = 9;
    for (let i = 0; i < tier3Count; i++) {
      const row = Math.floor(i / tier3Cols);
      const col = i % tier3Cols;
      const x = 130 + col * 96 + (row % 2) * 48 + (Math.random() - 0.5) * 18;
      const y = 940 + row * 45 + (Math.random() - 0.5) * 12;
      const uname = `begenen_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier3_liker', x, y);
      av.isFollower = true;
      av.likeTierTimer = 45 + Math.random() * 15;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // 4. Tier 4 (En önde: 10 hediye atanlar - SÜRE SINIRI OLMADAN KALICI)
    const tier4Count = 10;
    for (let i = 0; i < tier4Count; i++) {
      const x = 145 + i * 88 + (Math.random() - 0.5) * 10;
      const y = 1060 + (i % 2) * 65 + (Math.random() - 0.5) * 10;
      const uname = `hediyeci_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier4_gifter', x, y);
      av.isFollower = true;
      av.totalDiamonds = 30 + i * 15;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // 5. DJ Stage VIPs (En çok hediye atanlar: 30 saniye boyunca DJ'in yanında)
    const topVipNames = ['efe_türk', 'aylin_vip'];
    const topVipDiamonds = [500, 350];
    for (let i = 0; i < 2; i++) {
      const slot = this.djStageSlots[i];
      const uname = topVipNames[i];
      const av = new Avatar(`user_${this.nextId++}`, uname, 'dj_stage', slot.x, slot.y);
      av.isFollower = true;
      av.totalDiamonds = topVipDiamonds[i];
      av.djStageTimer = 30; // 30 seconds next to DJ
      slot.occupiedBy = av;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // Initial greeting speech bubbles
    setTimeout(() => {
      this.findAvatar('efe_türk')?.say('DJ YANINDAYIM! 🎧👑', 5);
      this.findAvatar('aylin_vip')?.say('Müzik efsane! 🚀', 5);
      this.findAvatar('hediyeci_1')?.say('En öndeyiz! 🔥', 5);
    }, 600);
  }

  private addAvatar(av: Avatar) {
    if (this.avatars.length >= this.MAX_CROWD) {
      // Find oldest lurker in Tier 1 to recycle
      const lurkerIdx = this.avatars.findIndex(a => a.lane === 'tier1_viewer' && !a.isJumping);
      if (lurkerIdx !== -1) {
        const old = this.avatars[lurkerIdx];
        this.container.removeChild(old.container);
        this.avatars.splice(lurkerIdx, 1);
      }
    }
    this.avatars.push(av);
    this.container.addChild(av.container);
  }

  public findAvatar(username: string): Avatar | undefined {
    return this.avatars.find(a => a.username.toLowerCase() === username.toLowerCase());
  }

  public getOrCreateAvatar(username: string, defaultLane: LaneType = 'tier1_viewer'): Avatar {
    let av = this.findAvatar(username);
    if (!av) {
      if (this.avatars.length >= this.MAX_CROWD) {
        // Recycle a Tier 1 lurker
        const lurker = this.avatars.find(a => a.lane === 'tier1_viewer' && !a.isJumping);
        if (lurker) {
          lurker.username = username;
          lurker.profile = generateAvatarProfile(username);
          lurker['buildHumanModel']();
          lurker['nameText'].text = `@${username}`;
          lurker.updateNameTag();
          return lurker;
        }
      }

      // Or spawn fresh
      const x = 120 + Math.random() * 840;
      const y = defaultLane === 'tier1_viewer' ? 740 + Math.random() * 70 : 850;
      av = new Avatar(`user_${this.nextId++}`, username, defaultLane, x, y);
      this.addAvatar(av);
    }
    return av;
  }

  // --- TIKTOK LIVE EVENT HANDLERS ---

  // 1. Join Event -> Places in Tier 1 (En arkada izleyiciler)
  public handleJoin(username: string): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier1_viewer');
    return av;
  }

  // 2. Follow Event -> Promotes to Tier 2 (Takipçiler)
  public handleFollow(username: string): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier1_viewer');
    av.isFollower = true;

    // Target position in Tier 2 (y: 840 - 920)
    const targetX = 110 + Math.random() * 860;
    const targetY = 840 + Math.random() * 80;

    av.jumpTo(targetX, targetY, 'tier2_follower', 1.2);
    setTimeout(() => {
      av.say('Takipteyim! 🚀', 4);
    }, 800);

    return av;
  }

  // 3. Like Event -> Promotes to Tier 3 (1dk / 60sn kalır) & 50-Like Mutation Trigger
  public handleLike(username: string, particles: ParticleSystem): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier2_follower');
    av.isFollower = true;

    // Register like (50 likes triggers costume mutation with sparkles)
    av.registerLike(particles);

    // If avatar is in Tier 1 or Tier 2, jump forward to Tier 3
    if (av.lane === 'tier1_viewer' || av.lane === 'tier2_follower') {
      const targetX = 130 + Math.random() * 820;
      const targetY = 940 + Math.random() * 95;
      av.jumpTo(targetX, targetY, 'tier3_liker', 1.1);
    }

    // Refresh 60-second timer for Tier 3
    av.likeTierTimer = 60; // 1 minute in Tier 3

    particles.triggerHearts(av.x, av.y - 20, 5);
    return av;
  }

  // 4. Gift Event -> Tier 4 (En önde KALICI) or DJ Stage VIP (30 saniye boyunca DJ'in yanında)
  public handleGift(
    username: string,
    giftName: string,
    tier: GiftTier,
    particles: ParticleSystem,
    diamonds: number = 0
  ): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier3_liker');
    av.isFollower = true;
    av.giftStreak++;

    const giftDiamonds = diamonds > 0 ? diamonds : tier === 'big' ? 100 : tier === 'medium' ? 30 : 5;
    av.totalDiamonds += giftDiamonds;

    // Sound effect
    soundEngine.playGiftSFX(tier);

    // If Big Gift OR top diamonds, promote to DJ Stage VIP (30 seconds next to DJ)
    if (tier === 'big' || av.totalDiamonds >= 100) {
      this.promoteToDJStage(av, particles, giftName);
    } else {
      // Normal Gift -> Tier 4 (En önde, SÜRE SINIRI OLMADAN KALICI!)
      this.promoteToTier4Permanent(av, particles, giftName, tier);
    }

    return av;
  }

  // Promote to DJ Stage (VIP next to DJ for 30s)
  private promoteToDJStage(av: Avatar, particles: ParticleSystem, giftName: string) {
    // Pick first free DJ Stage slot or slot 0
    let slot = this.djStageSlots.find(s => s.occupiedBy === null || s.occupiedBy === av);
    if (!slot) {
      // If both occupied, replace the one with lowest remaining timer
      slot = this.djStageSlots[0].occupiedBy!.djStageTimer < this.djStageSlots[1].occupiedBy!.djStageTimer
        ? this.djStageSlots[0]
        : this.djStageSlots[1];
      if (slot.occupiedBy && slot.occupiedBy !== av) {
        // Drop previous occupant to Tier 4 (front row)
        const prev = slot.occupiedBy;
        const tx = 150 + Math.random() * 780;
        const ty = 1070 + Math.random() * 90;
        prev.jumpTo(tx, ty, 'tier4_gifter', 0.9);
      }
    }

    slot.occupiedBy = av;
    av.djStageTimer = 30; // 30 seconds next to DJ
    av.jumpTo(slot.x, slot.y, 'dj_stage', 0.95);
    av.updateNameTag();

    setTimeout(() => {
      particles.triggerBigGift(av.x, av.y, av.profile.glowColor);
      av.say(`👑 DJ YANINDAYIM! ${giftName}! 💎`, 5);
    }, 450);
  }

  // Promote to Tier 4 (En önde hediye atanlar - KALICI / süre sınırı olmadan)
  private promoteToTier4Permanent(
    av: Avatar,
    particles: ParticleSystem,
    giftName: string,
    tier: GiftTier
  ) {
    // If not already on DJ Stage or Tier 4, jump forward to Tier 4
    if (av.lane !== 'dj_stage' && av.lane !== 'tier4_gifter') {
      const targetX = 140 + Math.random() * 800;
      const targetY = 1070 + Math.random() * 95;
      av.jumpTo(targetX, targetY, 'tier4_gifter', 0.95);
    }

    av.updateNameTag();

    setTimeout(() => {
      if (tier === 'medium') {
        particles.triggerMediumGift(av.x, av.y, av.profile.glowColor);
        av.say(`🔥 ${giftName} x${av.giftStreak}!`, 4);
      } else {
        particles.triggerSmallGift(av.x, av.y, av.profile.glowColor);
        av.say(`🎁 ${giftName}!`, 3.5);
      }
    }, 400);
  }

  // 5. Comment Event
  public handleComment(username: string, text: string): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier2_follower');
    av.say(text, 4.5);
    return av;
  }

  // --- UPDATE TICKER (60 FPS) ---
  public update(dt: number, time: number, kickIntensity: number, particles: ParticleSystem) {
    // 1. Update all avatars (Transforms, dances, animations, auto-mutation)
    for (let i = 0; i < this.avatars.length; i++) {
      const av = this.avatars[i];
      av.update(dt, time, kickIntensity, particles);

      // Handle DJ Stage 30-second VIP timer
      if (av.lane === 'dj_stage' && !av.isJumping) {
        av.djStageTimer -= dt;
        if (av.djStageTimer <= 0) {
          // 30 seconds expired: steps down to Tier 4 (En önde KALICI)
          const slot = this.djStageSlots.find(s => s.occupiedBy === av);
          if (slot) slot.occupiedBy = null;

          const targetX = 140 + Math.random() * 800;
          const targetY = 1070 + Math.random() * 95;
          av.jumpTo(targetX, targetY, 'tier4_gifter', 1.0);
          av.updateNameTag();
        }
      }

      // Handle Tier 3 (Liker) 60-second timer
      if (av.lane === 'tier3_liker' && !av.isJumping) {
        av.likeTierTimer -= dt;
        if (av.likeTierTimer <= 0) {
          // 1 minute expired: step back to Tier 2 (Takipçi katmanı)
          const targetX = 110 + Math.random() * 860;
          const targetY = 840 + Math.random() * 80;
          av.jumpTo(targetX, targetY, 'tier2_follower', 1.0);
          av.updateNameTag();
        }
      }

      // NOTE: Tier 4 (Hediye atanlar) has NO TIMEOUT! They stay permanently in Tier 4 front row.
    }

    // 2. Y-Depth Sorting for proper spatial overlap
    this.container.children.sort((a, b) => a.y - b.y);
  }
}
