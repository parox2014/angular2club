'use strict';
const express = require('express');

express.response.__proto__.responseError = function(err) {
  let code = err.code || 500;

  this.status(code);

  //如果是异步请求，发送错误
  if (this.xhr) {
    return this.send(err);
  }

  //如果不是异步请求，渲染错误页面
  this.render('error', {
    title: err.msg,
    message: err.msg,
    error: err
  });
};

express.request.__proto__.generateSession = function(user, callback) {

  let req = this;

  callback = callback || noop;
  return new Promise((resolve, reject) => {

    req.session.regenerate(function() {
      req.session.user = user._id;
      req.session.account = user.account;
      req.session.nickName = user.profile.nickName;
      req.session.siteAdmin = user.siteAdmin;
      req.session.msg = 'Authenticated as ' + user.profile.nickName;

      user.set('lastOnline', Date.now());
      logger.debug(user);
      user.save(function(err,doc) {
        if (err) {
          reject(err);
          callback(err, undefined);
          return;
        }

        resolve(doc);
        callback(undefined, doc);
      });

    });
  });
};

exports.signinRequired = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    if (req.xhr) {
      res.responseError({
        code:401,
        msg: 'signin required'
      });
    } else {
      res.redirect('/signin');
    }
  }
};

exports.adminRequired = function(req, res, next) {
  logger.debug(req.session);
  if (req.session.siteAdmin) {
    next();
  } else {
    logger.warn('需要管理员权限');
    if (req.xhr) {
      res.responseError({
        code:401,
        msg: 'admin required'
      });
    } else {
      res.redirect('/');
    }
  }
};
