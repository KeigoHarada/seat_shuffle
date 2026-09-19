import React from "react";
import { Heart, ExternalLink } from "lucide-react";

export const SupportSection: React.FC = () => {
  return (
    <div
      style={{
        padding: "var(--spacing-md)",
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h3
        className="text-title3"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: 0,
        }}
      >
        <Heart size={18} style={{ color: "var(--c-primary)" }} />
        <span>開発者を応援・寄付する</span>
      </h3>

      <p
        style={{
          fontSize: "12px",
          color: "var(--c-text-sub)",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        ラクガエは教育現場を応援するため、完全無料・広告なしで個人開発・運営されています。
        もし役立ちましたら、温かい応援メッセージやご支援をいただけると励みになります！
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "4px",
        }}
      >
        <a
          id="btn-support-donate"
          href="https://ofuse.me/o?uid=218335"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 24px",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          <Heart size={16} />
          <span>応援メッセージ・寄付を送る</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default SupportSection;
