<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    value: string;
    label: string;
    hint?: string;
    primary?: boolean;
    mini?: boolean;
  }>(),
  { primary: false, mini: false },
);

const emit = defineEmits<{ copied: [value: string] }>();

const justCopied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy(): Promise<void> {
  let ok = false;
  try {
    await navigator.clipboard.writeText(props.value);
    ok = true;
  } catch {
    // Clipboard API can refuse (permissions, insecure context) — fall
    // back to the legacy textarea route the static page used.
    const ta = document.createElement('textarea');
    ta.value = props.value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
  }
  if (ok) {
    emit('copied', props.value);
    justCopied.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      justCopied.value = false;
    }, 2600);
  }
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <button
    v-if="mini"
    type="button"
    class="copy-mini"
    :aria-label="`Copy ${label}: ${value}`"
    @click="copy"
  >
    {{ justCopied ? 'Copied ✓' : 'Copy' }}
  </button>
  <button
    v-else
    type="button"
    class="btn"
    :class="{ primary }"
    :aria-label="`Copy ${label}: ${value}`"
    @click="copy"
  >
    <span>{{ justCopied ? 'Copied ✓' : label }}</span>
    <small v-if="hint">{{ hint }}</small>
  </button>
</template>
