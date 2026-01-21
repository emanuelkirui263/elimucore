const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

const router = express.Router();

// Payroll routes (stub)
router.get('/payroll', authenticate, authorizeRoles(ROLES.BURSAR, ROLES.SCHOOL_ADMIN), (req, res) => {
  res.json({ message: 'Payroll module - Coming in Phase 2' });
});

module.exports = router;
