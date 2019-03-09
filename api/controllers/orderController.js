const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product = require('../models/product');
const mime = require('mime');
const path = require('path');

exports.order_get_all = (req, res) => {
  Order.find().select("_id quantity product created").exec().then((docs) => {
    console.log(docs);
    res.status(200).json({
      count : docs.length,
      order : docs.map((doc) => {
        return {
          _id : doc._id,
          product : doc.product,
          quantity : doc.quantity,
          date : doc.created,
          request : "http://localhost:9999/order/" + doc._id,
        };
      }),
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error : err,
    })
  });
};

exports.order_get_one =  (req, res) => {
  const id = req.params.orderId;
  Order.findById(id).exec()
  .then((doc) => {
    console.log(doc);
    if(doc) {
      res.status(200).json({
        message : "order retrieved successfully",
        product : {
          _id : doc._id,
          name : doc.name,
          price : doc.price,
          kind : doc.kind,
          created : doc.created,
        },
        request : {
          type : "GET",
          url : "http://localhost:9999/order" + doc._id,
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

exports.order_create = (req, res) => {
  const id = req.body.productId;
  Product.findById(id).exec().then((product) => {
    if (!product) {
      return res.status(404).json({
        message : "Not found"
      });
    }
    const order = new Order({
      _id : new mongoose.Types.ObjectId(),
      product : req.body.productId,
      quantity : req.body.quantity,
    });
    return order.save()
        .then((doc) => {
        console.log(doc);
        res.status(201).json({
          message : "order saved successfully",
          order : {
            _id : doc._id,
            product : doc.product,
            quantity : doc.quantity,
            date : doc.created,
            request : {
              type : "POST",
              url : "http://localhost:9999/order/" + doc._id,
            }
          }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });
};

exports.order_patch = (req, res) => {
  const id = req.params.orderId;
  const ops = {};
  for (var op of Object.keys(req.body)) {
    ops[op] = req.body[op];
  }
  console.log(op)
  Order.updateOne({_id : id}, { $set : ops}).exec().then((doc) => {
    console.log(doc);
    res.status(200).json({
      message : "order updated",
      order : id,
      update : ops,
      request : {
        type : "PATCH",
        url : "http://localhost:9999/order" + id,
      },
    })
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error : err,
    });
  });
};

exports.order_delete = (req, res) => {
  const id = req.params.orderId;
  Order.deleteOne({_id : id}).exec().then((doc) => {
    console.log(doc);
    res.status(200).json({
      message : "order removed",
      request : {
        type : "DELETE",
        url : "http://localhost:9999/order" + id
      },
      body : {
        productId : "ID",
        quantity : "Number"
      }
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error : err,
    });
  });
};
