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
    const { page, name, sort } = req.query;
    //여러 옵션이 늘어날 걸 대비해 분리

    const cond = { isDeleted: false };

    if (name) {
      cond.name = { $regex: name, $options: 'i' };
    }
    //regex -> 문자열 포함도 결과에 나오게 하려고
    let query = Product.find(cond);
    let response = { status: 'success' };

    let sortOption = {};
    if (sort === 'lowPrice') sortOption.price = 1;
    else if (sort === 'highPrice') sortOption.price = -1;
    else if (sort === 'latest') sortOption.createdAt = -1; // 최신순
    else sortOption.createdAt = 1; // 기본: 오래된순/추천순

    query.sort(sortOption);

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

productController.updateProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true }
    );
    if (!product) throw new Error('Item does not exist!');
    res.status(200).json({ status: 'Success', data: product });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

productController.deleteProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true },
      { new: true }
    );
    if (!product) throw new Error('Item does not exist!');
    res.status(200).json({ status: 'Success', data: product });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

productController.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) throw new Error('Not found');
    res.status(200).json({ status: 'Success', data: product });
  } catch (error) {
    res.status(400).json({ status: 'Failed', error: error.message });
  }
};

productController.checkItemStock = async (item) => {
  //사려는아이템의 재고 정보가지고오기
  const product = await Product.findById(item.productId);
  //아이템의qty랑 재고 비교하기
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size} 재고가 부족합니다. `,
    };
  }
  return { isVerify: true, product };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockList = [];
  const stockUpdates = []; // 재고 있고 수량이 재고보다 작거나 같은 것들 저장

  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkItemStock(item);
      if (!stockCheck.isVerify) {
        //재고 없는 것들 저장
        insufficientStockList.push({ item, message: stockCheck.message });
      } else {
        //재고 있는 것들 저장
        stockUpdates.push({ product: stockCheck.product, item });
      }
    })
  );

  //재고 없는 게 하나라도 있으면 어떤 게 없는지 알려주기 위해 없는 것들 배열 보냄
  if (insufficientStockList.length > 0) return insufficientStockList;

  await Promise.all(
    stockUpdates.map(async ({ product, item }) => {
      const newStock = { ...product.stock };
      newStock[item.size] -= item.qty;
      product.stock = newStock;
      await product.save();
    })
  );

  return []; //재고 있으니 빈 배열 보냄
};

module.exports = productController;
