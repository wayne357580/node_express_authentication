const express = require('express');
const router = express.Router();
const { logger } = require('../../../models/logger')

module.exports = (passport) => {
    router.get('/login', passport.authenticate('githubLogin', { scope: ['email', 'profile'] }));

    router.get('/login/callback', (req, res, next) => {
        passport.authenticate('githubLogin', (err, user, info) => {
            if (err) {
                logger.error(new Error(err.stack).stack)
                return res.render('error', { message: 'Login faild or user not yet active', redirect_url: '/' })
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
    })

    return router
}

