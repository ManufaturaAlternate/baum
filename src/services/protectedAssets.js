class ProtectedAssetService {
  constructor() {
    // Base URL for API
    this.baseUrl = '/api/protected-asset';
    
    // Cache for fetched assets
    this.cache = new Map();
    
    // Asset mappings
    this.assetPaths = {
      // Direct paths for JSON and static resources
      staticImage: 'images/canvas-static.png',
      cablesConfig: 'cables/BaumIntro.json',
      
      // Base paths for asset collections
      cablesAssets: 'cables/assets/',
      cablesOps: 'cables/js/'
    };
    
    // Asset mapping from environment variable
    try {
      this.assetMap = import.meta.env.VITE_ASSET_MAP ? 
        JSON.parse(import.meta.env.VITE_ASSET_MAP) : 
        {
          "baum-intro-image": "_DSF2140_Kopie_2.png",
          "cable-detail-1": "cable_001.jpg",
          "cable-detail-2": "cable_002.jpg"
        };
    } catch (e) {
      console.error('Error parsing asset map:', e);
      this.assetMap = {};
    }
  }

  /**
   * Fetch a protected asset and return an object URL
   */
  async fetchProtectedAsset(assetPath) {
    if (this.cache.has(assetPath)) {
      return this.cache.get(assetPath);
    }

    try {
      // Build URL with query parameter
      const url = `${this.baseUrl}?path=${encodeURIComponent(assetPath)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch protected asset: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.cache.set(assetPath, objectUrl);
      return objectUrl;
    } catch (error) {
      console.error('Error fetching protected asset:', error);
      throw error;
    }
  }

  /**
   * Fetch a protected JSON file
   */
  async fetchProtectedJSON(jsonPath) {
    try {
      // Build URL with query parameter
      const url = `${this.baseUrl}?path=${encodeURIComponent(jsonPath)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch protected JSON: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching protected JSON:', error);
      throw error;
    }
  }

  /**
   * Get a mapped asset by its logical name
   */
  async getMappedAsset(logicalName) {
    const filename = this.assetMap[logicalName];
    if (!filename) {
      throw new Error(`No mapping found for asset: ${logicalName}`);
    }
    
    // Determine the path based on file extension
    const ext = filename.split('.').pop().toLowerCase();
    let basePath;
    
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      basePath = this.assetPaths.cablesAssets;
    } else if (['js', 'glsl'].includes(ext)) {
      basePath = this.assetPaths.cablesOps;
    } else {
      basePath = this.assetPaths.cablesAssets; // Default to assets folder
    }
    
    return this.fetchProtectedAsset(`${basePath}${filename}`);
  }

  /**
   * Get the static canvas image
   */
  async getStaticImage() {
    try {
      return await this.fetchProtectedAsset(this.assetPaths.staticImage);
    } catch (error) {
      console.error('Error loading static image:', error);
      throw error;
    }
  }

  /**
   * Get the CABLES configuration file
   */
  async getCablesConfig() {
    try {
      // Direct JSON fetch without mapping
      return await this.fetchProtectedJSON(this.assetPaths.cablesConfig);
    } catch (error) {
      console.error('Error loading CABLES config:', error);
      throw error;
    }
  }

  /**
   * Get the base URL for CABLES assets
   */
  getCablesAssetsPath() {
    // Since we're using query parameters now, we return the full path pattern
    return 'cables/assets/';
}
  /**
   * Get the base URL for CABLES operations
   */
  getCablesOpsPath() {
    return 'cables/js/';
}

  /**
   * Get a mapped CABLES asset by logical name
   */
  async getCablesAsset(assetName) {
    return this.getMappedAsset(assetName);
  }

  /**
   * Helper to generate full URL for any asset
   */
  getAssetUrl(assetPath) {
    return `${this.baseUrl}?path=${encodeURIComponent(assetPath)}`;
  }

  /**
   * Helper to get a mapped asset URL
   */
  getMappedAssetUrl(logicalName) {
    const filename = this.assetMap[logicalName];
    if (!filename) {
      console.warn(`No mapping found for asset: ${logicalName}`);
      return null;
    }
    
    return this.getAssetUrl(`${this.assetPaths.cablesAssets}${filename}`);
  }

  /**
   * Debug logging for paths
   */
  logAssetInfo() {
    console.log('Protected Asset Service Info:', {
      baseUrl: this.baseUrl,
      assetPaths: this.assetPaths,
      assetMap: this.assetMap,
      cacheSize: this.cache.size,
      sampleUrl: this.getAssetUrl(this.assetPaths.staticImage)
    });
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  }
}

export default new ProtectedAssetService();