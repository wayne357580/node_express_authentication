const express = require('express');
const router = express.Router();
const { logger } = require('../../models/logger')

module.exports = (passport) => {
    router.use('/local', require('./controller/local')(passport))
    router.use('/keyCloak', require('./controller/keyCloak')(passport))    
    router.use('/google', require('./controller/google')(passport))
    router.use('/github', require('./controller/github')(passport))
    router.use('/gitlab', require('./controller/gitlab')(passport))
    router.use('/discord', require('./controller/discord')(passport))
    router.use('/twitch', require('./controller/twitch')(passport))

    router.get('/logout', (req, res, next) => {
        if (user = req.user) {
            req.logout((err) => {
                if (err) {
                    return next(err);
                } else {
                    logger.notice(`${user['userType']} ${user['account']} is logout`)
                    res.clearCookie("userInfo");
                    return res.status(200).send('<h1>You are logout</hi>');
                }
            });
        } else {
            return res.redirect('/')
        }
    });
    return router
}