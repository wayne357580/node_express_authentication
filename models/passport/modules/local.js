const LocalStrategy = require('passport-local').Strategy
const mongodb = require('../../mongodb')
const { logger } = require('../../logger')
const { hashSaltPwd, isValidSaltPwd } = require('../hash')

module.exports = (passport) => {
    passport.use('localLogin', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'account',
        passwordField: 'password'
    }, (req, account, password, done) => {
        mongodb['user'].findOne({ account, signType: 'local' }).lean()
            .then((user) => {
                if (!user) {
                    return done(null, false)
                } else if (!user.isActivated) {
                    return done('User has not yet activated', false)
                } else if (!isValidSaltPwd(user.password, password)) {
                    logger.notice(`${user.userType} ${user.account} is login faild`)
                    return done('Account or password incorrect', false)
                } else {
                    logger.notice(`${user.userType} ${user.account} is login success`)
                    delete user['password']
                    return done(null, user)
                }
            }).catch(e => {
                logger.error(e)
                return done(e)
            })
    }
    ))

    passport.use('localSignup', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'account',
        passwordField: 'password'
    }, (req, account, password, done) => {
        // 檢查 account 是否存在
        mongodb['user'].findOne({ account, signType: 'local' })
            .then((user) => {
                if (user) {
                    return done('Account already exists', false);
                } else {
                    // Add user
                    const userData = {}
                    const { firstName, lastName, email, birthDate } = req.body
                    userData['account'] = account
                    userData['password'] = hashSaltPwd(password)
                    userData['signType'] = 'local'
                    if (firstName) userData['firstName'] = firstName
                    if (lastName) userData['lastName'] = lastName
                    if (email) userData['email'] = email
                    if (birthDate) userData['birthDate'] = birthDate
                    // Save to DB
                    mongodb['user'](userData).save()
                        .then(user => {
                            logger.notice(`Created ${user['userType']} ${user['account']}`)
                            return done(null, user);
                        }).catch(e => {
                            logger.error(e)
                            return done('A server error occurred while creating the user', false)
                        })
                }
            }).catch(e => {
                logger.error(e)
                return done(e)
            })
    }));

    return passport
}
