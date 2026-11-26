<script setup lang="ts">
const stats = [
  { value: '49 sec', label: 'Test call duration' },
  { value: '2 voices', label: 'Both sides heard clearly' },
  { value: 'Delivered', label: 'Transcript landed in Muse inbox' },
];

const checks = [
  'Call placed from 778',
  'Recording saved',
  'Sound check passed',
  'Transcribed',
  'Emailed automatically',
];
</script>

<template>
  <section class="section">
    <div class="proof">
      <p class="eyebrow">Proven live — not just built</p>
      <h2>The Fo test call</h2>
      <div class="proof-grid">
        <div>
          <div v-for="stat in stats" :key="stat.label" class="stat">
            <b>{{ stat.value }}</b>
            <span>{{ stat.label }}</span>
          </div>
        </div>
        <div>
          <blockquote>
            “Okay, I hear you. This is Fo speaking clearly for your test. Your
            voice is coming through just fine, and I’m glad to help with the
            recording. I hope this gives you what you need to confirm
            everything’s working.”
            <footer>— Fo, on the recorded test call · +1 415-312-5395</footer>
          </blockquote>
          <div class="checkline">
            <span v-for="check in checks" :key="check">✓ {{ check }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
