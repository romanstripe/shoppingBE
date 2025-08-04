const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

//registration
router.post('/', userController.createUser);
//token in header and turn back user info
router.get('/me', authController.authenticate, userController.getUser);

module.exports = router;
