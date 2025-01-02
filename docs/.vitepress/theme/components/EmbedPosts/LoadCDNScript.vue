<template>
  <slot />
</template>


<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  if (!document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')) {
    const script = document.createElement('script');
    script.src = "https://embed.bsky.app/static/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }
})
</script>
