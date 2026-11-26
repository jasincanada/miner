<script setup lang="ts">
import CollapsiblePanel from './CollapsiblePanel.vue';
import CopyButton from './CopyButton.vue';

interface Row {
  term: string;
  value: string;
  copy?: string;
  plain?: boolean;
}

const rows: Row[] = [
  { term: 'Username', value: 'jassoftphone', copy: 'jassoftphone' },
  { term: 'Server', value: 'sip.telnyx.com', copy: 'sip.telnyx.com' },
  { term: 'Connection name', value: 'jas-softphone' },
  { term: 'Caller ID shown', value: '778-752-9955' },
  { term: 'Password', value: 'You set it in the portal', plain: true },
  { term: 'App', value: 'Linphone (free)', plain: true },
];
</script>

<template>
  <CollapsiblePanel
    title="Softphone sign-in"
    hint="Everything Linphone asks for, in one place. Tap to open."
    labelled-by="sip"
  >
    <p>Everything Linphone asks for, in one place. Tap copy on any line.</p>
    <dl class="kv">
      <div v-for="row in rows" :key="row.term" class="kv-row">
        <dt>{{ row.term }}</dt>
        <dd :class="{ plain: row.plain }">
          {{ row.value }}
          <CopyButton
            v-if="row.copy"
            mini
            :value="row.copy"
            :label="row.term"
          />
        </dd>
      </div>
    </dl>
  </CollapsiblePanel>
</template>
