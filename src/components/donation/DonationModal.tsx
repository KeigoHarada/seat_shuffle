import React, { useState, useEffect } from "react";
import {
  Heart,
  X,
  Coffee,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  Award,
  Settings,
  RotateCcw,
  MessageSquare,
  Gift,
  CreditCard,
  Share2,
} from "lucide-react";
import {
  useDonationStore,
  DonationTab,
  DEFAULT_DONATION_SETTINGS,
} from "../../stores/donation";
import { showToast } from "../../stores/toast";
import DonationConfetti from "./DonationConfetti";

const TIER_OPTIONS = [
  {
    amount: 300,
    label: "コーヒー1杯コース",
    icon: "☕",
    desc: "日々の開発のリフレッシュに！",
  },
  {
    amount: 1000,
    label: "ランチ応援コース",
    icon: "🍱",
    desc: "サーバー・ドメイン維持の補助に！",
  },
  {
    amount: 3000,
    label: "開発ブーストコース",
    icon: "🚀",
    desc: "新機能・アルゴリズム改善の推進に！",
  },
  {
    amount: 5000,
    label: "ゴールドサポーター",
    icon: "👑",
    desc: "長期的な安定運用と継続改善を強力支援！",
  },
];

export const DonationModal: React.FC = () => {
  const isOpen = useDonationStore((state) => state.isDonationModalOpen);
  const closeDonationModal = useDonationStore(
    (state) => state.closeDonationModal,
  );
  const activeTab = useDonationStore((state) => state.activeTab);
  const setActiveTab = useDonationStore((state) => state.setActiveTab);
  const selectedTierAmount = useDonationStore(
    (state) => state.selectedTierAmount,
  );
  const setSelectedTierAmount = useDonationStore(
    (state) => state.setSelectedTierAmount,
  );
  const customAmount = useDonationStore((state) => state.customAmount);
  const setCustomAmount = useDonationStore((state) => state.setCustomAmount);
  const donationSettings = useDonationStore((state) => state.donationSettings);
  const updateDonationSettings = useDonationStore(
    (state) => state.updateDonationSettings,
  );
  const resetDonationSettings = useDonationStore(
    (state) => state.resetDonationSettings,
  );
  const donationRecords = useDonationStore((state) => state.donationRecords);
  const addDonationRecord = useDonationStore(
    (state) => state.addDonationRecord,
  );
  const clearDonationRecords = useDonationStore(
    (state) => state.clearDonationRecords,
  );
  const isCelebrating = useDonationStore((state) => state.isCelebrating);
  const totalDonationAmount = useDonationStore((state) =>
    state.totalDonationAmount(),
  );

  // Local form state for in-app message
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [hasJustSubmitted, setHasJustSubmitted] = useState(false);

  // Local form state for settings tab
  const [settingsForm, setSettingsForm] = useState(donationSettings);

  // Copied state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync settingsForm when modal opens or settings change
  useEffect(() => {
    setSettingsForm(donationSettings);
  }, [donationSettings, isOpen]);

  // Keyboard close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDonationModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDonationModal]);

  if (!isOpen) return null;

  const currentAmountNumber =
    selectedTierAmount !== null
      ? selectedTierAmount
      : Math.max(100, parseInt(customAmount, 10) || 1000);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast.success("URLをクリップボードにコピーしました！");
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSendInAppDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = currentAmountNumber;
    const name = donorName.trim() || "匿名の先生 / サポーター";
    const message =
      donorMessage.trim() ||
      "ラクガエの開発を応援しています！いつもありがとうございます。";

    addDonationRecord({
      amount,
      name,
      message,
      method: "アプリ内応援",
    });

    setHasJustSubmitted(true);
    showToast.success("温かい応援と寄付をありがとうございます！");
  };

  const handleShareOnX = () => {
    const text = encodeURIComponent(
      "学校の席替え支援アプリ「ラクガエ」の開発を応援しました！🎉\n条件指定で座席を自動配置できる便利ツールです。\n#ラクガエ #席替え #教育現場 #学校の先生",
    );
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateDonationSettings(settingsForm);
    showToast.success("寄付先URL設定を保存しました");
  };

  const handleResetSettings = () => {
    resetDonationSettings();
    setSettingsForm({ ...DEFAULT_DONATION_SETTINGS });
    showToast.info("寄付先URL設定を初期値に戻しました");
  };

  return (
    <div
      className="modal-overlay"
      onClick={closeDonationModal}
      style={{ zIndex: 999 }}
    >
      {isCelebrating && <DonationConfetti />}

      <div
        className="modal-content"
        style={{
          maxWidth: "680px",
          width: "92%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #fff1f2 0%, #fff7ed 50%, #fef3c7 100%)",
            padding: "24px 24px 18px 24px",
            borderBottom: "1px solid var(--c-border)",
            position: "relative",
          }}
        >
          <button
            onClick={closeDonationModal}
            className="modal-close-btn"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--radius-full)",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="閉じる (Esc)"
          >
            <X size={18} />
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "#ffe4e6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <Heart size={26} color="#e11d48" fill="#fda4af" />
            </div>
            <div>
              <h2
                className="text-title1"
                style={{
                  fontSize: "20px",
                  margin: 0,
                  color: "var(--c-text-main)",
                }}
              >
                ラクガエの開発を応援・寄付する
              </h2>
              <span
                style={{
                  fontSize: "12px",
                  color: "#be123c",
                  fontWeight: 700,
                  backgroundColor: "#ffe4e6",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  display: "inline-block",
                  marginTop: "2px",
                }}
              >
                完全無料・オープンソース支援 ☕✨
              </span>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "var(--c-text-sub)",
              lineHeight: 1.5,
            }}
          >
            ラクガエは教育現場の負担軽減のため、個人で開発し完全無料で提供しています。
            温かいご寄付や応援メッセージは、ツールのサーバー維持・ドメイン費用、新機能開発の大きな励みとなります！
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--c-border)",
            backgroundColor: "var(--c-surface)",
            padding: "0 var(--spacing-md)",
          }}
        >
          {[
            { id: "plans", label: "💖 寄付コース・方法" },
            { id: "message", label: "💬 メッセージで応援" },
            {
              id: "history",
              label: `🏆 サポーター特典${donationRecords.length > 0 ? ` (${donationRecords.length})` : ""}`,
            },
            { id: "settings", label: "⚙️ 寄付先URL設定" },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`donation-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as DonationTab);
                if (tab.id === "message") setHasJustSubmitted(false);
              }}
              style={{
                flex: 1,
                padding: "12px 6px",
                border: "none",
                background: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid #e11d48"
                    : "2px solid transparent",
                color: activeTab === tab.id ? "#e11d48" : "var(--c-text-sub)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                transition: "var(--transition-fast)",
                textAlign: "center",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* TAB 1: PLANS & PLATFORMS */}
          {activeTab === "plans" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Tier Selection */}
              <div>
                <h3
                  className="text-title3"
                  style={{
                    fontSize: "15px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>1. 応援コース（目安金額）を選ぶ</span>
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {TIER_OPTIONS.map((tier) => {
                    const isSelected = selectedTierAmount === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => setSelectedTierAmount(tier.amount)}
                        style={{
                          padding: "12px 10px",
                          borderRadius: "var(--radius-lg)",
                          border: isSelected
                            ? "2px solid #e11d48"
                            : "1px solid var(--c-border)",
                          backgroundColor: isSelected
                            ? "#fff1f2"
                            : "var(--c-surface)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          gap: "4px",
                          transition: "all var(--transition-fast)",
                          boxShadow: isSelected
                            ? "0 2px 8px rgba(225, 29, 72, 0.15)"
                            : "var(--shadow-1)",
                        }}
                      >
                        <span style={{ fontSize: "22px" }}>{tier.icon}</span>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "15px",
                            color: isSelected ? "#be123c" : "var(--c-text-main)",
                          }}
                        >
                          ¥{tier.amount.toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: isSelected ? "#e11d48" : "var(--c-text-sub)",
                          }}
                        >
                          {tier.label}
                        </span>
                      </button>
                    );
                  })}

                  {/* Custom Tier */}
                  <button
                    type="button"
                    onClick={() => setSelectedTierAmount(null)}
                    style={{
                      padding: "12px 10px",
                      borderRadius: "var(--radius-lg)",
                      border:
                        selectedTierAmount === null
                          ? "2px solid #e11d48"
                          : "1px solid var(--c-border)",
                      backgroundColor:
                        selectedTierAmount === null
                          ? "#fff1f2"
                          : "var(--c-surface)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "4px",
                      transition: "all var(--transition-fast)",
                      boxShadow:
                        selectedTierAmount === null
                          ? "0 2px 8px rgba(225, 29, 72, 0.15)"
                          : "var(--shadow-1)",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>✏️</span>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "14px",
                        color:
                          selectedTierAmount === null
                            ? "#be123c"
                            : "var(--c-text-main)",
                      }}
                    >
                      自由金額
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--c-text-sub)",
                        fontWeight: 600,
                      }}
                    >
                      任意の金額
                    </span>
                  </button>
                </div>

                {/* Custom Amount Input if chosen */}
                {selectedTierAmount === null && (
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#fff1f2",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>
                      金額 (円):
                    </span>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="1000"
                      style={{
                        width: "140px",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--c-border)",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "var(--c-text-sub)" }}>
                      ※100円以上のお好きな金額
                    </span>
                  </div>
                )}
              </div>

              {/* Donation Platforms Selection */}
              <div>
                <h3
                  className="text-title3"
                  style={{
                    fontSize: "15px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>2. 寄付方法（プラットフォーム）を選ぶ</span>
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* OFUSE */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--c-border)",
                      backgroundColor: "var(--c-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>💌</span>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: "15px",
                                color: "var(--c-text-main)",
                              }}
                            >
                              OFUSE (オフセ)
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                backgroundColor: "#ecfdf5",
                                color: "#047857",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "var(--radius-full)",
                              }}
                            >
                              おすすめ・メッセージ付き
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--c-text-sub)",
                              margin: "2px 0 0 0",
                            }}
                          >
                            応援メッセージやファンレターを添えて手軽に寄付。PayPayやクレジットカード対応・会員登録不要！
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            handleCopy(donationSettings.ofuseUrl, "ofuse")
                          }
                          style={{
                            padding: "6px 10px",
                            fontSize: "12px",
                            gap: "4px",
                          }}
                          title="URLをコピー"
                        >
                          {copiedKey === "ofuse" ? (
                            <Check size={14} color="#10b981" />
                          ) : (
                            <Copy size={14} />
                          )}
                          コピー
                        </button>
                        <a
                          href={donationSettings.ofuseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{
                            padding: "6px 14px",
                            fontSize: "13px",
                            backgroundColor: "#f43f5e",
                            borderColor: "#e11d48",
                            gap: "6px",
                            textDecoration: "none",
                            color: "#ffffff",
                          }}
                        >
                          OFUSEで寄付する
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Buy Me a Coffee */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--c-border)",
                      backgroundColor: "var(--c-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>☕</span>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: "15px",
                                color: "var(--c-text-main)",
                              }}
                            >
                              Buy Me a Coffee
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                backgroundColor: "#fef3c7",
                                color: "#b45309",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "var(--radius-full)",
                              }}
                            >
                              世界標準・1クリック
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--c-text-sub)",
                              margin: "2px 0 0 0",
                            }}
                          >
                            クレジットカード、Apple Pay、Google
                            Payでコーヒーを1杯ごちそうできます。
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            handleCopy(
                              donationSettings.buyMeACoffeeUrl,
                              "buymeacoffee",
                            )
                          }
                          style={{
                            padding: "6px 10px",
                            fontSize: "12px",
                            gap: "4px",
                          }}
                          title="URLをコピー"
                        >
                          {copiedKey === "buymeacoffee" ? (
                            <Check size={14} color="#10b981" />
                          ) : (
                            <Copy size={14} />
                          )}
                          コピー
                        </button>
                        <a
                          href={donationSettings.buyMeACoffeeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{
                            padding: "6px 14px",
                            fontSize: "13px",
                            backgroundColor: "#f59e0b",
                            borderColor: "#d97706",
                            gap: "6px",
                            textDecoration: "none",
                            color: "#ffffff",
                          }}
                        >
                          コーヒーをごちそうする
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Sponsors */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--c-border)",
                      backgroundColor: "var(--c-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>🐙</span>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: "15px",
                                color: "var(--c-text-main)",
                              }}
                            >
                              GitHub Sponsors
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "var(--radius-full)",
                              }}
                            >
                              定期・単発支援
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--c-text-sub)",
                              margin: "2px 0 0 0",
                            }}
                          >
                            GitHub経由で開発者 KeigoHarada
                            を直接スポンサー・応援します。
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            handleCopy(
                              donationSettings.githubSponsorsUrl,
                              "github",
                            )
                          }
                          style={{
                            padding: "6px 10px",
                            fontSize: "12px",
                            gap: "4px",
                          }}
                          title="URLをコピー"
                        >
                          {copiedKey === "github" ? (
                            <Check size={14} color="#10b981" />
                          ) : (
                            <Copy size={14} />
                          )}
                          コピー
                        </button>
                        <a
                          href={donationSettings.githubSponsorsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{
                            padding: "6px 14px",
                            fontSize: "13px",
                            gap: "6px",
                            textDecoration: "none",
                            borderColor: "#334155",
                            color: "#334155",
                          }}
                        >
                          Sponsorsで支援
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Stripe Payment Link (if set) */}
                  {donationSettings.stripePaymentUrl && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--c-border)",
                        backgroundColor: "var(--c-surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "var(--shadow-1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <CreditCard size={20} color="#6366f1" />
                        <div>
                          <span style={{ fontWeight: 800, fontSize: "15px" }}>
                            Stripe 決済
                          </span>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--c-text-sub)",
                              margin: "2px 0 0 0",
                            }}
                          >
                            クレジットカード等による直接オンライン決済
                          </p>
                        </div>
                      </div>
                      <a
                        href={donationSettings.stripePaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                          padding: "6px 14px",
                          fontSize: "13px",
                          backgroundColor: "#6366f1",
                          borderColor: "#4f46e5",
                          textDecoration: "none",
                          color: "#ffffff",
                          gap: "6px",
                        }}
                      >
                        Stripeで支払う
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {/* Amazon Wishlist / Gift (if set) */}
                  {donationSettings.amazonWishlistUrl && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--c-border)",
                        backgroundColor: "var(--c-surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "var(--shadow-1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Gift size={20} color="#f97316" />
                        <div>
                          <span style={{ fontWeight: 800, fontSize: "15px" }}>
                            Amazon ほしい物リスト / ギフト
                          </span>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--c-text-sub)",
                              margin: "2px 0 0 0",
                            }}
                          >
                            Amazonギフト券やほしい物リストでの支援
                          </p>
                        </div>
                      </div>
                      <a
                        href={donationSettings.amazonWishlistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{
                          padding: "6px 14px",
                          fontSize: "13px",
                          textDecoration: "none",
                          gap: "6px",
                        }}
                      >
                        Amazonを開く
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {/* Custom Donation Link (if set) */}
                  {donationSettings.customDonationUrl && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--c-border)",
                        backgroundColor: "var(--c-surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "var(--shadow-1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Sparkles size={20} color="#f59e0b" />
                        <div>
                          <span style={{ fontWeight: 800, fontSize: "15px" }}>
                            その他・寄付ページ
                          </span>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--c-text-sub)",
                              margin: "2px 0 0 0",
                            }}
                          >
                            設定済みのカスタム寄付リンク
                          </p>
                        </div>
                      </div>
                      <a
                        href={donationSettings.customDonationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                          padding: "6px 14px",
                          fontSize: "13px",
                          textDecoration: "none",
                          color: "#ffffff",
                          gap: "6px",
                        }}
                      >
                        寄付ページを開く
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {/* Shortcut to In-App Support Message */}
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px dashed #f43f5e",
                      backgroundColor: "#fff1f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <MessageSquare size={20} color="#e11d48" />
                      <div>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "#be123c",
                          }}
                        >
                          応援メッセージをアプリ内で送る
                        </span>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#e11d48",
                            margin: "2px 0 0 0",
                          }}
                        >
                          先生方からの温かい一言が、一番の開発の原動力になります！
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={() => {
                        setActiveTab("message");
                        setHasJustSubmitted(false);
                      }}
                      style={{
                        padding: "6px 14px",
                        fontSize: "13px",
                        backgroundColor: "#e11d48",
                        borderColor: "#be123c",
                        gap: "6px",
                      }}
                    >
                      <Send size={14} /> メッセージを送る
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IN-APP MESSAGE & SIMULATION */}
          {activeTab === "message" && (
            <div>
              {hasJustSubmitted ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "#ffe4e6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "var(--shadow-2)",
                    }}
                  >
                    <Heart size={36} color="#e11d48" fill="#fda4af" />
                  </div>

                  <div>
                    <h3
                      className="text-title2"
                      style={{ color: "#be123c", marginBottom: "8px" }}
                    >
                      🎉 温かい応援・ご寄付をありがとうございます！
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--c-text-sub)",
                        maxWidth: "460px",
                        lineHeight: 1.6,
                        margin: "0 auto",
                      }}
                    >
                      あなたからの温かい応援メッセージとお気持ちをしっかり受け止めました。
                      先生方や教育に関わる方々の日々の業務が少しでもラクになるよう、これからもラクガエを育てていきます！
                    </p>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#fef3c7",
                      border: "1px solid #fde047",
                      padding: "8px 16px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#b45309",
                    }}
                  >
                    <Award size={18} /> ✨ 公認ラクガエサポーターに認定されました！
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "12px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className="btn-primary"
                      onClick={handleShareOnX}
                      style={{
                        backgroundColor: "#1d9bf0",
                        borderColor: "#1a8cd8",
                        gap: "6px",
                        padding: "8px 18px",
                      }}
                    >
                      <Share2 size={16} /> X (Twitter) でシェア
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setActiveTab("history")}
                      style={{ gap: "6px", padding: "8px 18px" }}
                    >
                      <Award size={16} /> サポーター履歴を見る
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setHasJustSubmitted(false);
                        setDonorMessage("");
                      }}
                      style={{ padding: "8px 18px" }}
                    >
                      もう一度送る
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSendInAppDonation}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#fff1f2",
                      border: "1px solid #fecdd3",
                      borderRadius: "var(--radius-lg)",
                      padding: "14px 18px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#be123c",
                        lineHeight: 1.5,
                      }}
                    >
                      💡
                      アプリ内で応援メッセージと寄付の記録を残すことができます。送信すると「公認サポーターバッジ」が付与され、履歴に記録されます！
                    </p>
                  </div>

                  {/* Donor Name */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "6px",
                        color: "var(--c-text-main)",
                      }}
                    >
                      お名前 / ニックネーム（任意）
                    </label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="例: 〇〇小学校 5年担任, 田中先生"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--c-border)",
                        fontSize: "14px",
                        backgroundColor: "var(--c-surface)",
                      }}
                    />
                  </div>

                  {/* Donation Amount */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "6px",
                        color: "var(--c-text-main)",
                      }}
                    >
                      応援・寄付金額
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      {[300, 1000, 3000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setSelectedTierAmount(amt);
                            setCustomAmount(String(amt));
                          }}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "var(--radius-md)",
                            border:
                              currentAmountNumber === amt &&
                              selectedTierAmount !== null
                                ? "2px solid #e11d48"
                                : "1px solid var(--c-border)",
                            backgroundColor:
                              currentAmountNumber === amt &&
                              selectedTierAmount !== null
                                ? "#fff1f2"
                                : "var(--c-surface)",
                            fontWeight: 700,
                            fontSize: "13px",
                            cursor: "pointer",
                            color:
                              currentAmountNumber === amt &&
                              selectedTierAmount !== null
                                ? "#e11d48"
                                : "var(--c-text-main)",
                          }}
                        >
                          ¥{amt.toLocaleString()}
                        </button>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span style={{ fontSize: "13px" }}>¥</span>
                        <input
                          type="number"
                          min="100"
                          step="100"
                          value={customAmount}
                          onChange={(e) => {
                            setSelectedTierAmount(null);
                            setCustomAmount(e.target.value);
                          }}
                          style={{
                            width: "100px",
                            padding: "8px 10px",
                            borderRadius: "var(--radius-md)",
                            border:
                              selectedTierAmount === null
                                ? "2px solid #e11d48"
                                : "1px solid var(--c-border)",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Encouragement Message */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "6px",
                        color: "var(--c-text-main)",
                      }}
                    >
                      応援メッセージ
                    </label>
                    <textarea
                      rows={4}
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      placeholder="例: 新学期の席替えでいつも時間がかかっていたのが、ラクガエのおかげで数分で決まりました！子どもたちもワクワクしながら席替えを楽しんでいます。応援しています！"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--c-border)",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "6px",
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{
                        padding: "10px 24px",
                        fontSize: "15px",
                        backgroundColor: "#e11d48",
                        borderColor: "#be123c",
                        gap: "8px",
                      }}
                    >
                      <Heart size={18} fill="#ffffff" />
                      ¥{currentAmountNumber.toLocaleString()} で応援・寄付する
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SUPPORTER HISTORY & PERKS */}
          {activeTab === "history" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {donationRecords.length > 0 ? (
                <>
                  {/* Supporter Badge Summary */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #fef3c7 0%, #ffedd5 50%, #ffe4e6 100%)",
                      border: "1px solid #fde68a",
                      borderRadius: "var(--radius-xl)",
                      padding: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: "#f59e0b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        <Award size={30} />
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "17px",
                              fontWeight: 800,
                              color: "#92400e",
                            }}
                          >
                            ✨ 公認ラクガエサポーター
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "13px",
                            color: "#b45309",
                          }}
                        >
                          支援総額:{" "}
                          <strong style={{ fontSize: "16px" }}>
                            ¥{totalDonationAmount.toLocaleString()}
                          </strong>{" "}
                          ({donationRecords.length}回の応援)
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={handleShareOnX}
                      style={{
                        backgroundColor: "#1d9bf0",
                        borderColor: "#1a8cd8",
                        gap: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <Share2 size={14} /> Xでシェア
                    </button>
                  </div>

                  {/* Donation Timeline */}
                  <div>
                    <h4
                      className="text-title3"
                      style={{ fontSize: "14px", marginBottom: "10px" }}
                    >
                      これまでの応援・寄付履歴
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {donationRecords.map((rec) => {
                        const dateFormatted = new Date(
                          rec.timestamp,
                        ).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={rec.id}
                            style={{
                              padding: "12px 16px",
                              borderRadius: "var(--radius-lg)",
                              border: "1px solid var(--c-border)",
                              backgroundColor: "var(--c-surface)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              boxShadow: "var(--shadow-1)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  style={{ fontWeight: 700, fontSize: "14px" }}
                                >
                                  {rec.name}
                                </span>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--c-text-sub)",
                                  }}
                                >
                                  {dateFormatted}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: "14px",
                                  color: "#e11d48",
                                }}
                              >
                                ¥{rec.amount.toLocaleString()}
                              </span>
                            </div>
                            {rec.message && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "13px",
                                  color: "var(--c-text-main)",
                                  backgroundColor: "var(--c-bg-main)",
                                  padding: "8px 12px",
                                  borderRadius: "var(--radius-md)",
                                  lineHeight: 1.4,
                                }}
                              >
                                「{rec.message}」
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        marginTop: "14px",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="btn-danger-outline"
                        onClick={() => {
                          if (
                            window.confirm(
                              "寄付・応援履歴を消去しますか？この操作は元に戻せません。",
                            )
                          ) {
                            clearDonationRecords();
                            showToast.info("履歴をクリアしました");
                          }
                        }}
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                      >
                        履歴をクリア
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Coffee size={40} color="var(--c-text-sub)" />
                  <h4 className="text-title3" style={{ margin: 0 }}>
                    まだ寄付・応援の記録はありません
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--c-text-sub)",
                      maxWidth: "400px",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    ご寄付や応援メッセージをいただくと、ここにサポーターバッジと履歴が表示されます。
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab("plans")}
                    style={{
                      marginTop: "8px",
                      backgroundColor: "#f43f5e",
                      borderColor: "#e11d48",
                      gap: "6px",
                    }}
                  >
                    <Heart size={16} fill="#ffffff" /> 寄付コースを見る
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS (ADMIN / CUSTOM URLS) */}
          {activeTab === "settings" && (
            <form
              onSubmit={handleSaveSettings}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  backgroundColor: "var(--c-bg-main)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "12px 16px",
                }}
              >
                <h4
                  className="text-title3"
                  style={{
                    fontSize: "13px",
                    margin: "0 0 4px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Settings size={15} /> 寄付先URLのカスタマイズ
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--c-text-sub)",
                    lineHeight: 1.4,
                  }}
                >
                  ご自身のアカウントのURLに変更できます。設定したURLはブラウザ内に保存され、モーダルのリンク先として適用されます。
                </p>
              </div>

              {/* OFUSE URL */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  OFUSE (オフセ) URL
                </label>
                <input
                  type="url"
                  value={settingsForm.ofuseUrl}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, ofuseUrl: e.target.value })
                  }
                  placeholder="https://ofuse.me/..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--c-border)",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* Buy Me a Coffee URL */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  Buy Me a Coffee URL
                </label>
                <input
                  type="url"
                  value={settingsForm.buyMeACoffeeUrl}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      buyMeACoffeeUrl: e.target.value,
                    })
                  }
                  placeholder="https://buymeacoffee.com/..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--c-border)",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* GitHub Sponsors URL */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  GitHub Sponsors URL
                </label>
                <input
                  type="url"
                  value={settingsForm.githubSponsorsUrl}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      githubSponsorsUrl: e.target.value,
                    })
                  }
                  placeholder="https://github.com/sponsors/..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--c-border)",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* Stripe Payment URL */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  Stripe Payment Link URL（任意）
                </label>
                <input
                  type="url"
                  value={settingsForm.stripePaymentUrl}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      stripePaymentUrl: e.target.value,
                    })
                  }
                  placeholder="https://buy.stripe.com/..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--c-border)",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* Amazon Wishlist URL */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  Amazon ほしい物リスト / ギフト URL（任意）
                </label>
                <input
                  type="url"
                  value={settingsForm.amazonWishlistUrl}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      amazonWishlistUrl: e.target.value,
                    })
                  }
                  placeholder="https://www.amazon.jp/hz/wishlist/..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--c-border)",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* Custom Donation URL */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  その他のカスタム寄付URL（任意）
                </label>
                <input
                  type="url"
                  value={settingsForm.customDonationUrl}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      customDonationUrl: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--c-border)",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* Settings Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleResetSettings}
                  style={{ gap: "6px", fontSize: "12px" }}
                >
                  <RotateCcw size={14} /> 初期値に戻す
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ gap: "6px", fontSize: "13px" }}
                >
                  <Check size={16} /> 設定を保存する
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid var(--c-border)",
            backgroundColor: "var(--c-bg-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "var(--c-text-sub)",
              lineHeight: 1.4,
            }}
          >
            ※ 寄付は任意です。ラクガエのすべての機能は寄付の有無に関わらず、完全無料でご利用いただけます。
          </span>
          <button
            className="btn-secondary"
            onClick={closeDonationModal}
            style={{ padding: "6px 16px", fontSize: "13px", flexShrink: 0 }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
