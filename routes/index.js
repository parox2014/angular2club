'use strict';

var ctrls = require('../controllers');
var SignCtrl = ctrls.SignCtrl;
var userRouter = require('./user.route');
var topicRouter = require('./topic.route');


module.exports = function (server) {
    server.get('/', ctrls.MainCtrl.getSessionUserAndAllTopics);

    server.get('/signin', SignCtrl.showSignin);

    server.get('/signup',SignCtrl.showSignup);

    server.post('/signup', SignCtrl.signup);

    server.post('/signin', SignCtrl.signin);

    server.get('/signout', SignCtrl.signout);

    //QQ授权登录
    server.get('/oauth/qq',SignCtrl.qqOAuth);

    //github授权登录
    server.get('/oauth/github',SignCtrl.githubOAuth);

    server.use('/user', userRouter);

    server.use('/topic', topicRouter);
};
