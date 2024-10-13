const crypto = require('crypto');
const Base64 = require('js-base64');
const key = '12345678901234567890123456789012';
const header = {alg: 'sha256',typ: 'JWT'};
// 加密生成token
const sign = (payload) => {
    const info = Base64.encode(JSON.stringify(header)) + '.' + Base64.encode(JSON.stringify(payload));
    const signature = crypto.createHash('sha256',key).update(info).digest('hex');
    return info + '.' + Base64.encode(signature);
}
// 验证token
const checkToken = (token) => {
    // 错误的token格式
    if(token.split('.').length != 3) {
        return false;
    }
    const [base_header, base_payload, base_signature] = token.split('.');
    const info = base_header + '.' + base_payload;
    const signature = crypto.createHash('sha256',key).update(info).digest('hex');
    // 签名错误
    if(Base64.encode(signature) != base_signature) {
        return false;
    }
    const payload = JSON.parse(Base64.atob(base_payload));
    // token已过期
    if(payload.exp < Date.now()) {
        return false;
    }
    return payload.id;
}
module.exports = { sign, checkToken };