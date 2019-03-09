const express = require("express");
const Order = require("../models/order");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');
const OrderController = require('../controllers/orderController');

router.get('/', checkAuth, OrderController.order_get_all);

router.get('/:orderId', checkAuth, OrderController.order_get_one);

router.post('/', checkAuth, OrderController.order_create);

router.patch('/:orderId', checkAuth, OrderController.order_patch);

router.delete('/:orderId', checkAuth, OrderController.order_delete);

module.exports = router;
