<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
  <div class="topbar">
    <span class="badge">
      <span class="dot"></span>
      System live — recorder, transcription &amp; email
    </span>
    <span class="badge">
      <span class="dot rec"></span>
      Private dashboard
    </span>
    <span class="date">Snapshot · Wed, Nov 25, 2026</span>
    <button v-if="auth.user" type="button" class="signout" @click="auth.logout()">
      Sign out
    </button>
  </div>
</template>
