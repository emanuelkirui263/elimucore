const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Communication routes (stub)
router.get('/notifications', authenticate, (req, res) => {
  res.json({ message: 'Communication module - Coming in Phase 2' });
});

module.exports = router;
