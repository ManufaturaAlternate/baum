// Simple CommonJS style API
module.exports = function(req, res) {
  res.status(200).json({ hello: 'world', type: 'commonjs' });
};