const express = require('express');
const { register, login, updateAvailability } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/availability', protect, updateAvailability); // Driver status online/offline ke liye

module.exports = router;