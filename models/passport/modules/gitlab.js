const GitLabStrategy = require('passport-gitlab2').Strategy;
const mongodb = require('../../mongodb')
const { logger } = require('../../logger')

module.exports = async (passport) => {
    // Check parameter
    const { SERVER_HOST, SERVER_PORT, GITLAB_OAUTH2_CLIENT_ID, GITLAB_OAUTH2_CLIENT_SECRET, GITLAB_OAUTH2_ISSUER } = process.env
    if (!SERVER_HOST) throw new Error('Missing [SERVER_HOST] parameter for env')
    if (!GITLAB_OAUTH2_CLIENT_ID) throw new Error('Missing [GITLAB_OAUTH2_CLIENT_ID] parameter for env')
    if (!GITLAB_OAUTH2_CLIENT_SECRET) throw new Error('Missing [GITLAB_OAUTH2_CLIENT_SECRET] parameter for env')
    if (!GITLAB_OAUTH2_ISSUER) throw new Error('Missing [GITLAB_OAUTH2_ISSUER] parameter for env')

    let serverHost = SERVER_HOST
    if (SERVER_PORT) serverHost += `:${SERVER_PORT}`

    passport.use('gitlabLogin', new GitLabStrategy({
        clientID: GITLAB_OAUTH2_CLIENT_ID,
        clientSecret: GITLAB_OAUTH2_CLIENT_SECRET,
        callbackURL: `${serverHost}/user/gitlab/login/callback`,
        baseURL: GITLAB_OAUTH2_ISSUER,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        let userinfo = profile['_json']
        mongodb['user'].findOne({ account: userinfo['id'], signType: 'gitlab' })
            .then((user) => {
                if (!user) {
                    // Create user data
                    const userData = {}
                    const { id, username, email } = userinfo
                    // user unique id
                    userData['account'] = id
                    userData['signType'] = 'gitlab'
                    if (username) userData['firstName'] = username
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