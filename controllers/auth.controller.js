const authController = {};
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

module.exports = authController;
