var express=require('express');
var os=require('os');
var auth=require('../middlewares/auth');
var User=require('../models/models').User;
module.exports=function(server){
    var controllers=require('../controllers/controllers');

    server.get('/',function(req,res){
        var systemInfo={
            system:os.type(),
            cpus:os.cpus(),
            totalmem:os.totalmem(),
            freemem:os.freemem(),
            platform:os.platform(),
            hostName:os.hostname()
        };

        if(req.session.user){
            User.findOne({_id:req.session.user},function(err,user){
                res.render('index',Object.assign({
                    title:'angular2 club',
                    data:{
                        user:user
                    }
                },systemInfo))
            })
        }else{
            res.render('index',Object.assign({
                title:'angular2 club',
                data:{}
            },systemInfo))
        }

    });

    server.get('/signout',function(req,res){
        req.session.destroy(function(){
            res.redirect('/signin');
        });
    });



    server.get('/signin',function(req,res){
        if(req.session.user){
            res.redirect('/');
        }else{
            res.render('signin/signin',{title:'登录'});
        }
    });

    server.get('/signup',function(req,res){
        res.render('signup/signup',{title:'注册'});
    });

    server.post('/signup',controllers.userCtrl.signup);

    server.post('/signin',controllers.userCtrl.signin);

    var userRouter=express.Router();

    userRouter.get('/active/:id',controllers.userCtrl.active);
    userRouter.get('/unique',controllers.userCtrl.unique);

    userRouter.get('/auth/qq',controllers.userCtrl.authQQ);

    userRouter.put('/',auth.signinRequired,controllers.userCtrl.update);

    server.use('/user',userRouter);


};