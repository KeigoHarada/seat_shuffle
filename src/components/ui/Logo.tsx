import React from "react";

export interface LogoProps {
  /** サイズバリエーション または ピクセル高さ (デフォルト: "md" / 36px) */
  size?: "sm" | "md" | "lg" | number;
  /** 「席替え支援Webアプリ」などのサブタグラインを表示するか */
  showTagline?: boolean;
  /** 表示バリエーション: フルロゴ(full)、コンパクト(compact)、アイコンのみ(icon)、テキストのみ(text) */
  variant?: "full" | "compact" | "icon" | "text";
  /** タイトルタグを h1 としてアクセシビリティマークアップするか (デフォルト: true) */
  asH1?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ラクガエのブランドシンボルマーク (SVG)
 */
export const BrandSymbol: React.FC<{
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 36, className, style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        borderRadius: `${(size * 16) / 64}px`,
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="rakugae-sym-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter
          id="rakugae-sym-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.5"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      {/* ベース Squircle */}
      <rect width="64" height="64" rx="16" fill="url(#rakugae-sym-grad)" />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* 上部円弧矢印 (左席 → 右席) */}
      <path
        d="M 32 16 C 43 16 48 21 48 28"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 44.5 25 L 48 28.5 L 51.5 25"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 下部円弧矢印 (右席 → 左席) */}
      <path
        d="M 32 48 C 21 48 16 43 16 36"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 19.5 39 L 16 35.5 L 12.5 39"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 左上の座席カード (ブルーグループ) */}
      <g filter="url(#rakugae-sym-shadow)">
        <rect x="13" y="14" width="18" height="14" rx="3.5" fill="#FFFFFF" />
        <rect x="15.5" y="16.5" width="13" height="3" rx="1.5" fill="#93C5FD" />
        <circle cx="17.5" cy="23.5" r="1.5" fill="#CBD5E1" />
        <circle cx="22" cy="23.5" r="1.5" fill="#CBD5E1" />
        <circle cx="26.5" cy="23.5" r="1.5" fill="#CBD5E1" />
      </g>

      {/* 右下の座席カード (ピンクグループ) */}
      <g filter="url(#rakugae-sym-shadow)">
        <rect x="33" y="36" width="18" height="14" rx="3.5" fill="#FFFFFF" />
        <rect x="35.5" y="38.5" width="13" height="3" rx="1.5" fill="#FCA5A5" />
        <circle cx="37.5" cy="45.5" r="1.5" fill="#CBD5E1" />
        <circle cx="42" cy="45.5" r="1.5" fill="#CBD5E1" />
        <circle cx="46.5" cy="45.5" r="1.5" fill="#CBD5E1" />
      </g>

      {/* 中央のきらめき (ワクワク感・ラク) */}
      <path
        d="M 32 29 Q 32 32 35 32 Q 32 32 32 35 Q 32 32 29 32 Q 32 32 32 29 Z"
        fill="#FEF3C7"
      />
    </svg>
  );
};

/**
 * ラクガエの完全なSVGタイトルロゴ (SVGベクターグラフィック)
 */
export const LogoSvg: React.FC<{
  height?: number;
  showTagline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ height = 36, showTagline = false, className, style }) => {
  if (!showTagline) {
    // コンパクト版 (比率 160:36)
    const width = (height * 160) / 36;
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 160 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0, ...style }}
        aria-label="ラクガエ"
        role="img"
      >
        <defs>
          <linearGradient
            id="svg-logo-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <filter
            id="svg-logo-shadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
          </filter>
        </defs>
        <g transform="translate(2, 2)">
          <rect width="32" height="32" rx="8" fill="url(#svg-logo-grad)" />
          <rect
            x="0.6"
            y="0.6"
            width="30.8"
            height="30.8"
            rx="7.4"
            stroke="#FFFFFF"
            strokeOpacity="0.25"
            strokeWidth="0.8"
          />
          <path
            d="M 16 8 C 21.5 8 24 10.5 24 14"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 22 12.5 L 24 14.5 L 26 12.5"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 16 24 C 10.5 24 8 21.5 8 18"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 10 19.5 L 8 17.5 L 6 19.5"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <g filter="url(#svg-logo-shadow)">
            <rect x="6.5" y="7" width="9" height="7" rx="2" fill="#FFFFFF" />
            <rect
              x="7.5"
              y="8"
              width="7"
              height="1.6"
              rx="0.8"
              fill="#93C5FD"
            />
            <circle cx="8.8" cy="11.8" r="0.7" fill="#CBD5E1" />
            <circle cx="11" cy="11.8" r="0.7" fill="#CBD5E1" />
            <circle cx="13.2" cy="11.8" r="0.7" fill="#CBD5E1" />
          </g>
          <g filter="url(#svg-logo-shadow)">
            <rect x="16.5" y="18" width="9" height="7" rx="2" fill="#FFFFFF" />
            <rect
              x="17.5"
              y="19"
              width="7"
              height="1.6"
              rx="0.8"
              fill="#FCA5A5"
            />
            <circle cx="18.8" cy="22.8" r="0.7" fill="#CBD5E1" />
            <circle cx="21" cy="22.8" r="0.7" fill="#CBD5E1" />
            <circle cx="23.2" cy="22.8" r="0.7" fill="#CBD5E1" />
          </g>
          <path
            d="M 16 14.5 Q 16 16 17.5 16 Q 16 16 16 17.5 Q 16 16 14.5 16 Q 16 16 16 14.5 Z"
            fill="#FEF3C7"
          />
        </g>
        <text
          x="44"
          y="25"
          fontFamily="'Zen Maru Gothic', 'Rounded Mplus 1c', sans-serif"
          fontSize="20"
          fontWeight="700"
          fill="#334155"
          letterSpacing="0.04em"
        >
          ラクガエ
        </text>
      </svg>
    );
  }

  // タグライン付き標準版 (比率 220:48)
  const width = (height * 220) / 48;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-label="ラクガエ - 席替え支援Webアプリ"
      role="img"
    >
      <defs>
        <linearGradient
          id="svg-logo-full-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter
          id="svg-logo-full-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="1.2"
            stdDeviation="1.2"
            floodOpacity="0.15"
          />
        </filter>
      </defs>
      <g transform="translate(4, 4)">
        <rect width="40" height="40" rx="10" fill="url(#svg-logo-full-grad)" />
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          rx="9.25"
          stroke="#FFFFFF"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <path
          d="M 20 10 C 27 10 30 13 30 17.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 27.5 15.5 L 30 18 L 32.5 15.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 20 30 C 13 30 10 27 10 22.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 12.5 24.5 L 10 22 L 7.5 24.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <g filter="url(#svg-logo-full-shadow)">
          <rect x="8" y="9" width="11.5" height="9" rx="2.5" fill="#FFFFFF" />
          <rect x="9.5" y="10.5" width="8.5" height="2" rx="1" fill="#93C5FD" />
          <circle cx="11" cy="15" r="0.9" fill="#CBD5E1" />
          <circle cx="13.7" cy="15" r="0.9" fill="#CBD5E1" />
          <circle cx="16.5" cy="15" r="0.9" fill="#CBD5E1" />
        </g>
        <g filter="url(#svg-logo-full-shadow)">
          <rect
            x="20.5"
            y="22"
            width="11.5"
            height="9"
            rx="2.5"
            fill="#FFFFFF"
          />
          <rect x="22" y="23.5" width="8.5" height="2" rx="1" fill="#FCA5A5" />
          <circle cx="23.5" cy="28" r="0.9" fill="#CBD5E1" />
          <circle cx="26.2" cy="28" r="0.9" fill="#CBD5E1" />
          <circle cx="29" cy="28" r="0.9" fill="#CBD5E1" />
        </g>
        <path
          d="M 20 18 Q 20 20 22 20 Q 20 20 20 22 Q 20 20 18 20 Q 20 20 20 18 Z"
          fill="#FEF3C7"
        />
      </g>
      <text
        x="54"
        y="28"
        fontFamily="'Zen Maru Gothic', 'Rounded Mplus 1c', sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#334155"
        letterSpacing="0.04em"
      >
        ラクガエ
      </text>
      <text
        x="55"
        y="42"
        fontFamily="'Zen Maru Gothic', 'Rounded Mplus 1c', sans-serif"
        fontSize="9.5"
        fontWeight="500"
        fill="#64748B"
        letterSpacing="0.03em"
      >
        席替え支援Webアプリ
      </text>
    </svg>
  );
};

/**
 * ラクガエのブランドタイトルロゴコンポーネント
 */
export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showTagline = false,
  variant = "full",
  asH1 = true,
  className,
  style,
}) => {
  const pixelHeight =
    typeof size === "number"
      ? size
      : size === "sm"
        ? 28
        : size === "lg"
          ? 44
          : 34;

  const TitleWrapper = asH1 ? "h1" : "div";

  return (
    <TitleWrapper
      className={className}
      style={{
        margin: 0,
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
        ...style,
      }}
    >
      {variant === "icon" ? (
        <BrandSymbol size={pixelHeight} />
      ) : (
        <LogoSvg height={pixelHeight} showTagline={showTagline} />
      )}
    </TitleWrapper>
  );
};

export default Logo;
