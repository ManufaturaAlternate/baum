class ProtectedAssetService {
  constructor() {
    this.baseUrl = '/api/protected-assets'
    this.cache = new Map()
    // Asset path mappings
    this.assetPaths = {
      staticImage: '/images/canvas-static.png',
      cablesConfig: '/cables/BaumIntro.json',
      cablesAssets: '/cables/assets/',
      cablesOps: '/cables/js/'
    }
  }

  async fetchProtectedAsset(assetPath) {
    if (this.cache.has(assetPath)) {
      return this.cache.get(assetPath)
    }

    try {
      const response = await fetch(`${this.baseUrl}${assetPath}`, {
        method: 'GET',
        signal: AbortSignal.timeout(30000)
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch protected asset: ${response.status}`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      this.cache.set(assetPath, objectUrl)
      return objectUrl
    } catch (error) {
      console.error('Error fetching protected asset:', error)
      throw error
    }
  }

  async fetchProtectedJSON(jsonPath) {
    try {
      const response = await fetch(`${this.baseUrl}${jsonPath}`, {
        method: 'GET',
        signal: AbortSignal.timeout(30000)
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch protected JSON: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching protected JSON:', error)
      throw error
    }
  }

  async getStaticImage() {
    try {
      // Use consistent path reference using the stored mapping
      return this.fetchProtectedAsset(this.assetPaths.staticImage)
    } catch (error) {
      console.error('Error loading static image:', error)
      throw error
    }
  }

  async getCablesConfig() {
    try {
      // Use consistent path reference using the stored mapping
      const response = await fetch(`${this.baseUrl}${this.assetPaths.cablesConfig}`)
      if (!response.ok) {
        throw new Error(`Failed to load CABLES config: ${response.status}`)
      }
      
      let text = await response.text()
      // Clean any potential issues with the JSON
      text = text.trim()
      // Remove BOM if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1)
      }
      // Remove any trailing non-JSON content
      const lastBrace = text.lastIndexOf('}')
      if (lastBrace !== -1 && lastBrace < text.length - 1) {
        text = text.substring(0, lastBrace + 1)
      }
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error loading CABLES config:', error)
      throw error
    }
  }

  getCablesAssetsPath() {
    // Use consistent path reference using the stored mapping
    return `${this.baseUrl}${this.assetPaths.cablesAssets}`
  }

  getCablesOpsPath() {
    // Use consistent path reference using the stored mapping
    return `${this.baseUrl}${this.assetPaths.cablesOps}`
  }

  // Helper method to get full URL for any asset type
  getAssetUrl(assetType, filename = '') {
    if (!this.assetPaths[assetType]) {
      console.warn(`Unknown asset type: ${assetType}`)
      return null
    }
    return `${this.baseUrl}${this.assetPaths[assetType]}${filename}`
  }

  // Helper method to debug path issues
  logPathInfo(filename = '') {
    console.log('Protected Assets Service Path Information:', {
      baseUrl: this.baseUrl,
      staticImagePath: `${this.baseUrl}${this.assetPaths.staticImage}`,
      cablesConfigPath: `${this.baseUrl}${this.assetPaths.cablesConfig}`,
      cablesAssetsPath: `${this.baseUrl}${this.assetPaths.cablesAssets}`,
      cablesOpsPath: `${this.baseUrl}${this.assetPaths.cablesOps}`,
      requestedFile: filename ? `${this.baseUrl}${this.assetPaths.cablesAssets}${filename}` : null
    })
  }

  clearCache() {
    this.cache.forEach(url => URL.revokeObjectURL(url))
    this.cache.clear()
  }
}

export default new ProtectedAssetService()