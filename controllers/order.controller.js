const Order = require('../models/Order');
const productController = require('./product.controller');
const randomStringGenerator = require('../utils/randomStringGenerator');
const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, totalPrice, contact, orderList } = req.body;
    //프론트에서 받음

    const insufficientStockList = await productController.checkItemListStock(
      orderList
    );

    //재고가 충분하지 않은 아이템에 대해 에러를 줌
    if (insufficientStockList.length > 0) {
      const errorMessage = insufficientStockList.reduce(
        (total, item) => (total += item.message),
        ''
      );
      throw new Error(errorMessage);
    }

    //재고가 충분하면 오더를 만듦
    const orderNum = randomStringGenerator();

    const newOrder = new Order({
      userId,
      shipTo,
      totalPrice,
      contact,
      items: orderList,
      orderNum, //서버가 생산해야됨
    });
    await newOrder.save();

    res.status(200).json({ status: 'Success', orderNum: orderNum });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

module.exports = orderController;
