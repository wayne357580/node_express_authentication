const mongoose = require("mongoose");
const fs = require('fs')
const path = require('path')
const { logger } = require('../logger')

const { MONGODB_HOST, MONGODB_PORT, MONGODB_DBNAME, MONGODB_USER, MONGODB_PAWD } = process.env

if (!MONGODB_HOST) {
    logger.error("[MONGODB_HOST] not found in the env parameter")
    process.exit()
} else if (!MONGODB_PORT) {
    logger.error("[MONGODB_PORT] not found in the env parameter")
    process.exit()
} else if (!MONGODB_DBNAME) {
    logger.error("[MONGODB_DBNAME] not found in the env parameter")
    process.exit()
} else {
    let mongoUrl = `mongodb://`
    // Add user
    if (MONGODB_USER && MONGODB_PAWD) {
        mongoUrl += `${MONGODB_USER}:${encodeURIComponent(MONGODB_PAWD)}@`
    }
    // Add server url
    mongoUrl += `${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DBNAME}`
    logger.info(`Connecting to mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DBNAME}`)

    mongoose.connect(mongoUrl);

    // Import models
    const collection = {mongoUrl}
    fs.readdirSync(__dirname + '/model')
        .filter(i => path.extname(i) === '.js')
        .forEach((file) => {
            const modelName = file.split('.')[0];
            logger.info(`MongoDB module [${modelName}] :: ${__dirname}/model/${modelName}`);
            collection[modelName] = require(`${__dirname}/model/${modelName}`)(mongoose, modelName);
        });

    const db = mongoose.connection;
    db.on('open', () => {
        logger.info("Connected to mongodb")
    })
    db.on("error", (e) => {
        logger.error("Connect mongodb faild :", e)
    });
    module.exports = collection
}


