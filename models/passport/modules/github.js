const GitHubStrategy = require('passport-github2').Strategy;
const mongodb = require('../../mongodb')
const { logger } = require('../../logger')

module.exports = async (passport) => {
    // Check parameter
    const { SERVER_HOST, SERVER_PORT, GITHUB_OAUTH2_CLIENT_ID, GITHUB_OAUTH2_CLIENT_SECRET } = process.env
    if (!SERVER_HOST) throw new Error('Missing [SERVER_HOST] parameter for env')
    if (!GITHUB_OAUTH2_CLIENT_ID) throw new Error('Missing [GITHUB_OAUTH2_CLIENT_ID] parameter for env')
    if (!GITHUB_OAUTH2_CLIENT_SECRET) throw new Error('Missing [GITHUB_OAUTH2_CLIENT_SECRET] parameter for env')

    let serverHost = SERVER_HOST
    if (SERVER_PORT) serverHost += `:${SERVER_PORT}`

    passport.use('githubLogin', new GitHubStrategy({
        clientID: GITHUB_OAUTH2_CLIENT_ID,
        clientSecret: GITHUB_OAUTH2_CLIENT_SECRET,
        callbackURL: `${serverHost}/user/github/login/callback`,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        let userinfo = profile['_json']
        mongodb['user'].findOne({ account: userinfo['id'], signType: 'github' })
            .then((user) => {
                if (!user) {
                    // Create user data
                    const userData = {}
                    const { id, name, email } = userinfo
                    // user unique id
                    userData['account'] = id
                    userData['signType'] = 'github'
                    if (name) userData['firstName'] = name
                    if (email) userData['email'] = email
                    // Save user
                    mongodb['user'](userData).save()
                        .then(user => {
                            logger.notice(`Created ${user['userType']} ${user['account']}`)
                            return done('User has not yet activated', false)
                        }).catch(e => {
                            logger.error(e)
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
                logger.error(e)
                return done(e)
            })
    }
    ));

    return passport
}