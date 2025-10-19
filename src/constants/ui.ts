// UI関連の定数
export const UI_CONSTANTS = {
  // 座席レイアウト
  SEAT_WIDTH: 220,
  SEAT_HEIGHT: 160,
  SEAT_GAP: 8,
  
  // 教壇
  TEACHER_DESK_WIDTH: 350,
  TEACHER_DESK_HEIGHT: 80,
  TEACHER_DESK_MARGIN: 8,
  
  // フォントサイズ
  FONT_SIZE: {
    LARGE: 36,
    MEDIUM: 32,
    SMALL: 30,
    TINY: 22,
    MICRO: 18,
    NANO: 12,
    PICO: 9
  },
  
  // マージン・パディング
  MARGIN: {
    SMALL: 2,
    MEDIUM: 4,
    LARGE: 6,
    XLARGE: 8
  },
  
  // アイコンサイズ
  ICON_SIZE: {
    SMALL: 12,
    MEDIUM: 16,
    LARGE: 18
  },
  
  // アニメーション
  ANIMATION: {
    MAX_DELAY: 0.5,
    DURATION: 1000
  },
  
  // レイアウト
  LAYOUT: {
    WINDOW_MARGIN: 10,
    HEADER_HEIGHT: 150,
    MAX_ROLES_DISPLAY: 3,
    RANDOM_SORT_OFFSET: 0.5
  },
  
  // 空席率
  EMPTY_SEAT_RATIO: 0.2
} as const;
