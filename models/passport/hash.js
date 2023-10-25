const crypto = require('crypto');

/**
 * 生成 salt
 * @returns {String}
 */
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * 產生加鹽密碼 
 * @param {String} originalPwd 明文密碼
 * @param {String} salt 鹽(不代入則隨機產生)
 * @returns {String} 加鹽密碼 (format = salt:hashedPwd)
 */
function hashSaltPwd(originalPwd, salt = generateSalt()) {
    const hash = crypto.pbkdf2Sync(originalPwd, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

/**
 * 比對密碼
 * @param {String} enterPwd 輸入密碼
 * @param {String} saltPwd 加鹽密碼 (format = salt:hashedPwd)
 * @returns {Boolean}
 */
function isValidSaltPwd(saltPwd, enterPwd) {
    if (saltPwd && saltPwd.includes(':')) {
        let salt = saltPwd.split(':')[0]
        const enterPwdHash = hashSaltPwd(enterPwd, salt);
        return enterPwdHash === saltPwd;
    }
    return false
}

module.exports = { hashSaltPwd, isValidSaltPwd }