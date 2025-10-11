import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get file path from query parameters
  let filePath = ''
  if (req.query.path) {
    filePath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path
  } else {
    // Fallback: extract from URL
    const urlPath = req.url.replace(/^\/api\/protected-assets\//, '')
    filePath = urlPath.split('?')[0]
  }

  if (!filePath) {
    return res.status(400).json({ error: 'No file path provided' })
  }

  try {
    // Add detailed logging
    console.log('Protected asset request:', {
      url: req.url,
      filePath: filePath,
      query: req.query
    })

    // Construct the full path to the protected asset
    const fullPath = path.join(process.cwd(), 'protected-assets', filePath)
    
    // Security check - ensure path is within protected-assets directory
    const normalizedPath = path.normalize(fullPath)
    const protectedDir = path.join(process.cwd(), 'protected-assets')
    
    if (!normalizedPath.startsWith(protectedDir)) {
      console.log('Security violation - attempted path traversal:', normalizedPath)
      return res.status(403).json({ error: 'Access denied' })
    }

    console.log('Looking for file:', {
      normalizedPath,
      protectedDir,
      exists: fs.existsSync(normalizedPath)
    })

    // Check if file exists
    if (!fs.existsSync(normalizedPath)) {
      console.log('File not found:', normalizedPath)
      
      // Log directory structure to help diagnose
      try {
        // Check if the protected-assets directory exists
        const protectedDirExists = fs.existsSync(protectedDir)
        console.log(`Protected assets directory exists: ${protectedDirExists}`)
        
        if (protectedDirExists) {
          // List contents of protected-assets
          const contents = fs.readdirSync(protectedDir)
          console.log('Protected assets directory contents:', contents)
          
          // Try to navigate to parent directories of the requested file
          const pathParts = filePath.split('/')
          let currentPath = protectedDir
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            currentPath = path.join(currentPath, pathParts[i])
            
            if (fs.existsSync(currentPath)) {
              console.log(`Directory exists: ${currentPath}`)
              console.log('Contents:', fs.readdirSync(currentPath))
            } else {
              console.log(`Directory does not exist: ${currentPath}`)
              break
            }
          }
        }
      } catch (dirError) {
        console.error('Error examining directories:', dirError)
      }
      
      return res.status(404).json({ error: 'Asset not found' })
    }

    // Get file stats
    const stats = fs.statSync(normalizedPath)
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Asset not found' })
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.json': 'application/json',
      '.js': 'application/javascript',
      '.glsl': 'text/plain',
      '.obj': 'application/octet-stream',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav'
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'

    console.log('Serving file:', {
      path: normalizedPath,
      size: stats.size,
      contentType
    })

    // Set appropriate headers
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.setHeader('Content-Length', stats.size)

    // Stream the file
    const fileBuffer = fs.readFileSync(normalizedPath)
    res.status(200).send(fileBuffer)

  } catch (error) {
    console.error('Error serving protected asset:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

export const config = {
  api: {
    responseLimit: '10mb',
  },
}