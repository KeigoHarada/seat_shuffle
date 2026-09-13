/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  useDonationStore,
  DEFAULT_DONATION_SETTINGS,
} from "../donation";

describe("useDonationStore", () => {
  beforeEach(() => {
    useDonationStore.setState({
      isDonationModalOpen: false,
      activeTab: "plans",
      selectedTierAmount: 1000,
      customAmount: "1000",
      donationSettings: { ...DEFAULT_DONATION_SETTINGS },
      donationRecords: [],
      isCelebrating: false,
    });
  });

  it("opens and closes donation modal", () => {
    const store = useDonationStore.getState();
    expect(store.isDonationModalOpen).toBe(false);

    store.openDonationModal("plans");
    expect(useDonationStore.getState().isDonationModalOpen).toBe(true);
    expect(useDonationStore.getState().activeTab).toBe("plans");

    store.closeDonationModal();
    expect(useDonationStore.getState().isDonationModalOpen).toBe(false);
  });

  it("switches active tab", () => {
    const store = useDonationStore.getState();
    store.setActiveTab("message");
    expect(useDonationStore.getState().activeTab).toBe("message");

    store.setActiveTab("settings");
    expect(useDonationStore.getState().activeTab).toBe("settings");

    store.setActiveTab("history");
    expect(useDonationStore.getState().activeTab).toBe("history");
  });

  it("selects tier amount and updates custom amount", () => {
    const store = useDonationStore.getState();
    store.setSelectedTierAmount(3000);
    expect(useDonationStore.getState().selectedTierAmount).toBe(3000);
    expect(useDonationStore.getState().customAmount).toBe("3000");

    store.setSelectedTierAmount(null);
    expect(useDonationStore.getState().selectedTierAmount).toBe(null);

    store.setCustomAmount("1500");
    expect(useDonationStore.getState().customAmount).toBe("1500");
  });

  it("updates and resets donation settings", () => {
    const store = useDonationStore.getState();
    store.updateDonationSettings({
      ofuseUrl: "https://ofuse.me/custom_user",
      stripePaymentUrl: "https://buy.stripe.com/test12345",
    });

    const updated = useDonationStore.getState().donationSettings;
    expect(updated.ofuseUrl).toBe("https://ofuse.me/custom_user");
    expect(updated.stripePaymentUrl).toBe("https://buy.stripe.com/test12345");

    store.resetDonationSettings();
    const reset = useDonationStore.getState().donationSettings;
    expect(reset.ofuseUrl).toBe(DEFAULT_DONATION_SETTINGS.ofuseUrl);
    expect(reset.stripePaymentUrl).toBe("");
  });

  it("adds donation records, updates totals and triggers celebration", () => {
    const store = useDonationStore.getState();
    expect(store.hasDonated()).toBe(false);
    expect(store.totalDonationAmount()).toBe(0);

    const record = store.addDonationRecord({
      amount: 1000,
      name: "テスト先生",
      message: "素晴らしいツールをありがとうございます！",
      method: "アプリ内応援",
    });

    expect(record.id).toBeDefined();
    expect(record.timestamp).toBeDefined();
    expect(record.amount).toBe(1000);
    expect(record.name).toBe("テスト先生");

    const state = useDonationStore.getState();
    expect(state.hasDonated()).toBe(true);
    expect(state.donationRecords.length).toBe(1);
    expect(state.totalDonationAmount()).toBe(1000);
    expect(state.isCelebrating).toBe(true);

    // Add a second record
    store.addDonationRecord({
      amount: 3000,
      name: "佐藤教諭",
      message: "クラス替えがとてもスムーズでした！",
      method: "アプリ内応援",
    });

    const state2 = useDonationStore.getState();
    expect(state2.donationRecords.length).toBe(2);
    expect(state2.totalDonationAmount()).toBe(4000);

    // Clear records
    store.clearDonationRecords();
    expect(useDonationStore.getState().donationRecords.length).toBe(0);
    expect(useDonationStore.getState().hasDonated()).toBe(false);
    expect(useDonationStore.getState().totalDonationAmount()).toBe(0);
  });
});
