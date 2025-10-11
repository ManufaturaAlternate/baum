import fs from 'node:fs'
import path from 'node:path'

export default function handler(req, res) {
  try {
    const imagePath = path.join(process.cwd(), 'protected-assets', 'images', 'canvas-static.png')
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' })
    }
    
    const stats = fs.statSync(imagePath)
    const fileBuffer = fs.readFileSync(imagePath)
    
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Length', stats.size)
    return res.status(200).send(fileBuffer)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}