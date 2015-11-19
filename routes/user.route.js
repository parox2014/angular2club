
var express=require('express');
var userRouter=express.Router();
var userCtrl=require('../controllers/controllers').userCtrl;
var auth=require('../middlewares/auth');

//激活帐号
userRouter.get('/:id/active',userCtrl.active);

//验证帐号的唯一性
userRouter.get('/unique',userCtrl.unique);

//更新用户资料
userRouter.put('/',auth.signinRequired,userCtrl.update);

//获取用户资料
userRouter.get('/:id',auth.signinRequired,userCtrl.getUserDetail);


//QQ授权登录
userRouter.get('/auth/qq',userCtrl.authQQ);

//github授权登录
userRouter.get('/auth/github',userCtrl.authGithub);

module.exports=userRouter;