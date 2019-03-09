const express = require("express");
const Product = require("../models/product");
const mongoose = require("mongoose");
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const ProductController = require('../controllers/productController');
const multer = require('multer');

const myStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/images/uploads/products/"); // must create before use
    },
    filename: function(req, file, cb) {
        var fileExtension = file.originalname.split('.')[1];
        //var exten = path.extname(file.originalname); // another way to get extension of file
        cb(null, new Date().toISOString().replace(/:/g, '-') + "." + fileExtension);
    }
});

const myFileFilter = function(req, file, cb) {
    // warning filter : do not use when it's unnessesary
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const myLimit = {
    fileSize: 1024 * 1024 * 10,
};

const upload = multer({
    storage: myStorage,
    fileFilter: myFileFilter,
    limits: myLimit,
});

router.get('/', checkAuth, ProductController.product_get_all);

router.get('/:productId', checkAuth, ProductController.product_get_one);

router.post('/', checkAuth, upload.single('productImage'), ProductController.product_create);

router.patch('/:productId', checkAuth, ProductController.product_patch);

router.delete('/:productId', checkAuth, ProductController.product_delete);

module.exports = router;
