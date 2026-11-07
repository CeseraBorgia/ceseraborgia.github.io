export type LaneType =
  | 'dj_stage'        // 30 sn boyunca DJ'in yanında VIP dansı
  | 'tier4_gifter'    // En ön katman: Hediye atanlar (Süre sınırı olmadan kalıcı)
  | 'tier3_liker'     // Bir arka: Takipçi olup beğeni atanlar (60 sn)
  | 'tier2_follower'  // Bir arka: Takipçiler
  | 'tier1_viewer';   // En arka: İzleyiciler (öne çekilmiş & net)

export type HairStyle =
  | 'short_fade'
  | 'messy_spikes'
  | 'curly_afro'
  | 'long_ponytail'
  | 'cyber_braids'
  | 'cap_backwards'
  | 'curtains_parted'
  | 'buzzcut';

export type EyewearType =
  | 'none'            // Doğal insan gözü & kaş
  | 'cyber_visor'
  | 'neon_shades'
  | 'rave_goggles'
  | 'cat_eye';

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

export type DanceStyle =
  | 'hands_up_rave'
  | 'shuffle_groove'
  | 'headbang_bounce'
  | 'hiphop_dab'
  | 'disco_point'
  | 'spin_jump'
  | 'zero_g_float';

export interface AvatarProfile {
  skinColor: number;
  hairStyle: HairStyle;
  hairColor: number;
  eyeColor: number;
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
  hasPiercing: boolean;
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
