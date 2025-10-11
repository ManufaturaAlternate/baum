import fs from 'node:fs'
import path from 'node:path'

export default function handler(req, res) {
  try {
    // Extract the path from URL parameter
    const url = new URL(req.url, `http://${req.headers.host}`)
    const filePath = url.searchParams.get('path')
    
    if (!filePath) {
      return res.status(400).json({ error: 'No path specified' })
    }
    
    console.log('Requested path:', filePath)
    
    // Normalize file path to prevent path traversal
    const normalizedFilePath = filePath.replace(/^[\/\\]+/, '').replace(/\.\./g, '')
    
    // Construct full path
    const fullPath = path.join(process.cwd(), 'protected-assets', normalizedFilePath)
    
    // Security check
    const normalizedFullPath = path.normalize(fullPath)
    const protectedDir = path.join(process.cwd(), 'protected-assets')
    
    if (!normalizedFullPath.startsWith(protectedDir)) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    // Check if file exists
    if (!fs.existsSync(normalizedFullPath)) {
      return res.status(404).json({ error: 'File not found', path: normalizedFilePath })
    }
    
    // Get file stats
    const stats = fs.statSync(normalizedFullPath)
    
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Not a file' })
    }
    
    // Get extension and content type
    const ext = path.extname(normalizedFilePath).toLowerCase()
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
    
    // For JSON files - specifically handle encoding
    if (ext === '.json') {
      try {
        // Read file with explicit UTF-8 encoding
        const jsonContent = fs.readFileSync(normalizedFullPath, 'utf8');
        
        // Validate the JSON by parsing it
        const jsonData = JSON.parse(jsonContent);
        console.log('JSON validated successfully:', {
          size: jsonContent.length,
          keys: Object.keys(jsonData).length
        });
        
        // Set proper headers for JSON
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).send(jsonContent);
        return;
      } catch (e) {
        console.error('Error with JSON file:', e);
        
        // Try alternate approach - send as raw object
        try {
          const rawData = require(normalizedFullPath);
          console.log('Loaded JSON using require:', typeof rawData);
          
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.status(200).json(rawData);
          return;
        } catch (requireErr) {
          console.error('Also failed with require:', requireErr);
          return res.status(500).json({ error: 'Invalid JSON file', message: e.message });
        }
      }
    }
    
    // For non-JSON files, serve as binary data
    try {
      const fileBuffer = fs.readFileSync(normalizedFullPath);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.setHeader('Content-Length', stats.size);
      res.status(200).send(fileBuffer);
    } catch (e) {
      console.error('Error reading file:', e);
      res.status(500).json({ error: 'Failed to read file', message: e.message });
    }
    
  } catch (error) {
    console.error('Error serving protected asset:', error);
    res.status(500).json({ error: error.message });
  }
}