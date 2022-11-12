const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  date: {
    type: Date,
    default: Date.now()
  },
  order: {
    type: Number,
    required: true
  },
  list: [
    {
      categoryId: {
        ref: 'categories',
        type: mongoose.Types.ObjectId
      },
      sizeId: {
        ref: 'categories',
        type: mongoose.Types.ObjectId
      },
      amount: {
        type: Number
      },
      cost: {
        type: Number
      }
    }
  ],
  user: {
    ref: 'users',
    type: mongoose.Types.ObjectId
  }
});

module.exports = mongoose.model('orders', orderSchema);