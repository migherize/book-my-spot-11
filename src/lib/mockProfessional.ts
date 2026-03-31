import { useSyncExternalStore } from "react";

export interface MockProfessionalState {
  userId: string;
  professionalName: string;
  specialty: string;
  location: string;
  description: string;
  categoryType: "health" | "beauty" | "wellness";
  subcategoryId: string;
  freeBookingLimit: number;
  freeBookingsUsed: number;
  subscriptionActive: boolean;
  onboardingCompleted: boolean;
}

const STORAGE_KEY = "agendapro_professional_mock_v1";
const STORE_EVENT = "agendapro:professional-mock-change";

type MockStore = Record<string, MockProfessionalState>;

function canUseWindow() {
  return typeof window !== "undefined";
}

function getEmptyStore(): MockStore {
  return {};
}

function readStore(): MockStore {
  if (!canUseWindow()) return getEmptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockStore) : getEmptyStore();
  } catch {
    return getEmptyStore();
  }
}

function writeStore(store: MockStore) {
  if (!canUseWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function getMockProfessional(userId: string | null | undefined) {
  if (!userId) return null;
  return readStore()[userId] ?? null;
}

export function saveMockProfessional(state: MockProfessionalState) {
  const store = readStore();
  store[state.userId] = state;
  writeStore(store);
  return state;
}

export function incrementMockBookings(userId: string) {
  const current = getMockProfessional(userId);
  if (!current) return null;
  if (!current.subscriptionActive && current.freeBookingsUsed >= current.freeBookingLimit) {
    return current;
  }
  return saveMockProfessional({
    ...current,
    freeBookingsUsed: current.subscriptionActive ? current.freeBookingsUsed + 1 : Math.min(current.freeBookingsUsed + 1, current.freeBookingLimit),
  });
}

export function activateMockSubscription(userId: string) {
  const current = getMockProfessional(userId);
  if (!current) return null;
  return saveMockProfessional({ ...current, subscriptionActive: true });
}

export function resetMockProfessional(userId: string) {
  const current = getMockProfessional(userId);
  if (!current) return null;
  return saveMockProfessional({ ...current, freeBookingsUsed: 0, subscriptionActive: false });
}

function subscribe(callback: () => void) {
  if (!canUseWindow()) return () => undefined;
  const handler = () => callback();
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useMockProfessional(userId: string | null | undefined) {
  return useSyncExternalStore(subscribe, () => getMockProfessional(userId), () => null);
}

export function getMockProfessionalPayload(userId: string | null | undefined) {
  const state = getMockProfessional(userId);
  if (!state) return null;
  return {
    professionalStatus: {
      userId: state.userId,
      professionalName: state.professionalName,
      specialty: state.specialty,
      location: state.location,
      description: state.description,
      categoryType: state.categoryType,
      subcategoryId: state.subcategoryId,
      freeBookingLimit: state.freeBookingLimit,
      freeBookingsUsed: state.freeBookingsUsed,
      subscriptionActive: state.subscriptionActive,
      onboardingCompleted: state.onboardingCompleted,
    },
  };
}