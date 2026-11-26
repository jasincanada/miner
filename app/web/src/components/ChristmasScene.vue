<script setup lang="ts">
// ============================================================================
// PLACEHOLDER — the living Christmas scene lands in a later slice.
//
// DEPLOY.md (Design requirements + Engineering) specifies the real scene:
// layered room art with the window view clipped to the panes, ONE canvas
// (PixiJS) for snow / tree glow / tobogganing silhouettes, and Rive for
// Cosmo the tabby and his kitten brothers, driven live by Jas's voice via
// an AnalyserNode `energy` input — with the Living / Calm / Still toggle,
// reduced-motion support, and the asset-serving checks already wired into
// nginx.conf (/scene/ MIME types + immutable caching).
//
// THIS slice ships only this tasteful static CSS treatment: a warm room
// glow, a window band with snowy pine silhouettes, and still snow specks.
// No Rive, no canvas engine, no animation loop. It is aria-hidden and
// pointer-events: none; the dashboard is always the main element.
// ============================================================================
</script>

<template>
  <div class="scene" aria-hidden="true">
    <div class="scene-window">
      <span class="pine pine-1"></span>
      <span class="pine pine-2"></span>
      <span class="pine pine-3"></span>
      <span class="pine pine-4"></span>
      <span class="pine pine-5"></span>
    </div>
    <div class="scene-glow"></div>
    <div class="scene-snow"></div>
  </div>
</template>

<style scoped>
.scene {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(240, 178, 107, 0.1), transparent 60%),
    var(--bg);
}

/* Window band across the top: deep winter-evening blue with the
   silhouettes of snow-laden evergreens (pines and firs). */
.scene-window {
  position: absolute;
  inset: 0 0 auto 0;
  height: 34vh;
  min-height: 180px;
  background: linear-gradient(180deg, rgba(24, 42, 67, 0.16), rgba(24, 42, 67, 0.04) 70%, transparent);
}
.pine {
  position: absolute;
  bottom: 12%;
  width: 90px;
  height: 150px;
  background: rgba(23, 48, 38, 0.14);
  clip-path: polygon(
    50% 0%, 68% 22%, 60% 22%, 76% 45%, 66% 45%, 84% 70%, 70% 70%,
    78% 100%, 22% 100%, 30% 70%, 16% 70%, 34% 45%, 24% 45%, 40% 22%, 32% 22%
  );
}
.pine-1 { left: 4%; transform: scale(0.8); }
.pine-2 { left: 16%; transform: scale(1.15); bottom: 6%; }
.pine-3 { right: 18%; transform: scale(0.95); }
.pine-4 { right: 5%; transform: scale(1.3); bottom: 4%; }
.pine-5 { left: 46%; transform: scale(0.6); opacity: 0.7; }

/* Fireplace warmth pooling at the bottom of the room. */
.scene-glow {
  position: absolute;
  inset: auto 0 0 0;
  height: 40vh;
  background: radial-gradient(60% 100% at 50% 110%, rgba(240, 140, 60, 0.13), transparent 70%);
}

/* Still snow specks — static dots, no falling-snow engine in this slice. */
.scene-snow {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(2px 2px at 12% 18%, rgba(255, 255, 255, 0.5) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 32% 8%, rgba(255, 255, 255, 0.4) 50%, transparent 51%),
    radial-gradient(2px 2px at 58% 14%, rgba(255, 255, 255, 0.45) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 76% 22%, rgba(255, 255, 255, 0.4) 50%, transparent 51%),
    radial-gradient(2px 2px at 90% 10%, rgba(255, 255, 255, 0.5) 50%, transparent 51%);
}
@media (prefers-color-scheme: dark) {
  .pine {
    background: rgba(125, 211, 200, 0.1);
  }
  .scene-window {
    background: linear-gradient(180deg, rgba(10, 18, 34, 0.5), rgba(10, 18, 34, 0.12) 70%, transparent);
  }
}
</style>
