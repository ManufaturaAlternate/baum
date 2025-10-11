import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const cwd = process.cwd()
    const protectedDir = path.join(cwd, 'protected-assets')
    
    // Check if protected-assets directory exists
    let protectedDirContents = []
    let dirExists = false
    
    try {
      dirExists = fs.existsSync(protectedDir)
      if (dirExists) {
        protectedDirContents = fs.readdirSync(protectedDir)
      }
    } catch (e) {
      console.error('Error checking protected directory:', e)
    }
    
    // Recursively list files in a directory
    function listFiles(dir, basePath = '') {
      const result = {}
      
      if (!fs.existsSync(dir)) {
        return { error: 'Directory not found' }
      }
      
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const relativePath = basePath ? `${basePath}/${item}` : item
        
        if (fs.statSync(fullPath).isDirectory()) {
          result[item] = listFiles(fullPath, relativePath)
        } else {
          const stats = fs.statSync(fullPath)
          result[item] = {
            size: stats.size,
            path: relativePath,
            url: `/api/protected-assets/${relativePath}`
          }
        }
      }
      
      return result
    }
    
    // Get list of all files
    let fileTree = {}
    if (dirExists) {
      try {
        fileTree = listFiles(protectedDir)
      } catch (e) {
        console.error('Error scanning directory:', e)
        fileTree = { error: e.message }
      }
    }
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      cwd,
      protectedDir,
      protectedDirExists: dirExists,
      topLevelContents: protectedDirContents,
      fileTree
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}