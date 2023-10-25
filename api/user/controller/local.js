const express = require('express');
const router = express.Router();

module.exports = (passport) => {
    router.post('/login', (req, res, next) => {
        passport.authenticate('localLogin', (err, user, info) => {
            if (err) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: err
                })
            } else if (!user) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Login faild'
                })
            } else {
                // 儲存登入狀態
                req.login(user, function (err) {
                    if (err) {
                        return next(err)
                    }
                    let { firstName, lastName } = user
                    res.cookie('userInfo', JSON.stringify({ firstName, lastName }), { maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 10 * 60 * 1000 });
                    return res.status(301).redirect('/fileManager')
                })
            }
        })(req, res, next)
    });

    router.post('/signup', (req, res, next) => {
        passport.authenticate('localSignup', (err, user, info) => {
            if (err) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: err
                })
            } else if(!user){
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Create user fail'
                })
            }else {
                return res.redirect('/login')
            }
        })(req, res, next)
    });
    return router
}