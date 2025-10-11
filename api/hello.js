// Simple ES Module style API
export default function handler(req, res) {
  res.status(200).json({ hello: 'world', type: 'esm' });
}