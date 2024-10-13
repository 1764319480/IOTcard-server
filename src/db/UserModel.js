const mongoose = require('mongoose');
// 创建集合中文档的属性
let userSchema = mongoose.Schema({
    id: String,
    user_name: String,
    account: String,
    password: String,
    status: Number,
    account_type: Number,
    is_del: Number,
    update_time: String,
    create_time: String
})
// 创建模型对象，对集合users进行操作
let usersModel = mongoose.model('iot_user', userSchema);
module.exports = usersModel;