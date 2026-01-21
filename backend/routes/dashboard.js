const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Dashboard/Analytics routes (stub)
router.get('/analytics', authenticate, (req, res) => {
  res.json({ message: 'Analytics module - Coming in Phase 3' });
});

module.exports = router;
