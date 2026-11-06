export type LaneType = 'back' | 'mid' | 'front';

export interface AvatarData {
  id: string;
  username: string;
  lane: LaneType;
  colorScheme: AvatarColorScheme;
  visorColor: number;
  glowColor: number;
  scale: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  danceStyle: 'moon_bounce' | 'zero_g_flip' | 'electronic_jump' | 'vip_rave';
  giftStreak: number;
  vipTimer: number; // seconds remaining in VIP
  isJumping: boolean;
  jumpProgress: number;
  jumpHeight: number;
  jumpStartX: number;
  jumpStartY: number;
  isDj?: boolean;
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
