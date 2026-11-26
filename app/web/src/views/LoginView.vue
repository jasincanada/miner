<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ChristmasScene from '@/components/ChristmasScene.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);

async function submit(): Promise<void> {
  error.value = '';
  busy.value = true;
  const result = await auth.login(username.value.trim(), password.value);
  busy.value = false;
  if (result.ok) {
    await router.push({ name: 'dashboard' });
  } else {
    error.value = result.error ?? 'Sign-in failed. Try again.';
  }
}
</script>

<template>
  <ChristmasScene />
  <main class="login-wrap">
    <form class="login-card" @submit.prevent="submit">
      <p class="eyebrow">Your call recorder · Private</p>
      <h1>Sign in</h1>
      <p class="lede">
        This dashboard holds the details of your recording system, so it
        stays behind your password — yours alone.
      </p>

      <div v-if="error" class="login-error" role="alert">{{ error }}</div>

      <div class="field">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          name="username"
          type="text"
          autocomplete="username"
          required
        />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <button type="submit" class="btn primary login-submit" :disabled="busy">
        {{ busy ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </main>
</template>
