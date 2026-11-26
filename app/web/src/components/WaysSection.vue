<script setup lang="ts">
import { ref } from 'vue';

// The two recording routes. The summary of each route is main content
// and stays on screen; the step-by-step instructions are secondary
// detail, so they live in an expander — tucked away until summoned
// (Jas's pop-in / pop-out design standard).
const openSteps = ref<Record<string, boolean>>({});

function toggle(id: string): void {
  openSteps.value = { ...openSteps.value, [id]: !openSteps.value[id] };
}
</script>

<template>
  <section class="section" aria-labelledby="ways">
    <div class="section-head">
      <h2 id="ways">Two ways to record</h2>
      <p>Use whichever fits the day</p>
    </div>
    <div class="grid2">
      <article class="card">
        <span class="tag soon">Set up — your merge test is still to do</span>
        <h3>1 &nbsp; Three-way merge — on your TELUS phone</h3>
        <p>
          Best for calls <em>you</em> place. The recorder is configured for
          this route, but your own merge test hasn’t been done yet — it’s a
          bonus check, since the system already proved itself without it, so
          there’s no rush on a bad-focus day.
        </p>
        <div class="expander" :class="{ open: openSteps.merge }">
          <button
            type="button"
            class="expander-toggle"
            :aria-expanded="!!openSteps.merge"
            @click="toggle('merge')"
          >
            {{ openSteps.merge ? '▾ Hide the steps' : '▸ Show the steps' }}
          </button>
          <div class="expander-body">
            <div class="panel-body-inner">
              <ol class="steps">
                <li><span><b>Call the person</b> as a normal call and wait for them to answer.</span></li>
                <li><span>Tap <b>Add Call</b>, dial <b>778-752-9955</b>.</span></li>
                <li><span>Tap <b>Merge</b>. The recorder has now joined silently.</span></li>
                <li><span><b>Talk for 30 seconds or more</b> so both voices are captured, then hang up as usual.</span></li>
              </ol>
              <div class="note">
                <strong>Good test partner:</strong> Fo at
                <code>+1 415-312-5395</code> — a real voice on the other end,
                no clinic bothered.
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="card">
        <span class="tag soon">Better shape — one step left</span>
        <h3>2 &nbsp; Softphone — dial straight through Telnyx</h3>
        <p>
          No Add Call, no Merge. The call lives on Telnyx from the first
          second, so recording is simply on. It also sets up the inbound fix
          as a planned phase two: your cell forwards to 778 and Telnyx rings
          the app instead of your cell number — that’s what avoids the loop.
          That inbound bridge isn’t built yet.
        </p>
        <div class="expander" :class="{ open: openSteps.softphone }">
          <button
            type="button"
            class="expander-toggle"
            :aria-expanded="!!openSteps.softphone"
            @click="toggle('softphone')"
          >
            {{ openSteps.softphone ? '▾ Hide the steps' : '▸ Show the steps' }}
          </button>
          <div class="expander-body">
            <div class="panel-body-inner">
              <ol class="steps">
                <li><span>Install the free <b>Linphone</b> app (Zoiper also works).</span></li>
                <li><span>In the Telnyx portal, open <b>SIP Trunking → jas-softphone</b> and set <b>your own password</b>. The temporary one was random on purpose — your real password never passes through anyone else.</span></li>
                <li><span>On that same screen, turn <b>Recording on for all calls</b> if you see the setting.</span></li>
                <li><span>Sign in to Linphone with the details in the card below.</span></li>
              </ol>
              <div class="note">
                <strong>Honest trade-offs:</strong> calls ride your Wi-Fi /
                data, callers see 778-752-9955 instead of your 604 number, and
                the app has to be running to ring. Keep your TELUS line in
                mind for 911 — on a plan-less phone dispatch can’t call you
                back if the call drops.
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
