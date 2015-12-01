'use strict';

var express = require('express');
var userRouter = express.Router();
var userCtrl = require('../controllers').userCtrl;
var auth = require('../middlewares');

//激活帐号
//GET /users/:id/active
userRouter.get('/:id/active', userCtrl.active);

//验证帐号的唯一性
//GET /users/unique
userRouter.get('/unique', userCtrl.unique);

//更新用户资料
//PUT /users/:id
userRouter.put('/:id', auth.signinRequired, userCtrl.update);

//获取用户资料
//GET /users/:id
userRouter.get('/:id', auth.signinRequired, userCtrl.getUserProfile);

module.exports = userRouter;
