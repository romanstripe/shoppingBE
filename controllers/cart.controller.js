const Cart = require('../models/Cart');

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, size, qty } = req.body;

    //1. 유저 아이디를 통해 카트 찾기
    let cart = await Cart.findOne({ userId: userId });

    //2. 유저가 만든 카트가 없으면 만들어주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }

    //3. 이미 카트에 있는 아이템이면 에러 - 수 높이면 되니까
    const existItem = await cart.items.find(
      ///obj id라서 equals 라는 함수 사용
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      throw new Error('Item is aleady in your cart!');
    }

    //4. 카트에 아이템 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: 'Success', data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

module.exports = cartController;
