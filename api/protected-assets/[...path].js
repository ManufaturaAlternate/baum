import fs from 'node:fs'
import path from 'node:path'

export default async function handler(req, res) {
  console.log('Protected assets request:', {
    url: req.url,
    method: req.method,
    query: req.query
  })

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Extract path from catch-all parameter
  let filePath = ''
  
  if (req.query.path) {
    filePath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path
    console.log('Path from query params:', filePath)
  } else {
    // Fallback: extract path from URL
    const urlPath = req.url.replace(/^\/api\/protected-assets\/?/, '')
    filePath = urlPath.split('?')[0]
    console.log('Path from URL:', filePath)
  }

  if (!filePath) {
    console.log('No file path provided')
    return res.status(400).json({ error: 'No file path provided' })
  }

  try {
    // Normalize the path to remove any ./ or ../
    filePath = filePath.replace(/^\/+/, '')
    console.log('Processing file path:', filePath)
    
    // Get the full path to the file
    const fullPath = path.join(process.cwd(), 'protected-assets', filePath)
    console.log('Full path:', fullPath)
    
    // Security check - ensure path is within protected-assets directory
    const normalizedPath = path.normalize(fullPath)
    const protectedDir = path.join(process.cwd(), 'protected-assets')
    
    if (!normalizedPath.startsWith(protectedDir)) {
      console.log('Security violation - path traversal attempt:', normalizedPath)
      return res.status(403).json({ error: 'Access denied' })
    }
    
    // Check if file exists
    const fileExists = fs.existsSync(normalizedPath)
    console.log('File exists:', fileExists)
    
    if (!fileExists) {
      console.log('File not found:', normalizedPath)
      
      // Log parent directory contents for debugging
      try {
        const dir = path.dirname(normalizedPath)
        if (fs.existsSync(dir)) {
          console.log('Parent directory exists:', dir)
          console.log('Contents:', fs.readdirSync(dir))
        } else {
          console.log('Parent directory does not exist:', dir)
        }
      } catch (e) {
        console.error('Error checking parent directory:', e)
      }
      
      return res.status(404).json({ error: 'File not found' })
    }
    
    // Get file stats
    const stats = fs.statSync(normalizedPath)
    
    if (!stats.isFile()) {
      console.log('Not a file:', normalizedPath)
      return res.status(404).json({ error: 'Not a file' })
    }
    
    // Get extension and content type
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
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
    
    // Special handling for JSON files
    if (ext === '.json') {
      try {
        // Read as text with UTF-8 encoding
        const jsonText = fs.readFileSync(normalizedPath, 'utf8')
        
        // Validate JSON by parsing (optional but helps catch errors)
        JSON.parse(jsonText)
        
        // Set proper headers
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'private, max-age=3600')
        
        // Send as text
        console.log('Serving JSON as text with UTF-8 encoding')
        return res.status(200).send(jsonText)
      } catch (e) {
        console.error('Error with JSON file:', e)
        
        // Try alternate approach if parsing fails
        try {
          // Try reading without BOM if present
          const fileBuffer = fs.readFileSync(normalizedPath)
          let jsonText
          
          // Check for UTF-8 BOM (EF BB BF)
          if (fileBuffer.length >= 3 && 
              fileBuffer[0] === 0xEF && 
              fileBuffer[1] === 0xBB && 
              fileBuffer[2] === 0xBF) {
            jsonText = fileBuffer.toString('utf8', 3)
            console.log('Removed UTF-8 BOM from JSON file')
          } else {
            jsonText = fileBuffer.toString('utf8')
          }
          
          // Validate JSON
          JSON.parse(jsonText)
          
          // Serve the cleaned JSON
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'private, max-age=3600')
          return res.status(200).send(jsonText)
        } catch (bomError) {
          console.error('Failed to handle JSON even after BOM check:', bomError)
          return res.status(500).json({ error: 'Invalid JSON file', details: e.message })
        }
      }
    }
    
    // For non-JSON files, serve as binary
    const fileBuffer = fs.readFileSync(normalizedPath)
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.setHeader('Content-Length', stats.size)
    
    // Send file buffer
    return res.status(200).send(fileBuffer)
    
  } catch (error) {
    console.error('Error serving protected asset:', error)
    return res.status(500).json({ error: error.message })
  }
}