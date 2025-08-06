const Product = require('../models/Product');

const productController = {};
const PAGE_SIZE = 5;

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    if (!image || image.trim() === '') {
      return res.status(400).json({ message: 'Image is mandatory!' });
    }

    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();

    res.status(200).json({ status: 'Success', product });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    //여러 옵션이 늘어날 걸 대비해 분리
    const cond = name ? { name: { $regex: name, $options: 'i' } } : {};
    //regex -> 문자열 포함도 결과에 나오게 하려고
    let query = Product.find(cond);
    let response = { status: 'success' };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE); //skip넘기려는 페이지수 limit 보여주는페이지수
      //total data count / page size
      const totalItemNum = await Product.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;

    //상황에 따라 동적으로 response 를 보냄
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

module.exports = productController;
