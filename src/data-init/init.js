const UserModel = require('../db/UserModel');
const fs = require('fs');
const path = require('path');
const db = require('../db/mongo');
const mongoose = require('mongoose');
//读取data.json
let jsonData = null;
const filePath = path.join(__dirname, 'data.json');
try {
  jsonData = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  console.error(err);
}
//将数据录入数据库
const { iot_user } = JSON.parse(jsonData);
async function addData() {
  for (let k of iot_user) {
    try {
      if (await UserModel.findOne({ id: k.id })) {
        throw '用户已存在';
      };
      await UserModel.create({
        id: k.id,
        user_name: k.user_name,
        account: k.account,
        password: k.password,
        status: k.status,
        account_type: k.account_type,
        is_del: k.is_del,
        update_time: k.update_time,
        create_time: k.create_time
      });
      console.log('已添加一条用户数据')
    } catch (error) {
      console.log(error)
    }
  };
}
db(async () => {
  console.log('数据库连接成功！');
  await addData();
  mongoose.connection.close();
});
