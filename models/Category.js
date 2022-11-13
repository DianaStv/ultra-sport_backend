const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  sex: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  product: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageSrc: {
    type: String,
    default: ''
  },
  sizes: [
    {
      size: {
        type: String, 
      },
      amount: {
        type: Number,
      }
    }
  ],
  user: {
    ref: 'users',
    type: mongoose.Types.ObjectId
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('categories', categorySchema);