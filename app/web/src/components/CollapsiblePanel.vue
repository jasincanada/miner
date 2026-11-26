<script setup lang="ts">
import { ref } from 'vue';

// Pop-in / pop-out panel (Jas's design standard): secondary content
// lives tucked away by default and pops in when summoned. Used for
// the softphone sign-in details and the status list; main content
// (hero, pipeline, proof) never sits inside one of these.
const props = withDefaults(
  defineProps<{
    title: string;
    hint?: string;
    defaultOpen?: boolean;
    labelledBy?: string;
  }>(),
  { defaultOpen: false },
);

const open = ref(props.defaultOpen);
const panelId = `panel-${Math.random().toString(36).slice(2, 9)}`;
</script>

<template>
  <article class="panel" :class="{ open }">
    <button
      type="button"
      class="panel-toggle"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      <span>
        <span class="panel-title" :id="labelledBy">{{ title }}</span>
        <span v-if="hint" class="panel-hint">{{ hint }}</span>
      </span>
      <span class="panel-chevron" aria-hidden="true">▾</span>
    </button>
    <div class="panel-body" :id="panelId">
      <div class="panel-body-inner">
        <div class="panel-content">
          <slot />
        </div>
      </div>
    </div>
  </article>
</template>
