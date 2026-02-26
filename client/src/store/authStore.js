import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

// ── Module-level singletons (survive StrictMode re-mounts) ──

let _initialized = false;
let _authSubscription = null;

/**
 * Refresh mutex — ensures only one refreshSession() call is in-flight at a time.
 * All concurrent callers share the same promise, preventing
 * "Invalid Refresh Token: Already Used" errors.
 */
let _refreshPromise = null;

async function _refreshSessionOnce() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = supabase.auth.refreshSession().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

/**
 * Decode the `exp` claim from a JWT without a library.
 * Returns the expiry as a Unix timestamp (seconds), or null if decoding fails.
 */
function _getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp || null;
  } catch {
    return null;
  }
}

/**
 * Check if a token is still usable (valid for at least `bufferSeconds` more seconds).
 * Default buffer: 60 seconds — gives enough headroom to complete the API call.
 */
function _isTokenFresh(token, bufferSeconds = 60) {
  const exp = _getTokenExpiry(token);
  if (!exp) return false;
  return exp - Date.now() / 1000 > bufferSeconds;
}

export { _refreshSessionOnce };

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

            // Token refresh — only update session, do NOT touch isAuthenticated
            // This prevents ProtectedRoute from re-rendering and unmounting child pages
            if (event === 'TOKEN_REFRESHED' && session) {
              set({ session, user: session.user });
              return;
            }

            // Explicit sign-out — clear everything
            if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              });
              return;
            }

            // All other events (SIGNED_IN, USER_UPDATED, etc.)
            if (session) {
              set({
                user: session.user,
                session,
                isAuthenticated: true,
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

      /**
       * Get a FRESH access token for API calls.
       *
       * Flow:
       *   1. Check in-memory session — if token expires in >60s, return it immediately
       *   2. If token is missing or expiring soon — proactively refresh via mutex
       *   3. If refresh fails — try getSession() as a last resort
       *   4. If everything fails — return null (caller should handle logout)
       */
      getAccessToken: async () => {
        // 1. Fast path — in-memory token is still fresh
        const currentSession = get().session;
        console.log('[AUTH getAccessToken] Step 1 — in-memory session:', {
          hasSession: !!currentSession,
          hasToken: !!currentSession?.access_token,
          isFresh: currentSession?.access_token ? _isTokenFresh(currentSession.access_token) : false,
          expiry: currentSession?.access_token ? _getTokenExpiry(currentSession.access_token) : null,
          nowUnix: Math.floor(Date.now() / 1000),
        });
        if (currentSession?.access_token && _isTokenFresh(currentSession.access_token)) {
          console.log('[AUTH getAccessToken] → Returning fresh in-memory token');
          return currentSession.access_token;
        }

        // 2. Token is missing or expiring soon — proactively refresh
        try {
          console.log('[AUTH getAccessToken] Step 2 — calling refreshSession...');
          const { data: { session }, error } = await _refreshSessionOnce();
          console.log('[AUTH getAccessToken] Step 2 result:', {
            hasSession: !!session,
            hasToken: !!session?.access_token,
            error: error?.message,
          });

          if (!error && session?.access_token) {
            set({ session, user: session.user, isAuthenticated: true });
            return session.access_token;
          }
        } catch (e) {
          console.error('[AUTH getAccessToken] Step 2 EXCEPTION:', e);
        }

        // 3. Last resort — maybe auto-refresh completed in the background
        try {
          console.log('[AUTH getAccessToken] Step 3 — trying getSession fallback...');
          const { data: { session: fallbackSession } } = await supabase.auth.getSession();
          console.log('[AUTH getAccessToken] Step 3 result:', {
            hasSession: !!fallbackSession,
            hasToken: !!fallbackSession?.access_token,
            isFresh: fallbackSession?.access_token ? _isTokenFresh(fallbackSession.access_token, 10) : false,
          });
          if (fallbackSession?.access_token && _isTokenFresh(fallbackSession.access_token, 10)) {
            set({ session: fallbackSession, user: fallbackSession.user, isAuthenticated: true });
            return fallbackSession.access_token;
          }
        } catch (e) {
          console.error('[AUTH getAccessToken] Step 3 EXCEPTION:', e);
        }

        console.warn('[AUTH getAccessToken] ALL paths failed — returning null');
        return null;
      },
    }),
    {
      name: 'crown-auth-store',
      partialize: (state) => ({
        // Only persist safe user metadata — NOT the session/access_token
        // IMPORTANT: Do NOT persist isAuthenticated — it must be derived from
        // the actual session during initialize(). Persisting it creates
        // phantom sessions where the UI shows the user as logged in but
        // there's no valid token to make API calls.
        user: state.user
          ? { email: state.user.email, user_metadata: state.user.user_metadata }
          : null,
      }),
    }
  )
);
