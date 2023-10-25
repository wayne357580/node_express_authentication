require('dotenv').config();
const express = require('express')
const helmet = require('helmet');
const session = require('express-session')
const MongoStore = require('connect-mongo')
const compression = require('compression')
const { logger, morganLogger } = require(`${__dirname}/models/logger`)
const mongoDB = require('./models/mongodb')

// Express setting
const app = express();
app.use(helmet());
app.use(compression())
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 10 * 60 * 1000, httpOnly: true },
  store: MongoStore.create({ mongoUrl: mongoDB['mongoUrl'] })
}))
app.set('view engine', 'pug');
app.set('views', './views')

/* CORS setting
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
  });
*/

// Router setting
app.use(morganLogger);
app.use(express.static('public'));
require(`./routes.js`)(app)

// Start http server
const host = process.env.SERVER_HOST || 'http://localhost'
const port = process.env.SERVER_PORT || '80'
/*
app.listen(port, () => {
  logger.info(`Server listening on ${host}:${port}`)
})
*/

// Start https server
const fs = require('fs');
const https = require('https');
let hskey = fs.readFileSync('./localhost+1-key.pem', 'utf8');
let hscert = fs.readFileSync('./localhost+1.pem', 'utf8');
const server = https.createServer({ key: hskey, cert: hscert }, app)
server.listen(port, function () {
  logger.info(`Server runing on ${host}:${port}`)
});
