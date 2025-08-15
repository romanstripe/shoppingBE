require('dotenv').config();
const authController = {};
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const randomStringGenerator = require('../utils/randomStringGenerator');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json({ status: 'Failed', error: 'User is not registed' });
    } // user 없을때 처리 없으면 응답 느려짐

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = await user.generateToken();
      return res.status(200).json({ status: 'Success', user, token });
    } else {
      throw new Error('Invalid email or password!');
    }
  } catch (error) {
    return res.status(400).json({ status: 'Failed', error: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.payload;
    let user = await User.findOne({ email: email });
    if (!user) {
      const randomPassword = randomStringGenerator();
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({
        name: name,
        email: email,
        password: newPassword,
      });
      await user.save();
    }
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: 'Success', user, token: sessionToken });
  } catch (error) {
    return res.status(400).json({ status: 'Failed', error: error.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error('Token is not found!');
    }

    const token = tokenString.replace('Bearer ', '');

    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) return next(new Error('Expired token!'));
      req.userId = payload._id;
      next();
    });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== 'admin') throw new Error('You do not have permission!');
    next();
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

module.exports = authController;
