import fs from 'node:fs'
import path from 'node:path'

export default function handler(req, res) {
  try {
    const cwd = process.cwd()
    console.log('Current working directory:', cwd)
    
    // Basic filesystem tests
    const info = {
      node: {
        version: process.version,
        platform: process.platform
      },
      directories: {}
    }
    
    // Check if root directory exists and list contents
    info.directories.root = {
      path: cwd,
      exists: fs.existsSync(cwd),
      contents: fs.existsSync(cwd) ? fs.readdirSync(cwd) : []
    }
    
    // Check protected-assets directory
    const protectedDir = path.join(cwd, 'protected-assets')
    info.directories.protected = {
      path: protectedDir,
      exists: fs.existsSync(protectedDir),
      contents: fs.existsSync(protectedDir) ? fs.readdirSync(protectedDir) : []
    }
    
    // Check images directory
    const imagesDir = path.join(protectedDir, 'images')
    info.directories.images = {
      path: imagesDir,
      exists: fs.existsSync(imagesDir),
      contents: fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : []
    }
    
    // Check specific file
    const imagePath = path.join(imagesDir, 'canvas-static.png')
    info.targetFile = {
      path: imagePath,
      exists: fs.existsSync(imagePath),
      size: fs.existsSync(imagePath) ? fs.statSync(imagePath).size : null
    }
    
    // Send the information
    res.status(200).json(info)
    
  } catch (error) {
    console.error('Error in filesystem check:', error)
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}