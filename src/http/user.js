const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const UserModel = require('../db/UserModel');
const {sign} = require('../utils/crypto');
const {nowTime} = require('../utils/createTime');
// 解析json格式数据
const jsonParser = bodyParser.json();
// 登录
router.post('/login', jsonParser, async (req,res) => {
    const body = req.body;
    if (!(body.hasOwnProperty('account') && body.hasOwnProperty('password'))) {
        res.json({
            code: 500,
            success: false,
            message: '缺少信息',
            data: ''
        });
        return;
    };
    const result = await UserModel.findOne({account: body.account, password: body.password});
    if (result == null) {
        res.json({
            code: 500,
            success: false,
            message: '账号或密码不正确',
            data: ''
        });
        return;
    }
    if (result.status == 0) {
        res.json({
            code: 500,
            success: false,
            message: '该账号已被禁用',
            data: ''
        });
        return;
    }
    // 当前时间之后一天的时间戳
    const nextDayTimestamp = Date.now() + 1000 * 60 * 60 * 24;
    // 生成token
    const token = sign({
        id: result.id,
        exp: nextDayTimestamp
    });
    // 将token存入cookie
    res.setHeader('Set-Cookie', `token=${token};HttpOnly; Secure;`);
    res.json({
        code: 200,
        success: true,
        message: '',
        data: {
            user_name: result.user_name,
            account: result.account,
            account_type: result.account_type
        }
    })
})
// 添加用户
router.post('/addUser', jsonParser, async (req,res) => {
    const body = req.body;
    if (!(body.hasOwnProperty('user_name') && body.hasOwnProperty('account') && body.hasOwnProperty('password')
        && body.hasOwnProperty('status') && body.hasOwnProperty('account_type'))) {
        res.json({
            code: 500,
            success: false,
            message: '缺少信息',
            data: ''
        });
        return;
    };
    const current_user = await UserModel.findOne({id: req.id});
    if(current_user.account_type != 1) {
        res.json({
            code: 500,
            success: false,
            message: '权限不足',
            data: ''
        });
        return;
    }
    const time = nowTime();
    const lastUser = await UserModel.findOne().sort({ id: -1 }).limit(1);
    const result = await UserModel.create({
        id: parseInt(lastUser.id) + 1 ,
        user_name: body.user_name,
        account: body.account,
        password: body.password,
        status: body.status,
        account_type: body.account_type,
        is_del: 0,
        update_time: time,
        create_time: time
    });
    if (result == null) {
        res.json({
            code: 500,
            success: false,
            message: '添加失败',
            data: ''
        });
        return;
    }
    res.json({
        code: 200,
        success: true,
        message: '添加成功',
        data: ''
    })
})
// 删除用户
router.post('/deleteUser', jsonParser, async (req,res) => {
    const body = req.body;
    if (!(body.hasOwnProperty('id'))) {
        res.json({
            code: 500,
            success: false,
            message: '缺少信息',
            data: ''
        });
        return;
    };
    const current_user = await UserModel.findOne({id: req.id});
    if(current_user.account_type != 1) {
        res.json({
            code: 500,
            success: false,
            message: '权限不足',
            data: ''
        });
        return;
    }
    const result = await UserModel.deleteOne({ id: body.id });
    if (result.deletedCount == 1) {
        res.json({
            code: 200,
            success: true,
            message: '删除成功',
            data: ''
        })
    } else {
        res.json({
            code: 500,
            success: false,
            message: '删除失败',
            data: ''
        })
    }
})
// 修改用户名
router.post('/modifyName', jsonParser, async (req,res) => {
    const body = req.body;
    if (!(body.hasOwnProperty('user_name'))) {
        res.json({
            code: 500,
            success: false,
            message: '缺少信息',
            data: ''
        });
        return;
    };
    const current_user = await UserModel.findOne({id: req.id});
    if(current_user.user_name === body.user_name) {
        res.json({
            code: 500,
            success: false,
            message: '用户名没有变化',
            data: ''
        });
        return;
    }
    const result = await UserModel.updateOne({ id: req.id }, { user_name: body.user_name });
    if (result.modifiedCount == 1) {
        res.json({
            code: 200,
            success: true,
            message: '修改成功',
            data: ''
        })
    } else {
        res.json({
            code: 500,
            success: false,
            message: '修改失败',
            data: ''
        })
    }
})

module.exports = router;