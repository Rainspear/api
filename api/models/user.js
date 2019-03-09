const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    fullname: {
        type: String,
        trim: true,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    userAvatar: {
        type: String,
        required: true,
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        }
    }]
});

userSchema.statics.findByToken = function(token) {
    var user = this;
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_KEY || "secret");
    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject) => {
            reject();
        });
    }
    return user.findOne({
        "_id": decoded._id,
        "tokens.token": token,
        "tokens.access": "auth"
    });
};

userSchema.methods.hashSecretKey = async function() {
    var user = await this;
    return new Promise((resolve, reject) => {

    });
};

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = "auth";
    let token = jwt.sign({
        _id: user._id,
        email: user.email,
        access
    }, process.env.JWT_KEY || 'secret', {
        expiresIn: "20m",
        algorithm: "HS384",
    });
    console.log(token);
    console.log(user.tokens);
    user.tokens = user.tokens.concat([{ access, token }]);
    return user.save().then(() => { return token; });
};

userSchema.methods.removeToken = function(token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

module.exports = mongoose.model('User', userSchema);