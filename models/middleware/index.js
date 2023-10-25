const fs = require('fs')
const path = require('path');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save path
        let folderPath = path.join(__dirname, '../..', process.env.FILE_FOLDER || 'public/files')
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true })
        cb(null, path.join(__dirname, '../..', process.env.FILE_FOLDER || 'public/files'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

module.exports.uploadForm = multer({
    storage,
    limits: { fileSize: Number(process.env.FILE_SIZE_LIMIT) || Infinity }
})