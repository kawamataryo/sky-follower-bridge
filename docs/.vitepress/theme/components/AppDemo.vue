<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <h2 class="app-demo-title">{{ title }}</h2>
  <div class="app-demo-container">
    <iframe width="100%" height="100%" src="https://www.youtube.com/embed/CnjjfSxm0G0?si=N2OFp15PPiZZezEN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>
</template>

<style scoped>
.app-demo-title {
  margin-top: 5rem;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  border-top: none;
}

.app-demo-container {
  width: 100%;
}

.app-demo-container iframe {
  margin: 0 auto;
  border-radius: 10px;
  width: 80%;
  height: 500px;
}

@media (max-width: 640px) {
  .app-demo-container iframe {
    width: 100%;
    height: 300px;
  }
}
</style>
