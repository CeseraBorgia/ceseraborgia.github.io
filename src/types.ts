export type LaneType =
  | 'tier5_viewer'
  | 'tier4_follower'
  | 'tier3_liker'
  | 'tier2_gifter'
  | 'tier1_vip';

// Backward compatibility helper
export type LegacyLaneType = 'back' | 'mid' | 'front';

export type HairStyle =
  | 'short_fade'
  | 'messy_spikes'
  | 'curly_afro'
  | 'long_ponytail'
  | 'cyber_braids'
  | 'cap_backwards'
  | 'buzzcut';

export type EyewearType =
  | 'cyber_visor'
  | 'neon_shades'
  | 'rave_goggles'
  | 'cat_eye'
  | 'none';

export type TopStyle =
  | 'rave_hoodie'
  | 'crop_top'
  | 'lunar_jacket'
  | 'tech_vest'
  | 'cyber_tee';

export type BottomStyle =
  | 'cargo_pants'
  | 'shorts_leggings'
  | 'space_joggers'
  | 'cyber_jeans';

export interface AvatarProfile {
  skinColor: number;
  hairStyle: HairStyle;
  hairColor: number;
  eyewear: EyewearType;
  eyewearColor: number;
  topStyle: TopStyle;
  topColor: number;
  topAccent: number;
  bottomStyle: BottomStyle;
  bottomColor: number;
  shoeColor: number;
  glowColor: number;
  hasHeadphones: boolean;
}

export interface AvatarColorScheme {
  suitColor: number;
  suitAccent: number;
  visorGlow: number;
  jetpackFlame: number;
  nameColor: string;
}

export type GiftTier = 'small' | 'medium' | 'big';

export interface TikTokGiftEvent {
  id: string;
  userId: string;
  username: string;
  giftName: string;
  giftTier: GiftTier;
  giftCount: number;
  diamonds: number;
  timestamp: number;
}

export interface TikTokCommentEvent {
  id: string;
  userId: string;
  username: string;
  comment: string;
  timestamp: number;
}

export interface TikTokFollowEvent {
  id: string;
  userId: string;
  username: string;
  timestamp: number;
}

export interface TikTokLikeEvent {
  id: string;
  userId: string;
  username: string;
  likeCount: number;
  timestamp: number;
}

export interface TikTokJoinEvent {
  id: string;
  userId: string;
  username: string;
  timestamp: number;
}

export type TikTokEvent =
  | { type: 'gift'; data: TikTokGiftEvent }
  | { type: 'comment'; data: TikTokCommentEvent }
  | { type: 'follow'; data: TikTokFollowEvent }
  | { type: 'like'; data: TikTokLikeEvent }
  | { type: 'join'; data: TikTokJoinEvent };
