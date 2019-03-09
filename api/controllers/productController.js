const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product = require('../models/product');
const mime = require('mime');
const path = require('path');

exports.product_get_all = (req, res) => {
  Product.find().exec()
  .then((docs) => {
    console.log(docs)
    res.status(200).json({
      message : "product retrieved successfully",
      count : docs.length,
      product : docs.map((doc) => {
          return  {
          _id : doc._id,
          name : doc.name,
          price : doc.price,
          kind : doc.kind,
          created : doc.created,
          request : {
            type : "GET",
            url : "http://localhost:9999/product/" + doc._id,
          }
        };
      }),
    });
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({
      error : err
    })
  });
};

exports.product_get_one = (req, res) => {
  const id = req.params.productId;
  Product.findById(id).exec()
  .then((doc) => {
    console.log(doc);
    if(doc) {
      res.status(200).json({
        message : "product retrieved successfully",
        product : {
          _id : doc._id,
          name : doc.name,
          price : doc.price,
          kind : doc.kind,
          created : doc.created,
        },
        request : {
          type : "GET",
          url : "http://localhost:9999/product" + doc._id,
        },
      })
    } else {
      res.status(404).json({
        message : "Not found"
      })
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error : err,
    });
  });
};

exports.product_create = (req, res) => {
  const product = new Product({
    _id : new mongoose.Types.ObjectId(),
    name : req.body.name,
    price : req.body.price,
    kind : req.body.kind,
    productImage : req.file.path,
  });
  product.save()
      .then((doc) => {
      console.log(doc);
      res.status(201).json({
        message : "product saved successfully",
        product : {
          _id : doc._id,
          name : doc.name,
          price : doc.price,
          kind : doc.kind,
          date : doc.created,
          productImage : doc.productImage,
        },
        request : {
          type : "POST",
          url : "http://localhost:9999/product/" + doc._id,
        }
      });
  }).catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.product_patch = (req, res) => {
  const id = req.params.productId;
  const ops = {};
  for (var op of Object.keys(req.body)) {
    ops[op] = req.body[op];
  }
  console.log(op)
  Product.updateOne({_id : id}, { $set : ops}).exec().then((doc) => {
    console.log(doc);
    res.status(200).json({
      message : "product updated",
      product : id,
      update : ops,
      request : {
        type : "PATCH",
        url : "http://localhost:9999/product" + id,
      },
    })
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error : err,
    });
  });
};

exports.product_delete = (req, res) => {
  const id = req.params.productId;
  Product.deleteOne({_id : id}).exec().then((doc) => {
    console.log(doc);
    res.status(200).json({
      message : "product removed",
      request : {
        type : "DELETE",
        url : "http://localhost:9999/product" + id
      }
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error : err,
    });
  });
};
