<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import CopyButton from './CopyButton.vue';

const copied = ref('');
let timer: ReturnType<typeof setTimeout> | undefined;

function onCopied(value: string): void {
  copied.value = `Copied: ${value}`;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    copied.value = '';
  }, 2600);
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

// Decorative equalizer bars inside the number card (ported from the
// static page; frozen by the global reduced-motion rules).
const bars = [
  { h: 14, d: '0s' }, { h: 28, d: '.08s' }, { h: 36, d: '.16s' },
  { h: 20, d: '.24s' }, { h: 32, d: '.32s' }, { h: 16, d: '.4s' },
  { h: 30, d: '.48s' }, { h: 22, d: '.56s' }, { h: 34, d: '.64s' },
  { h: 18, d: '.72s' }, { h: 26, d: '.8s' }, { h: 12, d: '.88s' },
  { h: 30, d: '.96s' }, { h: 20, d: '1.04s' },
];
</script>

<template>
  <section class="hero" aria-labelledby="h1">
    <p class="eyebrow">Your call recorder · Telnyx · One number only</p>
    <h1 id="h1">Every important call, recorded and written down for you.</h1>
    <p class="lede">
      Add this number to a call and it answers <strong>silently</strong>, records
      both sides, transcribes itself, and emails you the transcript. No app to
      babysit. No merging gymnastics once the softphone is signed in.
    </p>

    <div class="number-row">
      <div class="number-card">
        <div class="number-label">Recorder number — keep this one</div>
        <div class="number">778-752-9955</div>
        <div class="number-sub">
          The only number on your Telnyx account. The old 236 number has been
          released. When people see a call from your softphone, this is the
          number they’ll see.
        </div>
        <div class="wave" aria-hidden="true">
          <span
            v-for="(bar, i) in bars"
            :key="i"
            :style="{ height: `${bar.h}px`, animationDelay: bar.d }"
          ></span>
        </div>
      </div>

      <div class="actions">
        <CopyButton
          primary
          value="7787529955"
          label="Copy recorder number"
          hint="778…"
          @copied="onCopied"
        />
        <CopyButton
          value="jasbangar@muse.ai"
          label="Copy transcript inbox"
          hint="muse.ai"
          @copied="onCopied"
        />
        <CopyButton
          value="sip.telnyx.com"
          label="Copy softphone server"
          hint="sip.telnyx.com"
          @copied="onCopied"
        />
        <div class="copied" role="status" aria-live="polite">{{ copied }}</div>
      </div>
    </div>
  </section>
</template>
