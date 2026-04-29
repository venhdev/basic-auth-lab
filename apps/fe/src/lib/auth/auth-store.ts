import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  user: any | null;
  isExpired: boolean;
  setAccessToken: (access: string) => void;
  setUser: (user: any) => void;
  setExpired: (expired: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isExpired: false,
      setAccessToken: (access) => set({ accessToken: access, isExpired: false }),
      setUser: (user) => set({ user }),
      setExpired: (expired) => set({ isExpired: expired }),
      logout: () => set({ accessToken: null, user: null, isExpired: false }),
    }),
    {
      name: 'auth-storage',
      // Access token can stay in localStorage for now (M4 demo)
    }
  )
);
