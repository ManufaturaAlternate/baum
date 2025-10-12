class ProtectedAssetService {
  constructor() {
    // Validate environment variables
    this.validateEnvironmentVariables();
    
    // Base URL for API from environment variable
    this.baseUrl = import.meta.env.VITE_ASSET_BASE_URL;
    
    // Cache for fetched assets
    this.cache = new Map();
    
    // Asset paths from environment variables
    this.assetPaths = this.initAssetPaths();
    
    // Asset mapping from environment variable
    this.assetMap = this.initAssetMap();
  }

  validateEnvironmentVariables() {
    const requiredVars = ['VITE_ASSET_BASE_URL', 'VITE_ASSET_PATHS', 'VITE_ASSET_MAP'];
    const missing = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  initAssetPaths() {
    try {
      return JSON.parse(import.meta.env.VITE_ASSET_PATHS);
    } catch (e) {
      throw new Error(`Error parsing VITE_ASSET_PATHS: ${e.message}`);
    }
  }

  initAssetMap() {
    try {
      return JSON.parse(import.meta.env.VITE_ASSET_MAP);
    } catch (e) {
      throw new Error(`Error parsing VITE_ASSET_MAP: ${e.message}`);
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
    return this.assetPaths.cablesAssets;
  }

  /**
   * Get the base URL for CABLES operations
   */
  getCablesOpsPath() {
    return this.assetPaths.cablesOps;
  }

  /**
   * Helper to generate full URL for any asset
   */
  getAssetUrl(assetPath) {
    return `${this.baseUrl}?path=${encodeURIComponent(assetPath)}`;
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