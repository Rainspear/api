const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const UserController = require('../controllers/userController');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const checkAuthResetPassword = require('../middleware/check-authOneTimeUse');

const myStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/images/uploads/users/"); // must create before use
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

router.get('/', checkAuth, UserController.user_get_all);

router.get('/:userId', checkAuth, UserController.user_get_one);

//router.get('/forget_password/:email', UserController.user_forget_password);

//router.post('/reset_password/:email/:resetToken', checkAuthResetPassword, UserController.user_reset_password);

router.post('/sign_up', upload.single('userAvatar'), UserController.user_register);

router.post('/login', UserController.user_login);

router.patch('/:userId', checkAuth, UserController.user_patch);

router.delete('/logout', checkAuth, UserController.user_logout);

router.delete('/:userId', checkAuth, UserController.user_delete);

module.exports = router;