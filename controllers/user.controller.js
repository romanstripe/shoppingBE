const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, name, password, level } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      throw new Error('Already registed user!');
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password,
      name,
      level: level ? level : 'customer',
    });

    await newUser.save();
    return res.status(200).json({ status: 'Success' });
  } catch (error) {
    res.status(400).json({ status: 'failed', error: error.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user) {
      return res.status(200).json({ status: 'Success', user: user.toJson() });
      //user schema function 에서 비밀번호 등 정보 삭제된 걸로 호출하려 toJson 사용
    }
    throw new Error('Invalid token!');
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

module.exports = userController;
