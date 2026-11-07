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

  // Exact 3 Front VIP Spots (Tier 1: En çok hediye atan 3 kişi)
  private vipSlots = [
    { rank: 1, x: 540, y: 1240, occupiedBy: null as Avatar | null },
    { rank: 2, x: 330, y: 1200, occupiedBy: null as Avatar | null },
    { rank: 3, x: 750, y: 1200, occupiedBy: null as Avatar | null }
  ];

  constructor() {
    this.container = new Container();
    this.container.label = 'CrowdContainer';
  }

  // Populate exactly 200 avatars across the 5 dance floor tiers
  public initCrowd() {
    // 1. Tier 5 (En arkada: 140 izleyiciler / lurkers)
    const tier5Count = 140;
    const tier5Cols = 18;
    for (let i = 0; i < tier5Count; i++) {
      const row = Math.floor(i / tier5Cols);
      const col = i % tier5Cols;
      const x = 70 + col * 55 + (row % 2) * 27 + (Math.random() - 0.5) * 15;
      const y = 670 + row * 12 + (Math.random() - 0.5) * 8;
      const uname = `izleyici_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier5_viewer', x, y);
      this.addAvatar(av);
    }

    // 2. Tier 4 (Bir önünde: 35 takipçiler)
    const tier4Count = 35;
    const tier4Cols = 12;
    for (let i = 0; i < tier4Count; i++) {
      const row = Math.floor(i / tier4Cols);
      const col = i % tier4Cols;
      const x = 110 + col * 75 + (row % 2) * 35 + (Math.random() - 0.5) * 18;
      const y = 785 + row * 26 + (Math.random() - 0.5) * 10;
      const uname = `takipci_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier4_follower', x, y);
      av.isFollower = true;
      this.addAvatar(av);
    }

    // 3. Tier 3 (Bir önünde: 15 beğeni atan takipçiler)
    const tier3Count = 15;
    const tier3Cols = 8;
    for (let i = 0; i < tier3Count; i++) {
      const row = Math.floor(i / tier3Cols);
      const col = i % tier3Cols;
      const x = 140 + col * 110 + (row % 2) * 55 + (Math.random() - 0.5) * 20;
      const y = 890 + row * 45 + (Math.random() - 0.5) * 12;
      const uname = `begenen_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier3_liker', x, y);
      av.isFollower = true;
      av.likeTierTimer = 45 + Math.random() * 15;
      this.addAvatar(av);
    }

    // 4. Tier 2 (Bir önünde: 7 hediye atanlar)
    const tier2Count = 7;
    for (let i = 0; i < tier2Count; i++) {
      const x = 160 + i * 110 + (Math.random() - 0.5) * 25;
      const y = 1010 + (i % 2) * 45 + (Math.random() - 0.5) * 15;
      const uname = `hediyeci_${i + 1}`;
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier2_gifter', x, y);
      av.isFollower = true;
      av.totalDiamonds = 20 + i * 10;
      av.giftTierTimer = 6 + Math.random() * 4;
      this.addAvatar(av);
    }

    // 5. Tier 1 (En önde: en çok hediye atan 3 kişi)
    const top3Names = ['efe_türk', 'aylin_vip', 'cem_galaxy'];
    const top3Diamonds = [500, 350, 200];
    for (let i = 0; i < 3; i++) {
      const slot = this.vipSlots[i];
      const uname = top3Names[i];
      const av = new Avatar(`user_${this.nextId++}`, uname, 'tier1_vip', slot.x, slot.y);
      av.isFollower = true;
      av.isTop3Vip = true;
      av.totalDiamonds = top3Diamonds[i];
      av.vipTimer = 15; // 15 seconds
      slot.occupiedBy = av;
      this.addAvatar(av);
    }

    // Initial comic speech bubbles
    setTimeout(() => {
      this.findAvatar('efe_türk')?.say('TŞK DJ!', 5);
      this.findAvatar('aylin_vip')?.say('Harika! 🚀', 5);
      this.findAvatar('cem_galaxy')?.say('Müzik bomba! 🔥', 5);
    }, 600);
  }

  private addAvatar(av: Avatar) {
    if (this.avatars.length >= this.MAX_CROWD) {
      // Find oldest lurker in Tier 5 to replace
      const lurkerIdx = this.avatars.findIndex(a => a.lane === 'tier5_viewer' && !a.isJumping);
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

  public getOrCreateAvatar(username: string, defaultLane: LaneType = 'tier5_viewer'): Avatar {
    let av = this.findAvatar(username);
    if (!av) {
      if (this.avatars.length >= this.MAX_CROWD) {
        // Recycle a Tier 5 lurker
        const lurker = this.avatars.find(a => a.lane === 'tier5_viewer' && !a.isJumping);
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
      const y = defaultLane === 'tier5_viewer' ? 700 + Math.random() * 80 : 850;
      av = new Avatar(`user_${this.nextId++}`, username, defaultLane, x, y);
      this.addAvatar(av);
    }
    return av;
  }

  // --- TIKTOK LIVE EVENT HANDLERS ---

  // 1. Join Event -> Places user in Tier 5 (İzleyiciler)
  public handleJoin(username: string): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier5_viewer');
    return av;
  }

  // 2. Follow Event -> Promotes to Tier 4 (Takipçiler)
  public handleFollow(username: string): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier5_viewer');
    av.isFollower = true;

    // Target position in Tier 4 (Y: 820-910)
    const targetX = 120 + Math.random() * 840;
    const targetY = 820 + Math.random() * 90;

    av.jumpTo(targetX, targetY, 'tier4_follower', 1.2);
    setTimeout(() => {
      av.say('Takipteyim! 🚀', 4);
    }, 800);

    return av;
  }

  // 3. Like Event -> Promotes to Tier 3 (Takipçi olup beğeni atanlar, 1dk / 60sn kalır)
  public handleLike(username: string, particles: ParticleSystem): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier4_follower');
    av.isFollower = true;

    // Reset or set 60-second timer for Tier 3
    av.likeTierTimer = 60; // 1 minute in Tier 3

    if (av.lane === 'tier5_viewer' || av.lane === 'tier4_follower') {
      const targetX = 140 + Math.random() * 800;
      const targetY = 930 + Math.random() * 100;
      av.jumpTo(targetX, targetY, 'tier3_liker', 1.1);
    }

    particles.triggerHearts(av.x, av.y - 20, 5);
    return av;
  }

  // 4. Gift Event -> Tier 2 (10sn) or Top 3 VIP (Tier 1, 15sn)
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

    // Check if user qualifies for Top 3 VIP (Tier 1)
    this.refreshTop3VipRanking(av, particles, giftName, tier);

    return av;
  }

  // Evaluate Top 3 VIP placement
  private refreshTop3VipRanking(
    currentGifter: Avatar,
    particles: ParticleSystem,
    giftName: string,
    tier: GiftTier
  ) {
    // Sort all gifters by totalDiamonds descending
    const gifters = [...this.avatars]
      .filter(a => a.totalDiamonds > 0)
      .sort((a, b) => b.totalDiamonds - a.totalDiamonds);

    const top3 = gifters.slice(0, 3);
    const isInTop3 = top3.includes(currentGifter);

    if (isInTop3) {
      // Place in Tier 1 VIP (15 sn)
      currentGifter.isTop3Vip = true;
      currentGifter.vipTimer = 15; // 15 seconds

      // Assign VIP slot
      const rankIdx = top3.indexOf(currentGifter);
      const slot = this.vipSlots[rankIdx];
      slot.occupiedBy = currentGifter;

      currentGifter.jumpTo(slot.x, slot.y, 'tier1_vip', 0.95);
      currentGifter.updateNameTag();

      // VIP visual celebration
      setTimeout(() => {
        if (tier === 'big') {
          particles.triggerBigGift(currentGifter.x, currentGifter.y, currentGifter.profile.glowColor);
          currentGifter.say(`👑 TŞK DJ! ${giftName}! 💎`, 5);
        } else if (tier === 'medium') {
          particles.triggerMediumGift(currentGifter.x, currentGifter.y, currentGifter.profile.glowColor);
          currentGifter.say(`🔥 ${giftName} x${currentGifter.giftStreak}!`, 4);
        } else {
          particles.triggerSmallGift(currentGifter.x, currentGifter.y, currentGifter.profile.glowColor);
          currentGifter.say(`🎁 ${giftName}!`, 3.5);
        }
      }, 450);
    } else {
      // Not top 3, but sent gift: enters Tier 2 (10 sn)
      currentGifter.isTop3Vip = false;
      currentGifter.giftTierTimer = 10; // 10 seconds in Tier 2

      const targetX = 160 + Math.random() * 760;
      const targetY = 1070 + Math.random() * 90;
      currentGifter.jumpTo(targetX, targetY, 'tier2_gifter', 0.95);
      currentGifter.updateNameTag();

      setTimeout(() => {
        particles.triggerSmallGift(currentGifter.x, currentGifter.y, currentGifter.profile.glowColor);
        currentGifter.say(`🎁 ${giftName}!`, 3.5);
      }, 400);
    }
  }

  // 5. Comment Event
  public handleComment(username: string, text: string): Avatar {
    const av = this.getOrCreateAvatar(username, 'tier4_follower');
    av.say(text, 4.5);
    return av;
  }

  // --- UPDATE TICKER (60 FPS) ---
  public update(dt: number, time: number, kickIntensity: number, particles: ParticleSystem) {
    // 1. Update all avatars (GPU transforms)
    for (let i = 0; i < this.avatars.length; i++) {
      const av = this.avatars[i];
      av.update(dt, time, kickIntensity, particles);

      // Handle Tier 1 (VIP) 15-second timer
      if (av.lane === 'tier1_vip' && !av.isJumping) {
        av.vipTimer -= dt;
        if (av.vipTimer <= 0) {
          // 15 seconds expired: step back to Tier 2 (Hediye katmanı)
          av.isTop3Vip = false;
          av.giftTierTimer = 8;
          const targetX = 160 + Math.random() * 760;
          const targetY = 1070 + Math.random() * 90;
          av.jumpTo(targetX, targetY, 'tier2_gifter', 1.0);
          av.updateNameTag();
        }
      }

      // Handle Tier 2 (Gifters) 10-second timer
      if (av.lane === 'tier2_gifter' && !av.isJumping) {
        av.giftTierTimer -= dt;
        if (av.giftTierTimer <= 0) {
          // 10 seconds expired: step back to Tier 3 (if likeTimer active) or Tier 4
          if (av.likeTierTimer > 0) {
            const targetX = 140 + Math.random() * 800;
            const targetY = 930 + Math.random() * 100;
            av.jumpTo(targetX, targetY, 'tier3_liker', 1.0);
          } else {
            const targetX = 120 + Math.random() * 840;
            const targetY = 820 + Math.random() * 90;
            av.jumpTo(targetX, targetY, 'tier4_follower', 1.0);
          }
          av.updateNameTag();
        }
      }

      // Handle Tier 3 (Liker) 60-second timer
      if (av.lane === 'tier3_liker' && !av.isJumping) {
        av.likeTierTimer -= dt;
        if (av.likeTierTimer <= 0) {
          // 1 minute expired: step back to Tier 4 (Takipçi katmanı)
          const targetX = 120 + Math.random() * 840;
          const targetY = 820 + Math.random() * 90;
          av.jumpTo(targetX, targetY, 'tier4_follower', 1.0);
          av.updateNameTag();
        }
      }
    }

    // 2. Y-Depth Sorting for proper overlap
    this.container.children.sort((a, b) => a.y - b.y);
  }
}
