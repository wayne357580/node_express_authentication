const DiscordStrategy = require('passport-discord').Strategy;
const mongodb = require('../../mongodb')
const { logger } = require('../../logger')

module.exports = async (passport) => {
    // Check parameter
    const { SERVER_HOST, SERVER_PORT, DISCORD_OAUTH2_CLIENT_ID, DISCORD_OAUTH2_CLIENT_SECRET } = process.env
    if (!SERVER_HOST) throw new Error('Missing [SERVER_HOST] parameter for env')
    if (!DISCORD_OAUTH2_CLIENT_ID) throw new Error('Missing [DISCORD_OAUTH2_CLIENT_ID] parameter for env')
    if (!DISCORD_OAUTH2_CLIENT_SECRET) throw new Error('Missing [DISCORD_OAUTH2_CLIENT_SECRET] parameter for env')

    let serverHost = SERVER_HOST
    if (SERVER_PORT) serverHost += `:${SERVER_PORT}`

    passport.use('discordLogin', new DiscordStrategy({
        clientID: DISCORD_OAUTH2_CLIENT_ID,
        clientSecret: DISCORD_OAUTH2_CLIENT_SECRET,
        callbackURL: `${serverHost}/user/discord/login/callback`,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        let userinfo = profile
        mongodb['user'].findOne({ account: userinfo['id'], signType: 'discord' })
            .then((user) => {
                if (!user) {
                    // Create user data
                    const userData = {}
                    const { id, username, email } = userinfo
                    // user unique id
                    userData['account'] = id
                    userData['signType'] = 'discord'
                    if (username) userData['firstName'] = username
                    if (email) userData['email'] = email
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