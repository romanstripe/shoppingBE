const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

//login
router.post('/login', authController.loginWithEmail);

module.exports = router;
