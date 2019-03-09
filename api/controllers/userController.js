const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require("nodemailer");
const fs = require('fs');
//const { google } = require('googleapis');
//const OAuth2 = google.auth.OAuth2;

function getAcesstoken() {
    return new Promise((resolve, reject) => {
        fs.readFile('./src/google-utils/token.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                reject(err);
                throw new Error(err);
            };
            let = content = JSON.parse(data);
            console.log(content);
            resolve(content.access_token);
        });
    })
}

exports.user_get_all = (req, res) => {
    User.find().select('username _id email created userAvatar').exec()
        .then((docs) => {
            console.log(docs);
            const response = {
                count: docs.length,
                user: docs.map((doc) => {
                    return {
                        username: doc.username,
                        email: doc.email,
                        created: doc.created,
                        userAvatar: doc.userAvatar,
                        request: {
                            type: "GET",
                            url: 'http://localhost:9999/user/' + doc._id,
                        }
                    };
                }),
            };
            res.status(200).json(response);
        }).catch((err) => {
            console.log(err)
            res.status(500).json({
                message: err
            });
        });
};

exports.user_get_one = (req, res) => {
    const id = req.params.userId;
    User.findById(id).select("_id username email fullname created userAvatar").exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    user: doc,
                    request: {
                        type: "GET",
                        url: "http://localhost:9999/user/" + doc._id,
                    }
                });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.user_login = (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then((doc) => {
            if (doc.length < 1) { // mean doesn't find any user match that email
                return res.status(401).json({
                    message: "Auth failed - Password or Email is not correct",
                    request: {
                        type: "POST",
                        url: "http://localhost:9999/user/login"
                    }
                });
            }
            bcrypt.compare(req.body.password, doc[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed",
                        request: {
                            type: "POST",
                            url: "http://localhost:9999/user/login"
                        }
                    });
                }
                if (result) {
                    const token = doc[0].generateAuthToken();
                    // const token = jwt.sign({
                    //   email : doc[0].email,
                    //   userId : doc[0]._id,
                    // }, process.env.JWT_KEY || "secret", {
                    //   expiresIn : "20m",
                    //   algorithm : "HS384",
                    // });
                    return res.status(200).json({
                        message: "Auth successfully",
                        user: {
                            username: doc[0].username,
                            email: doc[0].email,
                            tokens: doc[0].tokens,
                        },
                        request: {
                            type: "POST",
                            url: "http://localhost:9999/user/login" + doc[0]._id,
                        }
                    });
                }
                return res.status(401).json({
                    message: "Auth failed",
                    request: {
                        type: "POST",
                        url: "http://localhost:9999/user/login"
                    }
                });
            });
        }).catch((err) => {
            res.status(500).json({
                error: err
            })
        });
};

exports.user_register = (req, res) => {
    //console.log(req.file);
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username: req.body.username,
            password: hash,
            email: req.body.email,
            fullname: req.body.fullname,
            userAvatar: req.file.path
        });
        user.save().then((doc) => {
            return doc.generateAuthToken();
        }).then((token) => {
            console.log(token);
            res.header('x-auth', token);
            res.status(201).json({
                message: "user saved successfully",
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    date: user.created,
                    avatar: user.userAvatar,
                    token: user.tokens,
                    request: {
                        type: "POST",
                        url: "http://localhost:9999/user/" + user._id,
                    }
                }
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: `user_register has ${err}`,
            });
        });
    });
};

exports.user_patch = (req, res) => {
    const id = req.params.userId;
    const ops = {};
    for (var op of Object.keys(req.body)) {
        ops[op] = req.body[op];
    }
    console.log(ops);
    User.updateOne({ _id: id }, { $set: ops })
        .exec()
        .then((doc) => {
            console.log(doc)
            res.status(200).json({
                message: "user updated",
                user: id,
                update: ops,
                request: {
                    type: "PATCH",
                    url: "http://localhost:9999/user/" + id,
                }
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.user_delete = (req, res) => {
    const id = req.params.userId;
    User.deleteOne({ _id: id })
        .exec()
        .then((doc) => {
            console.log(doc);
            res.status(200).json({
                message: "user removed",
                user: doc,
                request: {
                    type: "DELETE",
                    url: "http://localhost:9999/user/" + doc._id
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.user_logout = (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).json({ message: "user_logout remove token successfully" });
    }, () => {
        res.status(400).json({ message: "user_logout remove token failure" });
    });
};

exports.user_forget_password = async(req, res) => {
    const email = await req.params.email;
    User.find({ email: email }).then(async(doc) => {
        console.log(doc);
        if (doc !== null || doc > 0) {
            const resetToken = jwt.sign({
                _id: doc[0]._id,
                email: doc[0].email,
                password: doc[0].password,
                access: "auth"
            }, "secret" || process.env.JWT_KEY, {
                expiresIn: "20m",
                algorithm: "HS384",
            });
            const transporter = await getAcesstoken().then((token) => {
                if (token) {
                    let transporter = nodemailer.createTransport({
                        secure: true,
                        service: 'gmail',
                        auth: {
                            type: "OAuth2",
                            user: "invisibledark3@gmail.com",
                            clientId: "85567315172-s187cqc8kjvhf48e9grjf9vf8a61910j.apps.googleusercontent.com",
                            clientSecret: "6RRVM_OiNVtsDIRV9GzVaPI5",
                            accessToken: token,
                        }
                    });
                    return transporter;
                };
            }).catch(err => console.log(err));
            // send to email a one-time-use link with token here
            const mailOptions = {
                from: 'invisibledark3@mail.com',
                to: `${doc[0].email}`,
                envelope: {
                    from: 'Khang Admin <invisibledark3@gmail.com>', // used as MAIL FROM: address for SMTP
                    to: `invisibledark3@gmail.com, Kai <${doc[0].email}>` // used as RCPT TO: address for SMTP
                },
                date: new Date('2000-01-01 00:00:00'),
                subject: 'Sending Email using Node.js',
                text: `localhost:9999/reset_password/${doc[0].email}/${resetToken}`,
                generateTextFromHTML: true,
                html: `<p>HTML version 5.0</p><br>
                            <a href=\"localhost:9999/reset_password/${doc[0].email}/${resetToken}\">localhost:9999/user/reset_password/${doc[0].email}/${resetToken}</a>`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    transporter.close();
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    console.log(info);
                    return res.status(200).json({
                        message: "a reset token has been send to email",
                        _id: doc[0]._id,
                        email: doc[0].email,
                        request: {
                            type: "POST",
                            url: "http://localhost:9999/user/forget_password/" + doc[0].email,
                        }
                    });
                }
            })
        } else {
            throw new Error(`Not found Email ${email}`);
        }
    }).catch((err) => {
        console.log(err);
        res.status(404).json({
            error: `Email is not exist`
        });
    });

};


exports.user_reset_password = (req, res) => {
    if (req.decoded === null) {
        res.status(401).json({
            message: "User reset password authentication error",
            request: {
                type: "POST",
                url: "http://localhost:9999/user/resetpassword/" + req.user.email,
            }
        });
    }
    if (req.decoded !== null) {
        User.findById({ _id: req.decoded._id }).then((user) => {
            const password = req.body.password;
            bcrypt.compare(password, req.decoded.password, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                    });
                }
                if (result === true) {
                    res.status(500).json({
                        message: "Reset password failed : new password must not be duplicated with old password",
                    });
                } else {
                    console.log(`reset password ${result}`);
                    bcrypt.hash(password, 10, (err, hash) => {
                        user.password = hash;
                        user.save().then(user => {
                            return user.generateAuthToken();
                        }).then(token => {
                            res.header('x-auth', token);
                            res.status(200).json({
                                message: "Reset password succesfully",
                                _id: user._id,
                                user: {
                                    username: user.username,
                                    email: user.email,
                                    date: user.created,
                                    avatar: user.userAvatar,
                                    token: user.tokens,
                                },
                                request: {
                                    type: "POST",
                                    url: "http://localhost:9999/user/resetpassword/" + user.email
                                }
                            });
                        });
                    });
                }
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
    }
}