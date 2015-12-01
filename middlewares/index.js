'use strict';
const SIGNIN_URL = '/signin';

exports.signinRequired = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    console.log(req.xhr);
    if (req.xhr) {
      res.set('X-Error', 'signin required');
      res.status(403).send({
        msg: 'signin required',
      });
    } else {
      res.redirect(SIGNIN_URL);
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

exports.handleError = function(req, res, next) {
  res.responseError = function(err) {
    let code = err.code || 500;

    this.status(code);

    //如果是异步请求，发送错误
    if (req.xhr) {
      return this.send(err);
    }

    //如果不是异步请求，渲染错误页面
    this.render('error', {
      title: err.msg,
      message: err.msg,
      error: err,
    });
  };

  next();
};

exports.handleSession = function(req, res, next) {

  req.generateSession = function(user, callback) {

    callback = callback || noop;

    let session = this.session;

    return new Promise((resolve, reject) => {
      session.regenerate(() => {
        session.user = user._id;
        session.account = user.account;
        session.nickName = user.nickName;
        session.siteAdmin = user.siteAdmin;
        session.msg = 'Authenticated as ' + user.nickName;

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

  next();
};
