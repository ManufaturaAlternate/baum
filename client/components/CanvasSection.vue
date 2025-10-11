<template>
  <div>
    <!-- ...existing template code... -->
    <img :src="staticImageUrl" @error="handleImageError" alt="Canvas Static Image" />
    <!-- ...existing template code... -->
  </div>
</template>

<script>
import { ref } from 'vue';
import { protectedAssetService } from '@/services/protectedAssetService';

export default {
  setup() {
    const staticImageUrl = ref('/images/canvas-static.png');
    const canvasRef = ref(null);

    const loadProtectedAssets = async () => {
      try {
        const staticImageUrl = await protectedAssetService.fetchProtectedAsset('images/canvas-static.png');
        // Use the Base64 data URL directly
        return staticImageUrl;
      } catch (error) {
        console.error('Failed to load protected static image:', error);
        // Use local fallback
        return '/fallback/canvas-static.png';
      }
    };

    const initializeCanvas = async () => {
      try {
        console.log('CABLES is available, initializing...');
        
        const patchData = await protectedAssetService.fetchProtectedJSON('cables/BaumIntro.json');
        
        // Initialize CABLES with decoded data
        const patch = new CABLES.Patch({
          patch: patchData,
          prefixAssetPath: '/assets/',
          canvas: canvasRef.value,
          glCanvasId: 'glcanvas',
          glCanvasResizeToWindow: true
        });

        return patch;
      } catch (error) {
        console.error('Error loading CABLES assets:', error);
        throw new Error('Failed to initialize canvas with protected assets');
      }
    };

    const handleImageError = () => {
      console.warn('Failed to load protected static image, using fallback');
      // Set fallback image
      staticImageUrl.value = '/fallback/canvas-static.png';
    };

    return {
      staticImageUrl,
      canvasRef,
      loadProtectedAssets,
      initializeCanvas,
      handleImageError
    };
  }
};
</script>

<style scoped>
/* ...existing styles... */
</style>