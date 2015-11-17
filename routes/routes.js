'use strict';

var express=require('express');
var os=require('os');
var auth=require('../middlewares/auth');
var User=require('../models/models').User;
var querystring=require('querystring');
var config=require('../config');
var Topic=require('../models/models').Topic;
var EventProxy=require('eventproxy');

module.exports=function(server){
    var controllers=require('../controllers/controllers');

    server.get('/',function(req,res){
        var evtProxy=new EventProxy();
        var systemInfo={
            system:os.type(),
            cpus:os.cpus(),
            totalmem:os.totalmem(),
            freemem:os.freemem(),
            platform:os.platform(),
            hostName:os.hostname()
        };

        var findSessionUser='findSessionUserSuccess';
        var findTopics='findTopicsSuccess';

        evtProxy.all([findSessionUser,findTopics],function(user,topics){
            res.render('index',Object.assign({
                title:'angular2 club',
                user:user,
                topics:topics
            },systemInfo));
        });

        if(req.session.user){
            User.findOne({_id:req.session.user},function(err,user){
                evtProxy.emit(findSessionUser,user);
            });

            Topic.find(function(err,topics){
                evtProxy.emit(findTopics,topics);
            });

        }else{
            res.render('index',Object.assign({
                title:'angular2 club',
                user:null
            },systemInfo));
        }

    });

    server.get('/signout',function(req,res){
        req.session.destroy(function(){
            res.redirect('/signin');
        });
    });



    server.get('/signin',controllers.userCtrl.showSignin);

    server.get('/signup',function(req,res){
        res.render('signup/signup',{title:'注册'});
    });

    server.post('/signup',controllers.userCtrl.signup);

    server.post('/signin',controllers.userCtrl.signin);

    var userRouter=express.Router();

    userRouter.get('/active/:id',controllers.userCtrl.active);
    userRouter.get('/unique',controllers.userCtrl.unique);
    userRouter.put('/',auth.signinRequired,controllers.userCtrl.update);

    userRouter.get('/auth/qq',controllers.userCtrl.authQQ);
    userRouter.get('/auth/github',controllers.userCtrl.authGithub);

    server.use('/user',userRouter);


    var topicRouter=express.Router();

    topicRouter.post('/',controllers.topicCtrl.createTopic);

    server.use('/topic',auth.signinRequired,topicRouter);


};
