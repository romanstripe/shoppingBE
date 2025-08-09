const { populate } = require('dotenv');
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

cartController.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: 'items',
      populate: {
        path: ' productId',
        model: 'Product',
      },
    });
    //userId -> cart 내 items 으로 1차 populate
    //items -> productId 로 Product 객체를 2차 populate
    res.status(200).json({ status: 'Success', data: cart.items });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

cartController.deleteItemFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.id;

    //1. 유저 아이디를 통해 카트 찾기
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    //2. 카트에 아이템 있는지 찾기
    const existItem = await cart.items.find((item) =>
      item._id.equals(productId)
    );
    if (!existItem) {
      throw new Error('Item is not in your cart!');
    }

    //3. 아이템 삭제
    cart.items = cart.items.filter((item) => !item._id.equals(productId));
    await cart.save();
    res.status(200).json({
      status: 'Success',
      data: cart.items,
      cartItemQty: cart.items.length,
    });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

cartController.updateItemQty = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.id;
    const { qty } = req.body;

    //1. 유저 아이디를 통해 카트 찾기
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    //2. 카트에 아이템 있는지 찾기
    const existItem = await cart.items.find((item) =>
      item._id.equals(productId)
    );
    if (!existItem) {
      throw new Error('Item is not in your cart!');
    }

    // 3. 수량 업데이트 후 저장
    existItem.qty = qty;
    await cart.save();

    res.status(200).json({ status: 'Success', data: cart });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

cartController.getItemQty = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.id;

    //1. 유저 아이디를 통해 카트 찾기
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    //2. 카트에 아이템 있는지 찾기
    const allQty = await cart.items.length;

    if (allQty === 0) throw new Error('Not found');
    res.status(200).json({ status: 'Success', data: allQty });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

module.exports = cartController;
