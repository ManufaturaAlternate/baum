import fs from 'node:fs'
import path from 'node:path'

export default function handler(req, res) {
  console.log('Asset request:', req.query)
  
  try {
    // Get file path from query
    const filePath = req.query.file
    
    if (!filePath) {
      return res.status(400).json({ error: 'No file specified' })
    }
    
    // Construct full path
    const fullPath = path.join(process.cwd(), 'protected-assets', filePath)
    
    // Security check
    const normalizedPath = path.normalize(fullPath)
    const protectedDir = path.join(process.cwd(), 'protected-assets')
    
    if (!normalizedPath.startsWith(protectedDir)) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    // Check if file exists
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    // Get file stats
    const stats = fs.statSync(normalizedPath)
    
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Not a file' })
    }
    
    // Get extension and content type
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.json': 'application/json',
      '.js': 'application/javascript'
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'
    
    // Read and serve the file
    const fileBuffer = fs.readFileSync(normalizedPath)
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stats.size)
    return res.status(200).send(fileBuffer)
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}