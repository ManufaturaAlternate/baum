const fs = require('fs');
const path = require('path');

module.exports = function (req, res) {
  try {
    const cwd = process.cwd();
    console.log('Current working directory:', cwd);
    
    // Basic filesystem tests
    const rootExists = fs.existsSync(cwd);
    const rootContents = rootExists ? fs.readdirSync(cwd) : [];
    
    const protectedDir = path.join(cwd, 'protected-assets');
    const protectedExists = fs.existsSync(protectedDir);
    const protectedContents = protectedExists ? fs.readdirSync(protectedDir) : [];
    
    // Test a specific file
    const testImagePath = path.join(protectedDir, 'images', 'canvas-static.png');
    const imageExists = fs.existsSync(testImagePath);
    
    res.status(200).json({
      cwd,
      rootExists,
      rootContents,
      protectedDir,
      protectedExists,
      protectedContents,
      testImagePath,
      imageExists
    });
  } catch (error) {
    console.error('Error in CJS test:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};