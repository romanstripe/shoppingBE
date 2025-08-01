const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Product = require('./Product');

const orderSchema = Schema({
  shipTo: { type: Object, required: true }, //shipTo에 여러 정보 Object
  contact: { type: Object, required: true }, //contact에 여러 정보 Object
  userId: { type: mongoose.ObjectId, ref: User, required: true },
  totalPrice: { type: Number, default: 0, required: true },
  status: { type: String, default: 'preparing' },
  items: [
    {
      productId: { type: mongoose.ObjectId, ref: Product, required: true },
      size: { type: String, required: true },
      qty: { type: Number, default: 1, required: true },
      price: { type: Number, required: true },
    },
  ],
});

orderSchema.methods.toJson = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
