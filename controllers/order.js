const Order = require('../models/Order');
const Category = require('../models/Category');
const errorHandler = require('../utils/error-handler');

module.exports.getAll = async function(req, res) {
  try {
    const query = {
      user: req.user.id
    };

    if(req.query.start) {
      query.date = { $gte: req.query.start }
    }
  
    if(req.query.end) {
      if (!query.date) {
        query.date = {};
      }
      query.date['$lte'] = req.query.end;
    }

    if (+req.query.order) {
      query.order = +req.query.order;
    }

    const orders = await Order
      .find(query)
      .skip(+req.query.offset * +req.query.limit)
      .limit(+req.query.limit);

    const length = await Order.countDocuments(query)

    const data = {
      orders,
      length,
      offset: +req.query.offset,
      limit: +req.query.limit
    };

    res.status(200).json(data);
  } catch (e) {
    errorHandler(res, e);
  }
}

module.exports.getById = async function(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    res.status(200).json(order);
  } catch (e) {
    errorHandler(res, e);
  }
}

module.exports.create = async function(req, res) {
  try {
    const lastOrder = await Order
      .findOne({ user: req.user.id })
      .sort({ date: -1 });

    const maxOrder = lastOrder ? lastOrder.order : 0;

    const order = await new Order({
      order: maxOrder + 1,
      list: req.body.list,
      user: req.user.id,
      date: new Date()
    }).save();
    
    req.body.list.forEach(async(item) => {
      const category = await Category.findById(item.categoryId);
      const index = category.sizes.findIndex(size => size._id.toString() === item.sizeId);
      category.sizes[index].amount -= item.amount;

      await Category.findOneAndUpdate(
        { _id: item.categoryId },
        { $set: category },
        { new: true }
      );
    });
    
    res.status(201).json(order);
  } catch (e) {
    errorHandler(res, e);
  }
}