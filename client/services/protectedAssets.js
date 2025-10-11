class ProtectedAssetService {
  // ...existing code...

  async fetchProtectedAsset(assetPath) {
    try {
      const response = await fetch(`/api/protected-assets/${assetPath}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch protected asset: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load asset');
      }

      return this.decodeBase64Asset(result);
    } catch (error) {
      console.error('Error fetching protected asset:', error);
      throw error;
    }
  }

  async fetchProtectedJSON(jsonPath) {
    try {
      const response = await fetch(`/api/protected-assets/${jsonPath}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch protected JSON: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load JSON');
      }

      const decoded = this.decodeBase64Asset(result);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error fetching protected JSON:', error);
      throw error;
    }
  }

  decodeBase64Asset(encodedResult) {
    try {
      const { data, mimeType } = encodedResult;
      
      if (mimeType.startsWith('image/')) {
        return `data:${mimeType};base64,${data}`;
      } else if (mimeType === 'application/json') {
        return atob(data);
      }
      
      return atob(data);
    } catch (error) {
      throw new Error('Failed to decode asset');
    }
  }
}

// ...existing code...