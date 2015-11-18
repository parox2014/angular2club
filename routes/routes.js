'use strict';

var express=require('express');
var os=require('os');
var auth=require('../middlewares/auth');
var User=require('../models/models').User;
var querystring=require('querystring');
var config=require('../config');
var Topic=require('../models/models').Topic;
var EventProxy=require('eventproxy');
var controllers=require('../controllers/controllers');
var userCtrl=controllers.userCtrl;
var userRouter=require('./user.route');
var topicRouter=require('./topic.route');
module.exports=function(server){


    server.get('/',function(req,res){
        var evtProxy=new EventProxy();
        var findSessionUser='findSessionUserSuccess';
        var findTopics='findTopicsSuccess';

        evtProxy.all([findSessionUser,findTopics],function(user,topics){
            res.render('index',{
                title:'angular2 club',
                user:user,
                topics:topics||[]
            });
        });

        if(req.session.user){
            User.findOne({_id:req.session.user},function(err,user){
                evtProxy.emit(findSessionUser,user);
            });

            Topic.find()
                .where('createdBy').equals(req.session.user)
                .exec(function(err,topics){
                    evtProxy.emit(findTopics,topics);
                });

        }else{
            res.render('index',{
                title:'angular2 club',
                user:null,
                topics:[]
            });
        }

    });

    server.get('/signin',userCtrl.showSignin);

    server.get('/signup',function(req,res){
        res.render('signup/signup',{title:'注册'});
    });

    server.post('/signup',userCtrl.signup);

    server.post('/signin',userCtrl.signin);

    server.get('/signout',function(req,res){
        req.session.destroy(function(){
            res.redirect('/signin');
        });
    });



    server.use('/user',userRouter);

    server.use('/topic',topicRouter);
};
