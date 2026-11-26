<script setup lang="ts">
import CollapsiblePanel from './CollapsiblePanel.vue';

interface Item {
  done: boolean;
  title: string;
  body: string;
}

const items: Item[] = [
  {
    done: true,
    title: 'Recorder live on one number',
    body: '778-752-9955 only. The 236 number is released and its monthly charge stops.',
  },
  {
    done: true,
    title: 'Automatic transcription proven end-to-end',
    body: 'Recording → sound check → DeepInfra transcript → email delivered to jasbangar@muse.ai.',
  },
  {
    done: true,
    title: 'First outbound call placed & recorded',
    body: 'Prepared message spoken, Fo’s reply captured and transcribed.',
  },
  {
    done: false,
    title: 'Your three-way test — when you’re ready',
    body: 'Call Fo, Add Call 778-752-9955, Merge, talk 30 seconds. Optional bonus check.',
  },
  {
    done: false,
    title: 'Softphone password — your hands only',
    body: 'Set it in the Telnyx portal, then sign in to Linphone. That’s the last setup step.',
  },
];
</script>

<template>
  <CollapsiblePanel
    title="Where things stand"
    hint="What is done, and the two steps left. Tap to open."
    labelled-by="left"
  >
    <ul class="todo">
      <li v-for="item in items" :key="item.title">
        <span class="box" :class="{ done: item.done }"></span>
        <div>
          <strong>{{ item.title }}</strong>
          <p>{{ item.body }}</p>
        </div>
      </li>
    </ul>
    <div class="note">
      <strong>Account snapshot (Nov 25):</strong> 1 number held · balance $2.41
      at last report · checks run every 30 min. A live back-and-forth
      conversation — listening and responding in the moment — is a future
      project; what you have today is prepared-message calls with recorded,
      transcribed replies.
    </div>
  </CollapsiblePanel>
</template>
