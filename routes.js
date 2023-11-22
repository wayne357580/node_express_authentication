const { passport, isLogin, isAdminLogin } = require('./models/passport')
const path = require('path')
const { logger } = require(`./models/logger`)

module.exports = (app) => {
    // Init handler
    app.use(passport.initialize())
    app.use(passport.session())
    app.use((req, res, next) => {
        req.requestTime = Date.now();
        next();
    });

    app.get('/', (req, res) => {
        return res.redirect('/login')
    });

    app.get('/fileManager', isLogin, (req, res) => {
        return res.sendFile(path.join(__dirname, "./public/html/fileManager.html"));
    });

    app.get('/login', (req, res) => {
        return res.sendFile(path.join(__dirname, "./public/html/user/login.html"));
    });

    app.get('/signup', (req, res) => {
        return res.sendFile(path.join(__dirname, "./public/html/user/signup.html"));
    });

    app.get('/admin', isAdminLogin, (req, res) => {
        return res.status(200).send('<h1>You are admin</h1>');
    });

    /* Apis */
    app.use('/file', isLogin, require(`${__dirname}/api/file`))
    app.use('/user', require(`${__dirname}/api/user`)(passport))

    app.route('/favicon.ico').get((req, res) => {
        return res.send("")
    });

    // 404 error handler
    app.use((req, res) => {
        return res.status(404).sendFile(path.join(__dirname, "./public/html/404.html"));
    });
    // Error handler
    app.use((e, req, res, next) => {
        logger.error(new Error(e.stack).stack)
        return res.status(500).send('Server error');
    });
}