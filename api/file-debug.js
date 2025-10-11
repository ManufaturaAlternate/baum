import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    // Get current directory
    const cwd = process.cwd()
    console.log('Current working directory:', cwd)
    
    // List all directories and files in the project root
    const rootContents = fs.readdirSync(cwd).map(item => {
      const itemPath = path.join(cwd, item)
      const stats = fs.statSync(itemPath)
      return {
        name: item,
        isDirectory: stats.isDirectory(),
        size: stats.size
      }
    })
    
    // Check protected-assets directory
    const protectedAssetsPath = path.join(cwd, 'protected-assets')
    let protectedAssetsExists = false
    let protectedAssetsContents = []
    
    if (fs.existsSync(protectedAssetsPath)) {
      protectedAssetsExists = true
      protectedAssetsContents = fs.readdirSync(protectedAssetsPath)
    }
    
    // Check images directory
    const imagesPath = path.join(protectedAssetsPath, 'images')
    let imagesExists = false
    let imagesContents = []
    
    if (fs.existsSync(imagesPath)) {
      imagesExists = true
      imagesContents = fs.readdirSync(imagesPath)
    }
    
    // Check specific file
    const targetFilePath = path.join(imagesPath, 'canvas-static.png')
    const fileExists = fs.existsSync(targetFilePath)
    let fileStats = null
    
    if (fileExists) {
      fileStats = fs.statSync(targetFilePath)
    }
    
    // List all API routes
    const apiPath = path.join(cwd, 'api')
    let apiContents = []
    
    if (fs.existsSync(apiPath)) {
      apiContents = fs.readdirSync(apiPath)
    }
    
    // Test file read
    let fileReadTest = null
    if (fileExists) {
      try {
        // Just read a small part to confirm it's readable
        const fd = fs.openSync(targetFilePath, 'r')
        const buffer = Buffer.alloc(10)
        fs.readSync(fd, buffer, 0, 10, 0)
        fs.closeSync(fd)
        fileReadTest = {
          success: true,
          sample: buffer.toString('hex')
        }
      } catch (e) {
        fileReadTest = {
          success: false,
          error: e.message
        }
      }
    }
    
    res.status(200).json({
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: cwd
      },
      rootDirectory: {
        path: cwd,
        contents: rootContents
      },
      protectedAssets: {
        path: protectedAssetsPath,
        exists: protectedAssetsExists,
        contents: protectedAssetsContents
      },
      imagesDirectory: {
        path: imagesPath,
        exists: imagesExists,
        contents: imagesContents
      },
      targetFile: {
        path: targetFilePath,
        exists: fileExists,
        stats: fileStats ? {
          size: fileStats.size,
          isFile: fileStats.isFile(),
          lastModified: fileStats.mtime
        } : null,
        readTest: fileReadTest
      },
      apiRoutes: {
        path: apiPath,
        contents: apiContents
      },
      // Include any relevant env vars (be careful not to expose secrets)
      envVars: {
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('Error in file debug API:', error)
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}