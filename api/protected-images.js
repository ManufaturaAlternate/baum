import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
	const imageName = req.query.image; // Get the image name from the query
	const imagePath = path.join(process.cwd(), 'protected-images', imageName); // Adjust the path as needed

	if (fs.existsSync(imagePath)) {
		res.setHeader('Content-Type', 'image/jpeg'); // Adjust based on your image type
		fs.createReadStream(imagePath).pipe(res); // Stream the image
	} else {
		res.status(404).json({ error: 'Image not found' });
	}
}
