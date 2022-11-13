const mongoose = require('mongoose');
const Category = require('../models/Category');
const errorHandler = require('../utils/error-handler');

module.exports.getAll = async function(req, res) {
  try {
    const query = {
      user: req.user.id
    };

    if (req.query.sex) {
      query.sex = req.query.sex;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.product) {
      query.product = req.query.product;
    }
    if (req.query.name) {
      query.name = {"$regex": req.query.name, "$options": "i"}
    }
    if (req.query.code) {
      query.code = {"$regex": "^" + req.query.code}
    }

    const categories = await Category
      .find(query)
      .skip(+req.query.offset * +req.query.limit)
      .limit(+req.query.limit);

    const length = await Category.countDocuments(query)

    const data = {
      categories,
      length,
      offset: +req.query.offset,
      limit: +req.query.limit
    };

    res.status(200).json(data);
  } catch (e) {
    errorHandler(res, e);
  }
}

module.exports.getAllFiltered = async function(req, res) {
  try {
    const query = {};

    if (req.query.code) {
      query.code = {"$regex": "^" + req.query.code}
    }

    const categories = await Category
    .aggregate([
      { $match: { 
        user: req.user.id.toString,
        ...query
       } },
      { $unwind: '$sizes'},
      { $match: {'sizes.amount': {$gt: 0}}},
      { $group: {
          _id: '$_id', 
          sex: {$first: '$sex'},
          category: {$first: '$category'},
          product: {$first: '$product'},
          code: {$first: '$code'},
          name: {$first: '$name'},
          price: {$first: '$price'},
          imageSrc: {$first: '$imageSrc'},
          user: {$first: '$user'},
          sizes: {$push: '$sizes'}
      }},
      { $sort : { _id : 1 } },
      { $facet: {
        paginatedResults: [{ $skip: +req.query.offset * +req.query.limit }, { $limit: +req.query.limit }],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }}
    ]);

    const data = {
      categories: [...categories[0].paginatedResults],
      length: categories[0].totalCount[0].count,
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
    const category = await Category.findById(req.params.id);
    res.status(200).json(category);
  } catch (e) {
    errorHandler(res, e);
  }
}

module.exports.getFilteredById = async function(req, res) {
  try {
    const categories = await Category
    .aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) }},
      { $unwind: '$sizes'},
      { $match: {'sizes.amount': {$gt: 0}}},
      { $group: {
          _id: '$_id', 
          sex: {$first: '$sex'},
          category: {$first: '$category'},
          product: {$first: '$product'},
          code: {$first: '$code'},
          name: {$first: '$name'},
          price: {$first: '$price'},
          imageSrc: {$first: '$imageSrc'},
          user: {$first: '$user'},
          sizes: {$push: '$sizes'}
      }}
    ]);

    res.status(200).json(categories[0]);
  } catch (e) {
    errorHandler(res, e);
  }
}

module.exports.create = async function(req, res) {
  try {
    const category = new Category({
      sex: req.body.sex,
      category: req.body.category,
      product: req.body.product,
      code: req.body.code,
      name: req.body.name,
      price: req.body.price,
      imageSrc: req.file ? req.file.path : '',
      sizes: JSON.parse(req.body.sizes),
      user: req.user.id
    });

    await category.save();
    res.status(201).json(category);

  } catch (e) {
    errorHandler(res, e);
  }
}

module.exports.update = async function(req, res) {
  try {
    const updated = {
      sex: req.body.sex,
      category: req.body.category,
      product: req.body.product,
      code: req.body.code,
      name: req.body.name,
      price: req.body.price,
      sizes: JSON.parse(req.body.sizes)
    };

    if(req.file) {
      updated.imageSrc = req.file.path
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updated },
      { new: true }
    );
    res.status(200).json(category);

  } catch (e) {
    errorHandler(res, e);
  }
}

module.exports.remove = async function(req, res) {
  try {
    await Category.remove({ _id: req.params.id });
    res.status(200).json({
      message: 'Товар видалено'
    });

  } catch (e) {
    errorHandler(res, e);
  }
}