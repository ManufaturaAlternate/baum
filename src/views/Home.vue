<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <h1>Home Page</h1>
    <p>This is the home page of your application.</p>
    
    <!-- Link to debug page -->
    <router-link to="/debug">Go to Debug Page</router-link>
  </div>
</template>

<script setup>
// You can add component logic here if needed
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>