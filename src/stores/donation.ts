import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DonationSettings {
  ofuseUrl: string;
  buyMeACoffeeUrl: string;
  githubSponsorsUrl: string;
  stripePaymentUrl: string;
  amazonWishlistUrl: string;
  customDonationUrl: string;
}

export interface DonationRecord {
  id: string;
  timestamp: string;
  amount: number;
  name: string;
  message: string;
  method: string;
}

export const DEFAULT_DONATION_SETTINGS: DonationSettings = {
  ofuseUrl: "https://ofuse.me/keigoharada",
  buyMeACoffeeUrl: "https://buymeacoffee.com/keigoharada",
  githubSponsorsUrl: "https://github.com/sponsors/KeigoHarada",
  stripePaymentUrl: "",
  amazonWishlistUrl: "",
  customDonationUrl: "",
};

export type DonationTab = "plans" | "message" | "history" | "settings";

export interface DonationStoreState {
  isDonationModalOpen: boolean;
  activeTab: DonationTab;
  selectedTierAmount: number | null;
  customAmount: string;
  donationSettings: DonationSettings;
  donationRecords: DonationRecord[];
  isCelebrating: boolean;

  // Actions
  openDonationModal: (tab?: DonationTab) => void;
  closeDonationModal: () => void;
  setActiveTab: (tab: DonationTab) => void;
  setSelectedTierAmount: (amount: number | null) => void;
  setCustomAmount: (amount: string) => void;
  updateDonationSettings: (updates: Partial<DonationSettings>) => void;
  resetDonationSettings: () => void;
  addDonationRecord: (
    record: Omit<DonationRecord, "id" | "timestamp">,
  ) => DonationRecord;
  clearDonationRecords: () => void;
  triggerCelebration: () => void;
  stopCelebration: () => void;

  // Selectors
  hasDonated: () => boolean;
  totalDonationAmount: () => number;
}

export const useDonationStore = create<DonationStoreState>()(
  persist(
    (set, get) => ({
      isDonationModalOpen: false,
      activeTab: "plans",
      selectedTierAmount: 1000,
      customAmount: "1000",
      donationSettings: { ...DEFAULT_DONATION_SETTINGS },
      donationRecords: [],
      isCelebrating: false,

      openDonationModal: (tab = "plans") =>
        set({ isDonationModalOpen: true, activeTab: tab }),

      closeDonationModal: () =>
        set({ isDonationModalOpen: false, isCelebrating: false }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setSelectedTierAmount: (amount) => {
        set({
          selectedTierAmount: amount,
          customAmount: amount !== null ? String(amount) : get().customAmount,
        });
      },

      setCustomAmount: (amount) => {
        set({ customAmount: amount });
      },

      updateDonationSettings: (updates) => {
        set((state) => ({
          donationSettings: { ...state.donationSettings, ...updates },
        }));
      },

      resetDonationSettings: () => {
        set({ donationSettings: { ...DEFAULT_DONATION_SETTINGS } });
      },

      addDonationRecord: (record) => {
        const newRecord: DonationRecord = {
          ...record,
          id: `donation-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          donationRecords: [newRecord, ...state.donationRecords],
        }));

        get().triggerCelebration();
        return newRecord;
      },

      clearDonationRecords: () => set({ donationRecords: [] }),

      triggerCelebration: () => {
        set({ isCelebrating: true });
        setTimeout(() => {
          set({ isCelebrating: false });
        }, 4000);
      },

      stopCelebration: () => set({ isCelebrating: false }),

      hasDonated: () => get().donationRecords.length > 0,

      totalDonationAmount: () =>
        get().donationRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0),
    }),
    {
      name: "rakugae-donation-storage",
      partialize: (state) => ({
        donationSettings: state.donationSettings,
        donationRecords: state.donationRecords,
      }),
    },
  ),
);
