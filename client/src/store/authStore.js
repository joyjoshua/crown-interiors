import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

// Track initialization outside the store to survive StrictMode re-mounts
let _initialized = false;
let _authSubscription = null;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      // Initialize — check for existing session (runs only once)
      initialize: async () => {
        // Guard: prevent duplicate initialization (React StrictMode calls this twice)
        if (_initialized) return;
        _initialized = true;

        try {
          const { data: { session } } = await supabase.auth.getSession();

          // Single state update — set everything at once to avoid cascading re-renders
          set({
            user: session?.user ?? null,
            session: session ?? null,
            isAuthenticated: !!session,
            isLoading: false,
          });

          // Clean up any previous listener
          if (_authSubscription) {
            _authSubscription.unsubscribe();
            _authSubscription = null;
          }

          // Listen for future auth state changes (login, logout, token refresh)
          // Skip INITIAL_SESSION — already handled above via getSession()
          // Skip SIGNED_IN during init — Supabase fires it right after INITIAL_SESSION
          const initTime = Date.now();
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Skip events that fire redundantly during initialization
            if (event === 'INITIAL_SESSION') return;

            // Supabase fires SIGNED_IN immediately after registration if a session exists.
            // Ignore it if it fires within 2s of init (we already set state via getSession).
            if (event === 'SIGNED_IN' && Date.now() - initTime < 2000) return;

            if (session) {
              set({
                user: session.user,
                session,
                isAuthenticated: true,
              });
            } else {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              });
            }
          });

          _authSubscription = subscription;
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },

      // Login
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: true,
        });
        return data;
      },

      // Logout
      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      // Get access token for API calls — use Supabase session directly
      getAccessToken: async () => {
        // Prefer in-memory session for fast access
        const inMemoryToken = get().session?.access_token;
        if (inMemoryToken) return inMemoryToken;

        // Fallback to Supabase's built-in session management
        try {
          const { data: { session } } = await supabase.auth.getSession();
          return session?.access_token || null;
        } catch {
          return null;
        }
      },
    }),
    {
      name: 'crown-auth-store',
      partialize: (state) => ({
        // Only persist safe user metadata — NOT the session/access_token
        user: state.user
          ? { email: state.user.email, user_metadata: state.user.user_metadata }
          : null,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

