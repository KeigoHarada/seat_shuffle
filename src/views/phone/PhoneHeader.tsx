import React, { useEffect, useRef, useState } from "react";
import { Download, MoreHorizontal, Sprout, Upload } from "lucide-react";
import { useCsvSettings } from "../../hooks/useCsvSettings";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import { useOnboardingStore } from "../../stores/onboarding";

interface PhoneHeaderProps {
  onOpenGlobal: () => void;
  onOpenLegal: () => void;
}

const PhoneHeader: React.FC<PhoneHeaderProps> = ({
  onOpenGlobal,
  onOpenLegal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openGuideHub = useOnboardingStore((state) => state.openGuideHub);
  const { handleSave, handleLoad } = useCsvSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  return (
    <header className="phone-header">
      <Logo size={24} />
      <div className="phone-header-actions">
        <div className="phone-more" ref={menuRef}>
          <button
            id="phone-more-btn"
            className="phone-icon-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="メニュー"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={20} />
          </button>
          {menuOpen && (
            <div className="phone-more-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  openGuideHub("tour");
                  setMenuOpen(false);
                }}
              >
                <Sprout size={16} /> はじめてガイド
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  fileInputRef.current?.click();
                  setMenuOpen(false);
                }}
              >
                <Upload size={16} /> 読み込み
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleSave();
                  setMenuOpen(false);
                }}
              >
                <Download size={16} /> 保存
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenGlobal();
                  setMenuOpen(false);
                }}
              >
                全体設定
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenLegal();
                  setMenuOpen(false);
                }}
              >
                利用規約・免責事項
              </button>
            </div>
          )}
        </div>
      </div>
      <Input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleLoad}
      />
    </header>
  );
};

export default PhoneHeader;
