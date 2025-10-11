export default function handler(req, res) {
  try {
    // Import modules inside the function to avoid top-level errors
    const fs = require('fs');
    const path = require('path');
    
    const cwd = process.cwd();
    
    // Basic information
    const info = {
      cwd,
      nodeVersion: process.version,
      platform: process.platform,
      directories: {},
      errors: []
    };
    
    // Check root directory
    try {
      info.directories.root = fs.readdirSync(cwd);
    } catch (error) {
      info.errors.push({
        location: 'root directory',
        error: error.message
      });
    }
    
    // Try to access the protected-assets directory
    const protectedDir = path.join(cwd, 'protected-assets');
    
    try {
      const exists = fs.existsSync(protectedDir);
      info.protectedAssetsExists = exists;
      
      if (exists) {
        info.directories.protectedAssets = fs.readdirSync(protectedDir);
      }
    } catch (error) {
      info.errors.push({
        location: 'protected-assets directory',
        error: error.message
      });
    }
    
    // Return the information
    res.status(200).json(info);
    
  } catch (error) {
    // Catch any unexpected errors
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}