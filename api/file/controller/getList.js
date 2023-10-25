const { logger } = require('../../../models/logger')
const fs = require('fs')
const path = require('path')

const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

function formatBytes(x) {
    let l = 0, n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
        n = n / 1024;
    }
    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

module.exports = (req, res) => {
    try {
        let folderPath = path.join(__dirname, '../../..', process.env.FILE_FOLDER || 'public/files')
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true })
        let fileList = []

        fs.readdirSync(folderPath).forEach((fileName) => {
            fileList.push({
                fileName,
                fileSize: formatBytes(fs.statSync(path.join(folderPath, fileName)).size)
            })
        })

        return res.status(200).json({
            status: 'OK',
            message: `Total ${fileList.length} files`,
            data: fileList
        })
    } catch (e) {
        logger.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: `Server errors`
        })
    }
}