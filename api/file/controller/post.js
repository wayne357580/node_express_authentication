const { logger } = require('../../../models/logger')

module.exports = (req, res) => {
    try {
        let fileList = req.file || req.files
        return res.status(200).json({
            status: 'OK',
            message: `Success upload ${fileList.length} files`,
            data: fileList.map(i => {
                return {
                    filename: i['filename'],
                    mimetype: i['mimetype'],
                    size: i['size']
                }
            })
        })
    } catch (e) {
        logger.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: `Server error`
        })
    }
}