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
      const response = await fetch('/api/protected-assets/images/canvas-static.png')
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`)
      }
      
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error loading static image:', error)
      throw error
    }
  }

  async getCablesConfig() {
    try {
      const response = await fetch('/api/protected-assets/cables/BaumIntro.json')
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
    return '/api/protected-assets/cables/assets/'
  }

  getCablesOpsPath() {
    return '/api/protected-assets/cables/js/'
  }

  clearCache() {
    this.cache.forEach(url => URL.revokeObjectURL(url))
    this.cache.clear()
  }
}

export default new ProtectedAssetService()
