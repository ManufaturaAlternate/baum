import fs from 'node:fs'
import path from 'node:path'

export default function handler(req, res) {
  try {
    // Get the specific image
    const imagePath = path.join(process.cwd(), 'protected-assets', 'cables', 'assets', '_DSF2140_Kopie_2.png')
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found', path: imagePath })
    }
    
    // Get file info
    const stats = fs.statSync(imagePath)
    
    // If it exists, serve it directly
    const fileBuffer = fs.readFileSync(imagePath)
    
    // Add debug headers
    res.setHeader('X-File-Size', stats.size)
    res.setHeader('X-File-Path', imagePath)
    
    // Set proper image headers
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-cache')
    
    // Send the image
    return res.status(200).send(fileBuffer)
    
  } catch (error) {
    console.error('Error in test-image:', error)
    return res.status(500).json({ error: error.message })
  }
}