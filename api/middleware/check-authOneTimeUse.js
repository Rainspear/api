const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    const email = req.params.email;
    const resetToken = req.params.resetToken;
    User.findOne({ email: email }).then((user) => {
        if (!user) {
            return Promise.reject();
        } else {
            let decoded = jwt.verify(resetToken, "secret" || process.env.JWT_KEY);
            req.decoded = decoded;
            req.user = user;
            next();
            //req.token = token;
        }
    }).catch((err) => {
        console.log(err);
        res.status(401).json({
            message: "Auth failed in Check-AuthOneTimeUse : Can not find user",
        });
    });
}