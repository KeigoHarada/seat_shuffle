import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--spacing-md) var(--spacing-lg)",
            borderBottom: "1px solid var(--c-border)",
            backgroundColor: "var(--c-bg-main)",
            borderTopLeftRadius: "var(--radius-lg)",
            borderTopRightRadius: "var(--radius-lg)",
          }}
        >
          <h2
            style={{ margin: 0, fontSize: "18px", color: "var(--c-text-main)" }}
          >
            利用規約・プライバシーポリシー・免責事項
          </h2>
          <button
            className="btn-icon-danger"
            onClick={onClose}
            style={{
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: "var(--spacing-lg)",
            overflowY: "auto",
            color: "var(--c-text-main)",
            fontSize: "14px",
            lineHeight: 1.8,
          }}
        >
          <section style={{ marginBottom: "var(--spacing-xl)" }}>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "var(--spacing-sm)",
                borderBottom: "2px solid var(--c-primary-pale)",
                display: "inline-block",
              }}
            >
              利用規約
            </h3>
            <p>
              本ツール「ラクガエ」（以下「本サービス」）は、無料でご利用いただける座席決め支援ツールです。
              本サービスの利用にあたり、以下の事項に同意したものとみなします。
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li>
                本サービスは学校・教育現場や企業等のイベントで自由に利用・提示することができます。
              </li>
              <li>
                公序良俗に反する目的での利用、または本サービスの運営を妨害する行為を禁止します。
              </li>
              <li>
                本サービスは予告なく仕様の変更、または提供を終了する場合があります。
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "var(--spacing-xl)" }}>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "var(--spacing-sm)",
                borderBottom: "2px solid var(--c-primary-pale)",
                display: "inline-block",
              }}
            >
              プライバシーポリシー
            </h3>
            <p>
              本サービスでは、利用者のプライバシー保護とセキュリティを第一に考え、以下の通りデータを取り扱います。
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li>
                <strong>完全ローカル処理:</strong>{" "}
                本サービスに入力された氏名、性別、役割、グループ、制約等のデータは、全てご利用の端末（ブラウザのLocalStorage）内にのみ保存され、外部サーバーへ送信されることは一切ありません。
              </li>
              <li>
                <strong>個人情報の非収集:</strong>{" "}
                開発者や第三者が、入力された座席データや名簿データを閲覧・収集することは技術的に不可能な設計となっています。
              </li>
              <li>
                <strong>データの削除:</strong>{" "}
                ブラウザの履歴やCookie（LocalStorage）をクリアするか、本サービス内の「データを全消去」機能を利用することで、データは端末から完全に削除されます。
              </li>
            </ul>
          </section>

          <section>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "var(--spacing-sm)",
                borderBottom: "2px solid var(--c-primary-pale)",
                display: "inline-block",
              }}
            >
              免責事項
            </h3>
            <p>
              本サービスの利用により生じた直接的、間接的なトラブルや損害等について、開発者は一切の責任を負いません。
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li>
                座席シャッフルのアルゴリズムによる配置結果の完全性や、人間関係のトラブル防止等を保証するものではありません。
              </li>
              <li>
                データのバックアップは利用者自身の責任で行うものとし（バックアップ機能の利用等）、予期せぬブラウザのクラッシュ等によるデータ消失について開発者は責任を負いません。
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LegalModal;
