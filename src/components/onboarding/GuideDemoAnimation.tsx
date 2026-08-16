import React from "react";
import {
  LayoutGrid,
  Shield,
  Dices,
  Hand,
  Lock,
  Crown,
  Star,
  Shuffle,
  Sparkles,
  Eye,
} from "lucide-react";

interface GuideDemoAnimationProps {
  type: string;
}

export const GuideDemoAnimation: React.FC<GuideDemoAnimationProps> = ({
  type,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "190px",
        backgroundColor: "var(--c-bg-main)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--c-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      {/* Subtle Grid Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: 0.5,
        }}
      />

      {/* 1. TOUR ANIMATION */}
      {type === "tour" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "50px",
                backgroundColor: "var(--c-surface)",
                border: "2px solid var(--c-primary)",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 0 12px rgba(245, 158, 11, 0.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--c-text-main)",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <LayoutGrid size={12} /> 座席
              </span>
              <span style={{ fontSize: "9px", color: "var(--c-text-sub)" }}>
                ドラッグ移動
              </span>
            </div>

            <div
              style={{
                fontSize: "18px",
                color: "var(--c-primary)",
                fontWeight: 700,
              }}
            >
              ➔
            </div>

            <div
              style={{
                width: "80px",
                height: "50px",
                backgroundColor: "var(--c-primary-pale)",
                border: "1px solid var(--c-primary)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--c-primary-hover)",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Shield size={12} /> 条件設定
              </span>
              <span style={{ fontSize: "9px" }}>離す・一緒</span>
            </div>

            <div
              style={{
                fontSize: "18px",
                color: "var(--c-primary)",
                fontWeight: 700,
              }}
            >
              ➔
            </div>

            <div
              style={{
                padding: "8px 14px",
                backgroundColor: "var(--c-primary)",
                color: "#ffffff",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "12px",
                boxShadow: "0 4px 6px rgba(245, 158, 11, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>
                <Dices size={14} />
              </span>{" "}
              シャッフル！
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  width: i === 1 ? "20px" : "8px",
                  height: "8px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor:
                    i === 1 ? "var(--c-primary)" : "var(--c-border)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. SEATS ANIMATION */}
      {type === "seats" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            zIndex: 1,
          }}
        >
          {/* Seat 1 */}
          <div
            style={{
              width: "100px",
              height: "60px",
              backgroundColor: "var(--c-group-pink)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-2)",
              transform: "translateY(-6px)",
              border: "2px dashed var(--c-primary)",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--c-text-sub)" }}>
              1班 (赤)
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>あ太郎</span>
            <span
              style={{
                fontSize: "9px",
                color: "var(--c-primary-hover)",
                fontWeight: 700,
              }}
            >
              <Hand
                size={10}
                style={{
                  marginRight: "2px",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              />{" "}
              ドラッグ移動
            </span>
          </div>

          {/* Seat 2 */}
          <div
            style={{
              width: "100px",
              height: "60px",
              backgroundColor: "var(--c-group-blue)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-1)",
              border: "1px solid var(--c-border)",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--c-text-sub)" }}>
              2班 (青)
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>あ花子</span>
            <span style={{ fontSize: "9px", color: "var(--c-text-sub)" }}>
              <Lock size={10} style={{ marginRight: "2px" }} /> ロック可能
            </span>
          </div>
        </div>
      )}

      {/* 3. STUDENTS ANIMATION */}
      {type === "students" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "260px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              backgroundColor: "var(--c-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--c-border)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--c-text-sub)",
                }}
              >
                1番
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>あ太郎</span>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <span
                style={{
                  padding: "2px 6px",
                  backgroundColor: "var(--c-primary-pale)",
                  color: "var(--c-primary-hover)",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                <Crown size={12} style={{ marginRight: "2px" }} /> 班長
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              backgroundColor: "var(--c-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--c-border)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--c-text-sub)",
                }}
              >
                2番
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>あ花子</span>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <span
                style={{
                  padding: "2px 6px",
                  backgroundColor: "#e0f2fe",
                  color: "#0369a1",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                <Star size={12} style={{ marginRight: "2px" }} /> 副班長
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONSTRAINTS ANIMATION */}
      {type === "constraints" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "280px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--c-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--c-primary)",
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--c-primary-hover)",
                  fontWeight: 700,
                }}
              >
                <Shield size={12} style={{ marginRight: "2px" }} />{" "}
                生徒-生徒条件
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>
                あ太郎 と あ花子 を{" "}
                <span style={{ color: "#ef4444" }}>離す</span>
              </div>
            </div>
            <div
              style={{
                width: "36px",
                height: "20px",
                backgroundColor: "var(--c-primary)",
                borderRadius: "var(--radius-full)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "2px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "var(--radius-full)",
                  marginLeft: "auto",
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: "8px 14px",
              backgroundColor: "var(--c-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--c-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: 0.8,
            }}
          >
            <div>
              <div style={{ fontSize: "10px", color: "var(--c-text-sub)" }}>
                <Shield size={12} style={{ marginRight: "2px" }} /> 性別バランス
              </div>
              <div style={{ fontSize: "12px", fontWeight: 500 }}>
                各班 男子2人以上・女子2人以上
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "#16a34a",
                fontWeight: 700,
              }}
            >
              ✓ 有効
            </span>
          </div>
        </div>
      )}

      {/* 5. SHUFFLE ANIMATION */}
      {type === "shuffle" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                width: "70px",
                height: "46px",
                backgroundColor: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "var(--shadow-1)",
              }}
            >
              う太郎
            </div>
            <div
              style={{
                width: "70px",
                height: "46px",
                backgroundColor: "var(--c-group-pink)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "var(--shadow-1)",
              }}
            >
              い花子
            </div>
            <div
              style={{
                width: "70px",
                height: "46px",
                backgroundColor: "var(--c-group-blue)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "var(--shadow-1)",
              }}
            >
              お太郎
            </div>
          </div>

          <div
            style={{
              padding: "8px 20px",
              backgroundColor: "var(--c-primary)",
              color: "#ffffff",
              borderRadius: "var(--radius-xl)",
              fontWeight: 700,
              fontSize: "13px",
              boxShadow: "var(--shadow-2)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>
              <Shuffle size={14} />
            </span>{" "}
            シャッフル実行中... <Sparkles size={14} />
          </div>
        </div>
      )}

      {/* 6. VIEWMODE ANIMATION */}
      {type === "viewmode" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--c-surface-disabled)",
              padding: "4px",
              borderRadius: "var(--radius-full)",
              width: "160px",
              height: "36px",
              position: "relative",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "82px",
                width: "74px",
                height: "28px",
                backgroundColor: "var(--c-surface)",
                borderRadius: "var(--radius-full)",
                boxShadow: "var(--shadow-1)",
              }}
            />
            <span
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "12px",
                color: "var(--c-text-sub)",
                zIndex: 1,
              }}
            >
              編集
            </span>
            <span
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--c-text-main)",
                zIndex: 1,
              }}
            >
              <Eye
                size={12}
                style={{
                  marginRight: "2px",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              />{" "}
              閲覧
            </span>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "var(--c-text-sub)",
              textAlign: "center",
            }}
          >
            生徒に見せる時はロール・配慮色を隠して
            <br />
            プロジェクター表示に最適化！
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDemoAnimation;
