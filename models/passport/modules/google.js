const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongodb = require('../../mongodb')
const { logger } = require('../../logger')

module.exports = async (passport) => {
    // Check parameter
    const { SERVER_HOST, SERVER_PORT, GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET } = process.env
    if (!SERVER_HOST) throw new Error('Missing [SERVER_HOST] parameter for env')
    if (!GOOGLE_OAUTH2_CLIENT_ID) throw new Error('Missing [GOOGLE_OAUTH2_CLIENT_ID] parameter for env')
    if (!GOOGLE_OAUTH2_CLIENT_SECRET) throw new Error('Missing [GOOGLE_OAUTH2_CLIENT_SECRET] parameter for env')

    let serverHost = SERVER_HOST
    if (SERVER_PORT) serverHost += `:${SERVER_PORT}`

    passport.use('googleLogin', new GoogleStrategy({
        clientID: GOOGLE_OAUTH2_CLIENT_ID,
        clientSecret: GOOGLE_OAUTH2_CLIENT_SECRET,
        callbackURL: `${serverHost}/user/google/login/callback`,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        let userinfo = profile['_json']
        mongodb['user'].findOne({ account: userinfo['sub'], signType: 'google' })
            .then((user) => {
                if (!user) {
                    // Create user data
                    const userData = {}
                    const { sub, given_name, family_name, email, birthDate } = userinfo
                    // user unique id
                    userData['account'] = sub
                    userData['signType'] = 'google'
                    if (given_name) userData['firstName'] = given_name
                    if (family_name) userData['lastName'] = family_name
                    if (email) userData['email'] = email
                    if (birthDate) userData['birthDate'] = birthDate
                    // Save user
                    mongodb['user'](userData).save()
                        .then(user => {
                            logger.notice(`Created ${user['userType']} ${user['account']}`)
                            return done('User has not yet activated', false)
                        }).catch(e => {
                            logger.error(new Error(e.stack).stack)
                            return done('A server error occurred while creating the user', false)
                        })
                } else if (!user.isActivated) {
                    return done('User has not yet activated', false)
                } else {
                    logger.notice(`${user['userType']} ${user['account']} is login success`)
                    req.session.tokenSet = { accessToken, refreshToken };
                    req.session.userinfo = userinfo;
                    return done(null, user)
                }
            }).catch(e => {
                logger.error(new Error(e.stack).stack)
                return done(e)
            })
    }
    ));

    return passport
}