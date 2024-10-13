const mongoose = require('mongoose');
module.exports = function (success) {
    // 连接服务
    mongoose.connect('mongodb://127.0.0.1:27017/iotcard');
    // 成功回调
    mongoose.connection.once('open', async () => {
        // console.log('数据库连接成功！')
        success();
        // console.log('后' + data);
    });
    // 失败回调
    mongoose.connection.once('error', () => {
        console.log('数据库连接失败！')
    });
    // 
    mongoose.connection.once('close', () => {
        console.log('数据库已关闭！')
    });  
}