import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
    const imageName = req.query.image;
    
    // Validate filename
    const validImageName = /^[a-zA-Z0-9_-]{1,50}\.(jpg|jpeg|png|gif|webp)$/i.test(imageName);
    if (!validImageName) {
        return res.status(404).end();
    }

    // Secure path construction
    const protectedDir = path.resolve(process.cwd(), 'protected-images');
    const imagePath = path.resolve(protectedDir, imageName);
    
    // Prevent path traversal
    if (!imagePath.startsWith(protectedDir + path.sep)) {
        return res.status(404).end();
    }

    try {
        const imageBuffer = await fs.readFile(imagePath);
        const ext = path.extname(imageName).toLowerCase();
        
        // Set appropriate content type
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        res.setHeader('Content-Type', contentTypes[ext] || 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache');
        return res.status(200).send(imageBuffer);
    } catch (err) {
        return res.status(404).end();
    }
}