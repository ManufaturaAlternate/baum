import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    // Log all information for debugging
    console.log('Direct test request:', {
      cwd: process.cwd(),
      env: process.env.NODE_ENV
    })
    
    // Try multiple path options to find the file
    const pathOptions = [
      // Option 1: Direct path from project root
      path.join(process.cwd(), 'protected-assets', 'images', 'canvas-static.png'),
      
      // Option 2: Relative path using ../
      path.resolve('./protected-assets/images/canvas-static.png'),
      
      // Option 3: Absolute path options (for Vercel)
      path.join('/var/task', 'protected-assets', 'images', 'canvas-static.png'),
      
      // Option 4: Check if file exists in the root directory
      path.join(process.cwd(), 'canvas-static.png')
    ]
    
    // Check each path option
    let foundPath = null
    let fileBuffer = null
    
    for (const testPath of pathOptions) {
      console.log(`Testing path: ${testPath}`)
      
      if (fs.existsSync(testPath)) {
        console.log(`✓ File found at: ${testPath}`)
        foundPath = testPath
        fileBuffer = fs.readFileSync(testPath)
        break
      } else {
        console.log(`✗ File not found at: ${testPath}`)
        
        // Log directory contents
        try {
          const dir = path.dirname(testPath)
          if (fs.existsSync(dir)) {
            console.log(`Directory exists: ${dir}`)
            console.log(`Contents: ${fs.readdirSync(dir).join(', ')}`)
          } else {
            console.log(`Directory doesn't exist: ${dir}`)
          }
        } catch (e) {
          console.error(`Error checking directory: ${e.message}`)
        }
      }
    }
    
    if (!foundPath || !fileBuffer) {
      // If file not found in any location, check if directories exist
      const rootDir = process.cwd()
      console.log(`Project root: ${rootDir}`)
      
      if (fs.existsSync(rootDir)) {
        console.log(`Root contents: ${fs.readdirSync(rootDir).join(', ')}`)
        
        const protectedDir = path.join(rootDir, 'protected-assets')
        if (fs.existsSync(protectedDir)) {
          console.log(`Protected assets contents: ${fs.readdirSync(protectedDir).join(', ')}`)
        } else {
          console.log('Protected assets directory does not exist')
        }
      }
      
      return res.status(404).json({ 
        error: 'File not found in any location',
        testedPaths: pathOptions,
        cwd: process.cwd()
      })
    }
    
    // Serve the found file
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Length', fileBuffer.length)
    return res.status(200).send(fileBuffer)
    
  } catch (error) {
    console.error('Error in direct test:', error)
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    })
  }
}