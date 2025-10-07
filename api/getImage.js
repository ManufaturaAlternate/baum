import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
	// Check for the token in the request headers
	const token = req.headers['authorization'];
	if (!token || token !== process.env.SECRET_TOKEN) {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const imageName = req.query.image; // Get the image name from the query
	const imageUrl = fetchImageUrl(imageName); // Get the image URL from the protected directory
	if (!imageUrl) {
		return res.status(404).json({ error: 'Image not found' });
	}
	res.status(200).json({ url: imageUrl });
}


// Function to fetch the image URL from a protected directory
function fetchImageUrl(imageName) {
	const imagePath = path.join(process.cwd(), 'protected-images', imageName); // Adjust the path as needed
	if (fs.existsSync(imagePath)) {
		return `/api/protected-images/${imageName}`; // Serve through an API route
	}
	return null; // Image not found
}