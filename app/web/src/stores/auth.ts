import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface AuthUser {
  id: string;
  username: string;
}

// Session state for the app-native login (DEPLOY.md, Architecture).
// The session itself is an HttpOnly cookie the API owns; this store
// only mirrors "who am I" for the UI and the router guard.
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const checked = ref(false);

  async function fetchMe(): Promise<AuthUser | null> {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'same-origin',
      });
      user.value = res.ok ? ((await res.json()) as AuthUser) : null;
    } catch {
      user.value = null;
    } finally {
      checked.value = true;
    }
    return user.value;
  }

  async function login(
    username: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      return { ok: false, error: 'The recorder service is not answering. Try again in a moment.' };
    }
    if (!res.ok) {
      return {
        ok: false,
        error:
          res.status === 429
            ? 'Too many tries — wait a minute and try again.'
            : 'That username and password did not match. Check them and try again.',
      };
    }
    user.value = (await res.json()) as AuthUser;
    checked.value = true;
    return { ok: true };
  }

  async function logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } finally {
      user.value = null;
      // Full reload: drops any in-memory state and lands on /login
      // through the router guard.
      window.location.assign('/login');
    }
  }

  return { user, checked, fetchMe, login, logout };
});
