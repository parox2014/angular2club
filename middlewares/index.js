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
    error: err,
  });
};

express.request.__proto__.generateSession = function(user, callback) {
  let req = this;

  callback = callback || noop;

  return new Promise((resolve, reject) => {

    req.session.regenerate(() => {
      req.session.user = user._id;
      req.session.account = user.account;
      req.session.nickName = user.nickName;
      req.session.siteAdmin = user.siteAdmin;
      req.session.msg = 'Authenticated as ' + user.nickName;

      user.set('lastOnline', Date.now());

      user.save(function(err) {
        if (err) {
          reject(err);
          callback(err, undefined);
          return;
        }

        resolve(user);
        callback(undefined, user);
      });

    });
  });
};

exports.signinRequired = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    if (req.xhr) {
      res.set('X-Error', 'signin required');
      res.status(403).send({
        msg: 'signin required',
      });
    } else {
      res.redirect('/signin');
    }
  }
};

exports.adminRequired = function(req, res, next) {
  if (req.session.siteAdmin) {
    next();
  } else {
    logger.warn('需要管理员权限');
    if (req.xhr) {
      res.set('X-Error', 'admin required');
      res.status(403).send({
        msg: 'admin required',
      });
    } else {
      res.redirect('/');
    }
  }
};
