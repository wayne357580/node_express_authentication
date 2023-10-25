const passport = require('passport')
const path = require('path')
const fs = require('fs')
const mongodb = require('../mongodb')
const { logger } = require('../logger')

// 序列化：儲存user特徵至 session or cookie
passport.serializeUser((user, done) => {
    let data = JSON.parse(JSON.stringify(user))
    delete data['password']
    Object.keys(data).forEach(key => {
        if (key[0] === '_') delete data[key]
    })
    done(null, data)
})

// 反序列化：根據user特徵取得 user info 並儲存至 req.user
passport.deserializeUser((user, done) => {
    done(null, user)
});

// 讀取驗證模組
let moduleDir = path.join(__dirname, './modules')
fs.readdirSync(moduleDir)
    .filter(file => path.extname(file) === '.js')
    .forEach(file => {
        let modulePath = path.join(moduleDir, file)
        logger.info(`Passport module [${file.split('.')[0]}] :: ${modulePath}`);
        require(modulePath)(passport)
    })

function isLogin(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        return res.sendFile(path.join(__dirname, "/../../public/html/403.html"))
    }
}

function isAdminLogin(req, res, next) {
    if (req.isAuthenticated() && (req.user['userType'] == 'admin')) {
        return next()
    } else {
        return res.sendFile(path.join(__dirname, "/../../public/html/403.html"))
    }
}

module.exports = { passport, isLogin, isAdminLogin }