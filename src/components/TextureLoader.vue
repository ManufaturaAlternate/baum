<template>
  <div class="texture-container">
    <div v-if="loading" class="loading">Loading texture...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <slot :texture="texture" :loading="loading"></slot>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as THREE from 'three';
import { cableTextures } from '../api';

export default {
  name: 'TextureLoader',
  props: {
    cableId: {
      type: String,
      required: true
    },
    resolution: {
      type: String,
      default: 'medium'
    }
  },
  
  setup(props, { emit }) {
    const texture = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const textureLoader = new THREE.TextureLoader();
    
    const loadTexture = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await cableTextures.getCableTexture(props.cableId, props.resolution);
        
        // Generate a secure URL with anti-scraping token
        const textureUrl = response.data.url;
        
        // Load the texture using Three.js
        textureLoader.load(
          textureUrl,
          (loadedTexture) => {
            texture.value = loadedTexture;
            loading.value = false;
            emit('loaded', loadedTexture);
          },
          (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            emit('progress', progress);
          },
          (err) => {
            console.error('Error loading texture:', err);
            error.value = 'Failed to load texture';
            loading.value = false;
            emit('error', err);
          }
        );
      } catch (err) {
        console.error('API Error:', err);
        error.value = 'Failed to fetch texture data';
        loading.value = false;
        emit('error', err);
      }
    };
    
    onMounted(() => {
      loadTexture();
    });
    
    watch(() => [props.cableId, props.resolution], loadTexture);
    
    return { texture, loading, error };
  }
}
</script>

<style scoped>
.texture-container {
  position: relative;
}
.loading, .error {
  padding: 10px;
  text-align: center;
}
.error {
  color: #ff4d4f;
}
</style>
