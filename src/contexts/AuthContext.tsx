import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface ProfessionalMockState {
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

type ProfessionalActivationInput = Pick<
  ProfessionalMockState,
  "professionalName" | "specialty" | "location" | "description" | "categoryType" | "subcategoryId"
>;

const PROFESSIONAL_MOCK_STORAGE_KEY = "agendapro_professional_mock_v1";

export const README_PROFESSIONAL_MOCK_TEMPLATE: Omit<ProfessionalMockState, "userId"> = {
  professionalName: "Dra. Paula Ortega",
  specialty: "Psicología",
  location: "Madrid, España",
  description: "Atención personalizada para terapia online y presencial.",
  categoryType: "wellness",
  subcategoryId: "psychology",
  freeBookingLimit: 5,
  freeBookingsUsed: 0,
  subscriptionActive: false,
  onboardingCompleted: true,
};

type MockStore = Record<string, ProfessionalMockState>;

function canUseWindow() {
  return typeof window !== "undefined";
}

function readProfessionalStore(): MockStore {
  if (!canUseWindow()) return {};

  try {
    const raw = window.localStorage.getItem(PROFESSIONAL_MOCK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockStore) : {};
  } catch {
    return {};
  }
}

function writeProfessionalStore(store: MockStore) {
  if (!canUseWindow()) return;
  window.localStorage.setItem(PROFESSIONAL_MOCK_STORAGE_KEY, JSON.stringify(store));
}

function getStoredProfessionalState(userId: string | null | undefined) {
  if (!userId) return null;
  return readProfessionalStore()[userId] ?? null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { full_name: string | null; avatar_url: string | null; phone: string | null } | null;
  professionalState: ProfessionalMockState | null;
  professionalMockTemplate: Omit<ProfessionalMockState, "userId">;
  activateProfessionalProfile: (input: ProfessionalActivationInput) => ProfessionalMockState | null;
  simulateProfessionalBooking: () => ProfessionalMockState | null;
  activateProfessionalSubscription: () => ProfessionalMockState | null;
  resetProfessionalProgress: () => ProfessionalMockState | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  professionalState: null,
  professionalMockTemplate: README_PROFESSIONAL_MOCK_TEMPLATE,
  activateProfessionalProfile: () => null,
  simulateProfessionalBooking: () => null,
  activateProfessionalSubscription: () => null,
  resetProfessionalProgress: () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [professionalState, setProfessionalState] = useState<ProfessionalMockState | null>(null);

  const persistProfessionalState = (nextState: ProfessionalMockState | null) => {
    if (!user) return null;

    const store = readProfessionalStore();

    if (nextState) {
      store[user.id] = nextState;
    } else {
      delete store[user.id];
    }

    writeProfessionalStore(store);
    setProfessionalState(nextState);
    return nextState;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setProfessionalState(getStoredProfessionalState(session?.user?.id));
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setProfessionalState(getStoredProfessionalState(session?.user?.id));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfessionalState(null);
      return;
    }

    setProfessionalState(getStoredProfessionalState(user.id));

    supabase
      .from("profiles")
      .select("full_name, avatar_url, phone")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  useEffect(() => {
    if (!user || !canUseWindow()) return;

    const syncProfessionalState = () => {
      setProfessionalState(getStoredProfessionalState(user.id));
    };

    window.addEventListener("storage", syncProfessionalState);
    return () => window.removeEventListener("storage", syncProfessionalState);
  }, [user]);

  const activateProfessionalProfile = (input: ProfessionalActivationInput) => {
    if (!user) return null;

    return persistProfessionalState({
      userId: user.id,
      ...README_PROFESSIONAL_MOCK_TEMPLATE,
      ...input,
      freeBookingLimit: professionalState?.freeBookingLimit ?? README_PROFESSIONAL_MOCK_TEMPLATE.freeBookingLimit,
      freeBookingsUsed: professionalState?.freeBookingsUsed ?? README_PROFESSIONAL_MOCK_TEMPLATE.freeBookingsUsed,
      subscriptionActive: professionalState?.subscriptionActive ?? README_PROFESSIONAL_MOCK_TEMPLATE.subscriptionActive,
      onboardingCompleted: true,
    });
  };

  const simulateProfessionalBooking = () => {
    if (!professionalState) return null;
    if (!professionalState.subscriptionActive && professionalState.freeBookingsUsed >= professionalState.freeBookingLimit) {
      return professionalState;
    }

    return persistProfessionalState({
      ...professionalState,
      freeBookingsUsed: professionalState.subscriptionActive
        ? professionalState.freeBookingsUsed + 1
        : Math.min(professionalState.freeBookingsUsed + 1, professionalState.freeBookingLimit),
    });
  };

  const activateProfessionalSubscription = () => {
    if (!professionalState) return null;
    return persistProfessionalState({ ...professionalState, subscriptionActive: true });
  };

  const resetProfessionalProgress = () => {
    if (!professionalState) return null;
    return persistProfessionalState({
      ...professionalState,
      freeBookingsUsed: README_PROFESSIONAL_MOCK_TEMPLATE.freeBookingsUsed,
      subscriptionActive: README_PROFESSIONAL_MOCK_TEMPLATE.subscriptionActive,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      profile,
      professionalState,
      professionalMockTemplate: README_PROFESSIONAL_MOCK_TEMPLATE,
      activateProfessionalProfile,
      simulateProfessionalBooking,
      activateProfessionalSubscription,
      resetProfessionalProgress,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
