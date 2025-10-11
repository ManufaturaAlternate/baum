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
    
    // Function to scan directory recursively
    function scanDir(dir, basePath = '') {
      const result = {}
      
      try {
        if (!fs.existsSync(dir)) return { error: 'Directory not found' }
        
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const fullPath = path.join(dir, item)
          const relativePath = basePath ? `${basePath}/${item}` : item
          
          if (fs.statSync(fullPath).isDirectory()) {
            result[item] = scanDir(fullPath, relativePath)
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
      } catch (e) {
        return { error: e.message }
      }
    }
    
    // Scan the assets directory
    let assetTree = {}
    if (dirExists) {
      assetTree = scanDir(protectedDir)
    }
    
    // Test specific files
    const testPaths = [
      'images/canvas-static.png',
      'cables/BaumIntro.json',
      'cables/assets/_DSF2140_Kopie_2.png'
    ]
    
    const fileTests = testPaths.map(testPath => {
      const fullPath = path.join(protectedDir, testPath)
      const exists = fs.existsSync(fullPath)
      const stats = exists ? fs.statSync(fullPath) : null
      
      return {
        path: testPath,
        fullPath,
        exists,
        isFile: exists && stats ? stats.isFile() : false,
        size: exists && stats ? stats.size : 0,
        url: `/api/protected-assets/${testPath}`
      }
    })
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cwd,
      protectedDir,
      protectedDirExists: dirExists,
      topLevelContents: protectedDirContents,
      fileTests,
      assetTree
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}