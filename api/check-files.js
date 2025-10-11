import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const cwd = process.cwd()
    console.log(`Current working directory: ${cwd}`)
    
    // Check root directory
    const rootContents = fs.readdirSync(cwd)
    
    // Check if protected-assets exists
    const protectedPath = path.join(cwd, 'protected-assets')
    let protectedContents = []
    let imagesContents = []
    
    if (fs.existsSync(protectedPath)) {
      protectedContents = fs.readdirSync(protectedPath)
      
      // Check images directory
      const imagesPath = path.join(protectedPath, 'images')
      if (fs.existsSync(imagesPath)) {
        imagesContents = fs.readdirSync(imagesPath)
      }
    }
    
    // Check for specific file
    const testFile = path.join(protectedPath, 'images', 'canvas-static.png')
    const testFileExists = fs.existsSync(testFile)
    let fileStats = null
    
    if (testFileExists) {
      fileStats = fs.statSync(testFile)
    }
    
    // Create a sample file to verify write permissions
    let canWrite = false
    try {
      const testWritePath = path.join(cwd, 'test-write.txt')
      fs.writeFileSync(testWritePath, 'test')
      fs.unlinkSync(testWritePath)
      canWrite = true
    } catch (e) {
      console.error('Write test failed:', e)
    }
    
    res.status(200).json({
      cwd,
      rootDirectoryContents: rootContents,
      protectedAssetsExists: fs.existsSync(protectedPath),
      protectedAssetsContents: protectedContents,
      imagesDirectoryExists: fs.existsSync(path.join(protectedPath, 'images')),
      imagesContents,
      testFileExists,
      testFileStats: fileStats ? {
        size: fileStats.size,
        isFile: fileStats.isFile(),
        modified: fileStats.mtime
      } : null,
      canWriteToFilesystem: canWrite,
      nodeVersion: process.version,
      platform: process.platform
    })
  } catch (error) {
    console.error('Error checking files:', error)
    res.status(500).json({ error: error.message, stack: error.stack })
  }
}