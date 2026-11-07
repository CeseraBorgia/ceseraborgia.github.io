import { Container } from 'pixi.js';
import { Avatar, generateAvatarProfile } from './Avatar';
import { GiftTier, LaneType } from '../types';
import { ParticleSystem } from './ParticleSystem';
import { soundEngine } from './AudioEngine';

export class CrowdManager {
  public container: Container;
  public avatars: Avatar[] = [];
  private nextId: number = 1;
  public readonly MAX_CROWD: number = 400; // Kapasite 400 yapıldı

  public viewerCount: number = 0;
  public realUserCount: number = 0;
  public placeholderPurged: boolean = false;

  // Designated VIP Platforms next to the DJ Booth (3 dakika / 180s duration)
  private djStageSlots = [
    { rank: 1, x: 230, y: 1540, occupiedBy: null as Avatar | null }, // Left DJ Stage Wing
    { rank: 2, x: 850, y: 1540, occupiedBy: null as Avatar | null }  // Right DJ Stage Wing
  ];

  private depthSortCounter: number = 0;

  constructor() {
    this.container = new Container();
    this.container.label = 'CrowdContainer';
  }

  // Yayın başlarken DJ yanı BOŞ, diğer katmanlarda toplam 5-15 arası insan başlar
  public initCrowd() {
    // 1. DJ Stage: Başlangıçta tamamen BOŞ!
    this.djStageSlots[0].occupiedBy = null;
    this.djStageSlots[1].occupiedBy = null;

    // 2. Diğer 4 katmanda toplam 12 insan (5-15 arası)
    // Tier 1 (En arkada: 5 izleyici)
    for (let i = 0; i < 5; i++) {
      const x = 200 + i * 170 + (Math.random() - 0.5) * 30;
      const y = 760 + (i % 2) * 30;
      const uname = `izleyici_${i + 1}`;
      const av = new Avatar(`init_${this.nextId++}`, uname, 'tier1_viewer', x, y);
      av.isPlaceholder = true;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // Tier 2 (Takipçiler: 3 insan)
    for (let i = 0; i < 3; i++) {
      const x = 280 + i * 260 + (Math.random() - 0.5) * 30;
      const y = 860 + (i % 2) * 25;
      const uname = `takipci_${i + 1}`;
      const av = new Avatar(`init_${this.nextId++}`, uname, 'tier2_follower', x, y);
      av.isFollower = true;
      av.isPlaceholder = true;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // Tier 3 (Beğenenler: 2 insan)
    for (let i = 0; i < 2; i++) {
      const x = 360 + i * 360 + (Math.random() - 0.5) * 30;
      const y = 960 + (i % 2) * 30;
      const uname = `begenen_${i + 1}`;
      const av = new Avatar(`init_${this.nextId++}`, uname, 'tier3_liker', x, y);
      av.isFollower = true;
      av.isPlaceholder = true;
      av.likeTierTimer = 60;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // Tier 4 (En önde hediye atanlar: 2 insan)
    for (let i = 0; i < 2; i++) {
      const x = 380 + i * 320 + (Math.random() - 0.5) * 20;
      const y = 1080 + (i % 2) * 45;
      const uname = `hediyeci_${i + 1}`;
      const av = new Avatar(`init_${this.nextId++}`, uname, 'tier4_gifter', x, y);
      av.isFollower = true;
      av.isPlaceholder = true;
      av.totalDiamonds = 30 + i * 20;
      av.costumeTimer = Math.random() * 240;
      this.addAvatar(av);
    }

    // Initial greeting speech bubbles
    setTimeout(() => {
      this.findAvatar('hediyeci_1')?.say('Rave başlıyor! 🚀', 5);
      this.findAvatar('begenen_1')?.say('Ay partisi! 🌙🔥', 5);
    }, 800);
  }

  // İzleyici sayısı 100 olduğunda başlangıçta yaratılan gerçek olmayan insanları sil
  public checkViewerThreshold(count: number, particles?: ParticleSystem) {
    this.viewerCount = count;
    if ((this.viewerCount >= 100 || this.realUserCount >= 100) && !this.placeholderPurged) {
      this.purgePlaceholders(particles);
    }
  }

  public purgePlaceholders(particles?: ParticleSystem) {
    if (this.placeholderPurged) return;
    this.placeholderPurged = true;

    const placeholders = this.avatars.filter(a => a.isPlaceholder);
    for (const av of placeholders) {
      this.container.removeChild(av.container);
      if (particles) {
        particles.triggerSmallGift(av.x, av.y, 0x00f0ff);
      }
    }

    this.avatars = this.avatars.filter(a => !a.isPlaceholder);
    console.log(`[CrowdManager] 100 izleyiciye ulaşıldı! ${placeholders.length} sahte/placeholder avatar tamamen silindi.`);
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
      this.realUserCount++;
      this.checkViewerThreshold(this.viewerCount);

      if (this.avatars.length >= this.MAX_CROWD) {
        // Recycle a Tier 1 lurker
        const lurker = this.avatars.find(a => a.lane === 'tier1_viewer' && !a.isJumping);
        if (lurker) {
          lurker.username = username;
          lurker.isPlaceholder = false;
          lurker.profile = generateAvatarProfile(username);
          lurker['buildHumanModel']();
          lurker['nameText'].text = `@${username}`;
          lurker.updateNameTag();
          return lurker;
        }
      }

      // Or spawn fresh
      const x = 90 + Math.random() * 900;
      const y = defaultLane === 'tier1_viewer' ? 740 + Math.random() * 80 : 850;
      av = new Avatar(`user_${this.nextId++}`, username, defaultLane, x, y);
      av.isPlaceholder = false;
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

    // Target position in Tier 2 (y: 840 - 930) - Katmanların üst limiti yok
    const targetX = 100 + Math.random() * 880;
    const targetY = 840 + Math.random() * 90;

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
      const targetX = 120 + Math.random() * 840;
      const targetY = 940 + Math.random() * 100;
      av.jumpTo(targetX, targetY, 'tier3_liker', 1.1);
    }

    // Refresh 60-second timer for Tier 3
    av.likeTierTimer = 60; // 1 minute in Tier 3

    particles.triggerHearts(av.x, av.y - 20, 5);
    return av;
  }

  // 4. Gift Event -> Tier 4 (En önde KALICI) or DJ Stage VIP (3 DAKİKA / 180s boyunca DJ'in yanında)
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

    // If Big Gift OR high diamond count, promote to DJ Stage VIP (3 DAKİKA / 180s next to DJ)
    if (tier === 'big' || av.totalDiamonds >= 100) {
      this.promoteToDJStage(av, particles, giftName);
    } else {
      // Normal Gift -> Tier 4 (En önde, SÜRE SINIRI OLMADAN KALICI!)
      this.promoteToTier4Permanent(av, particles, giftName, tier);
    }

    return av;
  }

  // Promote to DJ Stage (VIP next to DJ for 3 MINUTES / 180s)
  private promoteToDJStage(av: Avatar, particles: ParticleSystem, giftName: string) {
    let slot = this.djStageSlots.find(s => s.occupiedBy === null || s.occupiedBy === av);
    if (!slot) {
      // If both occupied, replace the one with lowest remaining timer
      slot = this.djStageSlots[0].occupiedBy!.djStageTimer < this.djStageSlots[1].occupiedBy!.djStageTimer
        ? this.djStageSlots[0]
        : this.djStageSlots[1];
      if (slot.occupiedBy && slot.occupiedBy !== av) {
        // Drop previous occupant to Tier 4 (front row)
        const prev = slot.occupiedBy;
        const tx = 140 + Math.random() * 800;
        const ty = 1070 + Math.random() * 95;
        prev.jumpTo(tx, ty, 'tier4_gifter', 0.9);
      }
    }

    slot.occupiedBy = av;
    av.djStageTimer = 180; // 3 DAKİKA (180 saniye) boyunca DJ yanında kalır
    av.jumpTo(slot.x, slot.y, 'dj_stage', 0.95);
    av.updateNameTag();

    setTimeout(() => {
      particles.triggerBigGift(av.x, av.y, av.profile.glowColor);
      av.say(`👑 3 DK DJ YANINDAYIM! ${giftName}! 💎`, 6);
    }, 450);
  }

  // Promote to Tier 4 (En önde hediye atanlar - SÜRE SINIRI OLMADAN HEP EN ÖNDE KALICI)
  private promoteToTier4Permanent(
    av: Avatar,
    particles: ParticleSystem,
    giftName: string,
    tier: GiftTier
  ) {
    // If not already on DJ Stage or Tier 4, jump forward to Tier 4
    if (av.lane !== 'dj_stage' && av.lane !== 'tier4_gifter') {
      const targetX = 140 + Math.random() * 800;
      const targetY = 1060 + Math.random() * 110;
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

      // Handle DJ Stage 3-MINUTE (180s) VIP timer
      if (av.lane === 'dj_stage' && !av.isJumping) {
        av.djStageTimer -= dt;
        if (av.djStageTimer <= 0) {
          // 3 minutes expired: steps down to Tier 4 (En önde KALICI)
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
          const targetX = 100 + Math.random() * 880;
          const targetY = 840 + Math.random() * 90;
          av.jumpTo(targetX, targetY, 'tier2_follower', 1.0);
          av.updateNameTag();
        }
      }

      // NOTE: Tier 4 (Hediye atanlar) SÜRE SINIRI YOKTUR, HEP EN ÖNDE KALICIDIR.
    }

    // 2. Y-Depth Sorting for proper spatial overlap
    // Optimization for TikTok LIVE Studio: Only sort when avatars are leaping between lanes or throttle to every 10 frames
    this.depthSortCounter++;
    const hasJumping = this.avatars.some(a => a.isJumping);
    if (hasJumping || this.depthSortCounter >= 10) {
      this.depthSortCounter = 0;
      this.container.children.sort((a, b) => a.y - b.y);
    }
  }
}
