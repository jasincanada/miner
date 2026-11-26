<script setup lang="ts">
interface Step {
  title: string;
  body: string;
  meta?: string;
}

const steps: Step[] = [
  {
    title: 'You call',
    body: 'Place a call as usual, then bring the recorder in — or dial straight from the softphone so recording is on from the first second.',
  },
  {
    title: 'It records',
    body: 'The 778 number answers silently and captures both voices, clean. Nothing to press once it’s joined.',
    meta: 'Both sides · Silent join',
  },
  {
    title: 'It transcribes',
    body: 'A checker runs every 30 minutes: downloads new recordings, rejects silent files, and transcribes the rest.',
    meta: 'Engine · DeepInfra',
  },
  {
    title: 'You get email',
    body: 'The finished transcript is emailed automatically. You just read it when you’re ready.',
    meta: 'jasbangar@muse.ai',
  },
];
</script>

<template>
  <section class="section" aria-labelledby="how">
    <div class="section-head">
      <h2 id="how">How it works</h2>
      <p>Hands-off, every 30 minutes</p>
    </div>
    <div class="pipeline">
      <div v-for="(step, i) in steps" :key="step.title" class="step">
        <div class="step-num">{{ i + 1 }}</div>
        <h3>{{ step.title }}</h3>
        <p>{{ step.body }}</p>
        <span v-if="step.meta" class="meta">{{ step.meta }}</span>
      </div>
    </div>
  </section>
</template>
