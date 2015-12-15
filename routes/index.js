'use strict';

var ctrls = require('../controllers');
var SignCtrl = ctrls.SignCtrl;
var userRouter = require('./user.route');
var topicRouter = require('./topic.route');
const commentRouter = require('./comment.route');

module.exports = function(server) {
  //渲染主页页
  server.get('/', ctrls.MainCtrl.getSessionUserAndAllTopics);

  //渲染登录页面
  server.get('/signin', SignCtrl.showSignin);

  //渲染注册页面
  server.get('/signup', SignCtrl.showSignup);

  //注册
  server.post('/signup', SignCtrl.signup);

  //登录
  server.post('/signin', SignCtrl.signin);

  server.post('/mail', SignCtrl.sendMail);

  //退出
  server.get('/signout', SignCtrl.signout);

  //QQ授权登录
  server.get('/oauth/qq', SignCtrl.qqOAuth);

  //github授权登录
  server.get('/oauth/github', SignCtrl.githubOAuth);

  server.use('/users', userRouter);

  server.use('/topics', topicRouter);

  server.use('/comments',commentRouter);

};
