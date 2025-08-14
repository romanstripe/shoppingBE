const Order = require('../models/Order');
const Product = require('../models/Product');
const productController = require('./product.controller');
const randomStringGenerator = require('../utils/randomStringGenerator');
const orderController = {};
const PAGE_SIZE = 3;

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

orderController.getOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const order = await Order.find({ userId: userId })
      .populate({
        path: 'userId',
        select: 'email',
      })
      .populate({
        path: 'items.productId',
        select: 'name price image',
      });
    //userId -> order 내 items 으로 1차 populate
    //items -> productId 로 Product 객체를 2차 populate
    res.status(200).json({ status: 'Success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

orderController.getOrders = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    //여러 옵션이 늘어날 걸 대비해 분리
    const cond = {};
    if (ordernum) {
      cond.orderNum = { $regex: ordernum, $options: 'i' };
    }
    //regex -> 문자열 포함도 결과에 나오게 하려고
    let query = Order.find(cond)
      .populate({ path: 'userId', select: 'email' })
      .populate({ path: 'items.productId', select: 'name price image' });
    let response = { status: 'success' };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE); //skip넘기려는 페이지수 limit 보여주는페이지수
      //total data count / page size
      const totalItemNum = await Order.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const OrderList = await query.exec();
    response.data = OrderList;

    //상황에 따라 동적으로 response 를 보냄
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    if (!order) throw new Error('Order does not exist!');
    res.status(200).json({ status: 'Success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

module.exports = orderController;
