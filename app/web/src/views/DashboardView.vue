<script setup lang="ts">
import ChristmasScene from '@/components/ChristmasScene.vue';
import HeroSection from '@/components/HeroSection.vue';
import PageFooter from '@/components/PageFooter.vue';
import PipelineSection from '@/components/PipelineSection.vue';
import ProofSection from '@/components/ProofSection.vue';
import SipPanel from '@/components/SipPanel.vue';
import StatusPanel from '@/components/StatusPanel.vue';
import TopBar from '@/components/TopBar.vue';
import WaysSection from '@/components/WaysSection.vue';
</script>

<template>
  <ChristmasScene />
  <div class="wrap">
    <TopBar />
    <HeroSection />
    <PipelineSection />
    <ProofSection />
    <WaysSection />
    <section class="section">
      <div class="grid2">
        <SipPanel />
        <StatusPanel />
      </div>
    </section>
    <PageFooter />
  </div>
</template>
