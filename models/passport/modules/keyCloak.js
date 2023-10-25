const { Issuer, Strategy } = require('openid-client');
const mongodb = require('../../mongodb')
const { logger } = require('../../logger')

module.exports = async (passport) => {
    // Check parameter
    const { SERVER_HOST, SERVER_PORT, KeyCloak_OAUTH2_ISSUER, KeyCloak_OAUTH2_CLIENT_ID, KeyCloak_OAUTH2_CLIENT_SECRET } = process.env
    if (!SERVER_HOST) throw new Error('Missing [SERVER_HOST] parameter for env')
    if (!KeyCloak_OAUTH2_ISSUER) throw new Error('Missing [KeyCloak_OAUTH2_ISSUER] parameter for env')
    if (!KeyCloak_OAUTH2_CLIENT_ID) throw new Error('Missing [KeyCloak_OAUTH2_CLIENT_ID] parameter for env')
    if (!KeyCloak_OAUTH2_CLIENT_SECRET) throw new Error('Missing [KeyCloak_OAUTH2_CLIENT_SECRET] parameter for env')

    // Create OIDC issuer
    const oidcIssuer = await Issuer.discover(KeyCloak_OAUTH2_ISSUER).catch(e => {
        logger.error(`Can't connect KeyCloak oauth server >`, e);
        //throw new Error(e)
    })
    if (!oidcIssuer) return
    logger.info(`Discovered oauth2 issuer ${oidcIssuer.issuer}`)
    // Oauth2 server setting
    let serverHost = SERVER_HOST
    if (SERVER_PORT) serverHost += `:${SERVER_PORT}`
    const client = new oidcIssuer.Client({
        client_id: KeyCloak_OAUTH2_CLIENT_ID,
        client_secret: KeyCloak_OAUTH2_CLIENT_SECRET,
        grant_types: ["authorization_code"],
        redirect_uris: [`${serverHost}/user/keyCloak/login/callback`],
        response_types: ['code'],
    });

    // Create passport module
    passport.use('keyCloakLogin', new Strategy({
        client,
        passReqToCallback: true
    }, (req, tokenSet, userinfo, done) => {
        mongodb['user'].findOne({ account: userinfo['sub'], signType: 'keyCloak' })
            .then((user) => {
                if (!user) {
                    // Create user data
                    const userData = {}
                    const { sub, given_name, family_name, email, birthDate } = userinfo
                    // user unique id
                    userData['account'] = sub
                    userData['signType'] = 'keyCloak'
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
                            logger.error(e)
                            return done('A server error occurred while creating the user', false)
                        })
                } else if (!user.isActivated) {
                    return done('User has not yet activated', false)
                } else {
                    logger.notice(`${user['userType']} ${user['account']} is login success`)
                    req.session.tokenSet = tokenSet;
                    req.session.userinfo = userinfo;
                    return done(null, user)
                }
            }).catch(e => {
                logger.error(e)
                return done(e)
            })
    }))

    return passport
}