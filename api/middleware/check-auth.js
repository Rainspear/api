const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    const token = req.header('x-auth'); //.split(" ")[1];
    console.log(token);
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        } else {
            req.user = user;
            req.token = token;
            next();
        }
    }).catch((err) => {
        console.log(err);
        return res.status(401).json({
            message: "Auth failed in Check-Auth",
            error: err,
        });
    });
}