const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

const router = express.Router();

// Admin routes (stub)
router.get('/admin/users', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), (req, res) => {
  res.json({ message: 'Admin panel - Full implementation coming' });
});

module.exports = router;
