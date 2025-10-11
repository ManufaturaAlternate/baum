import fs from 'node:fs'
import path from 'node:path'

export default function handler(req, res) {
  try {
    // Hardcoded path to test image
    const imagePath = path.join(process.cwd(), 'protected-assets', 'images', 'canvas-static.png')
    console.log(`Checking for image at: ${imagePath}`)
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.log('File not found')
      
      // Try to list parent directory contents
      const parentDir = path.dirname(imagePath)
      if (fs.existsSync(parentDir)) {
        console.log(`Contents of ${parentDir}:`, fs.readdirSync(parentDir))
      } else {
        console.log(`Parent directory ${parentDir} does not exist`)
      }
      
      return res.status(404).json({ error: 'Image not found', path: imagePath })
    }
    
    // Get file stats
    const stats = fs.statSync(imagePath)
    console.log('File stats:', {
      size: stats.size,
      isFile: stats.isFile()
    })
    
    // Read file buffer
    const fileBuffer = fs.readFileSync(imagePath)
    console.log(`Read ${fileBuffer.length} bytes from file`)
    
    // Send the image with proper headers
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Length', stats.size)
    return res.status(200).send(fileBuffer)
    
  } catch (error) {
    console.error('Error in direct image test:', error)
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}