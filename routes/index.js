'use strict';

var express = require('express');
var os = require('os');
var auth = require('../middlewares/auth');
var User = require('../models').User;
var querystring = require('querystring');
var config = require('../config');
var Topic = require('../models').Topic;
var EventProxy = require('eventproxy');
var signCtrl = require('../controllers/sign');
var userRouter = require('./user.route');
var topicRouter = require('./topic.route');


module.exports = function (server) {
    server.get('/', function (req, res) {
        var evtProxy = new EventProxy();
        var findSessionUser = 'findSessionUserSuccess';
        var findTopics = 'findTopicsSuccess';

        evtProxy.all([findSessionUser, findTopics], function (user, topics) {
            res.render('index', {
                title: config.SITE_NAME,
                user: user,
                topics: topics || []
            });
        });

        if (req.session.user) {
            User.findOne({ _id: req.session.user }, function (err, user) {
                evtProxy.emit(findSessionUser, user);
            });

            Topic.find()
                .where('createdBy').equals(req.session.user)
                .exec(function (err, topics) {
                    evtProxy.emit(findTopics, topics);
                });

        } else {
            res.render('index', {
                title: 'angular2 club',
                user: null,
                topics: []
            });
        }

    });

    server.get('/signin', signCtrl.showSignin);

    server.get('/signup',signCtrl.showSignup);

    server.post('/signup', signCtrl.signup);

    server.post('/signin', signCtrl.signin);

    server.get('/signout', signCtrl.signout);

    //QQ授权登录
    server.get('/oauth/qq',signCtrl.qqOAuth);

    //github授权登录
    server.get('/oauth/github',signCtrl.githubOAuth);

    server.use('/user', userRouter);

    server.use('/topic', topicRouter);
};
