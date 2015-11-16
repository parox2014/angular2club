var express=require('express');
var os=require('os');
var auth=require('../middlewares/auth');
module.exports=function(server){
    var controllers=require('../controllers/controllers');

    server.get('/',function(req,res){
        res.render('index',{
            title:'angular2 club',
            system:os.type(),
            cpus:os.cpus(),
            totalmem:os.totalmem(),
            freemem:os.freemem(),
            platform:os.platform(),
            hostName:os.hostname()
        });
    });

    server.get('/unique',controllers.userCtrl.unique);

    server.post('/signup',controllers.userCtrl.signup);

    server.post('/signin',controllers.userCtrl.signin);

    var userRouter=express.Router();

    //激活用户帐号
    userRouter.get('/active/:id',controllers.userCtrl.active);

    //用户资料更新
    userRouter.put('/',auth.signinRequired,controllers.userCtrl.update);

    userRouter.get('/auth/qq',controllers.userCtrl.authQQ);

    server.use('/user',userRouter);


};