import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  user: {
    email: string;
    sub: string;
    roles: string[]; // Multi-role array (replaces single `role?` field)
  } | null;
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
      setAccessToken: (access) => {
        try {
          // Decode JWT payload (cửa sổ browser dùng atob)
          const base64Url = access.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decodedUser = JSON.parse(jsonPayload);
          set({ accessToken: access, user: decodedUser, isExpired: false });
        } catch (e) {
          console.error('Failed to decode token', e);
          set({ accessToken: access, isExpired: false });
        }
      },
      setUser: (user) => set({ user }),
      setExpired: (expired) => set({ isExpired: expired }),
      logout: () => set({ accessToken: null, user: null, isExpired: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
