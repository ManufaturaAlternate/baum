class ProtectedAssetService {
  constructor() {
    this.baseUrl = '/api/protected-assets'
    this.cache = new Map()
    // Asset path mappings
    this.assetPaths = {
      staticImage: '/images/canvas-static.png',
      cablesConfig: '/cables/BaumIntro.json',
      cablesAssets: '/cables/assets/',
      cablesOps: '/cables/ops/'
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
    return this.fetchProtectedAsset(this.assetPaths.staticImage)
  }

  async getCablesConfig() {
    return this.fetchProtectedJSON(this.assetPaths.cablesConfig)
  }

  getCablesAssetsPath() {
    return `${this.baseUrl}${this.assetPaths.cablesAssets}`
  }

  getCablesOpsPath() {
    return `${this.baseUrl}${this.assetPaths.cablesOps}`
  }

  clearCache() {
    this.cache.forEach(url => URL.revokeObjectURL(url))
    this.cache.clear()
  }
}

export default new ProtectedAssetService()
