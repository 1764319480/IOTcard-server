const express = require('express');
const userRouter = require('./user');
const db = require('../db/mongo')
const app = new express();
const path = require('path');
const cors = require('cors');
const {checkToken} = require('../utils/crypto');

db(() => {
  console.log('数据库连接成功！')
  // 检验token
  const noToken = ['/login',]
  function authenticationMiddleware(req, res, next) {
    let skipAuth = false; // 用于跟踪是否需要跳过token验证
    for (let k of noToken) {
      if (req.path.startsWith(k)) {
        skipAuth = true;
        next();
        return;
      }
    }
    const cookie = req.headers.cookie;
    function token() {
      const cookie = req.headers.cookie.replace(/\s+/g, '').split(';');
      for (let k of cookie) {
        if (k.startsWith('token=')) {
          if(checkToken(k.slice(6))) {
            req.id = checkToken(k.slice(6));
            return true;
          }
          return false;
        }
      }
      return false;
    }
    // 如果没有找到匹配路径且没有token，则返回错误
    if (!skipAuth && !cookie || !token()) {
      return res.json({
          code: 500,
          success: false,
          message: '请先登录',
          data: ''
      });
    }
    next();
  }
  // 使用中间件
  app.use(authenticationMiddleware);
  // 静态资源目录
  // app.use(express.static(path.join(__dirname, '../../public')));
  app.use(userRouter);
  app.use(cors())
  app.listen(3000, () => {
    console.log('服务已启动...');
  })
})
