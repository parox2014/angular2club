'use strict';

const config = require('../config');
const Util = require('../util');
const qqAuthConfig = config.oAuth.qq;
const githubAuthConfig = config.oAuth.github;
const services = require('../services');

const User = services.User;

const QQOAuth2 = services.QQOAuth2;
const qqAuthClient = new QQOAuth2(
  qqAuthConfig.APP_ID,
  qqAuthConfig.APP_KEY,
  qqAuthConfig.CALLBACK_URI
);

const GitHubOAuth2 = services.GithubOAuth2;
const githubAuthClient = new GitHubOAuth2(
  githubAuthConfig.APP_ID,
  githubAuthConfig.APP_KEY,
  githubAuthConfig.CALLBACK_URI
);

class SignController {

  /**
   * 渲染注册页
   * @param req
   * @param res
   */
  static showSignup(req, res) {
    res.render('signup/signup', {
      title: '注册',
      github: githubAuthClient.generateOAuthUri(githubAuthConfig.SCOPE),
      qq: qqAuthClient.generateOAuthUri()
    });
  }

  /**
   * 渲染登录页
   * @param req
   * @param res
   */
  static showSignin(req, res) {

    if (req.session.user) {
      res.redirect('/');
    } else {
      res.render('signin/signin', {
        title: '登录',
        github: githubAuthClient.generateOAuthUri(githubAuthConfig.SCOPE),
        qq: qqAuthClient.generateOAuthUri()
      });
    }
  }

  /**
   * 用户注册
   * @param req
   * @param res
   * @returns {*|any}
   */
  static signup(req, res) {

    //验证帐号
    //不能为空且格式必须是Email
    req.checkBody(
        'account',
        'account required and must be an email')
      .notEmpty()
      .isEmail();

    //验证昵称
    //不能为空且长度在2-50之间
    req.checkBody(
        'nickName',
        'nick name required and length must between 2-50')
      .notEmpty()
      .isLength(2, 50);

    //验证密码是否合法
    //不能为空且长度在6-20之间
    req.checkBody(
        'password',
        'password required and length must between 6-20')
      .notEmpty()
      .isLength(6, 20);

    let mapErrors = req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if (mapErrors) {
      return res.responseError({
        code:403,
        msg:mapErrors
      });
    }

    let param = {
      account: req.body.account,
      hashedPassword: Util.createHash(req.body.password),
      profile: {
        nickName: req.body.nickName
      }
    };

    User

    //验证帐号是否已经存在
    .unique(param.account)

    //如果不存在，则创建用户
    .then(exist => {

      if (exist) {
        res.responseError({
          code:400,
          msg: 'accout is exist'
        });
        return;
      }

      return User.createUser(param);
    })

    //用户创建成功，发送激活邮件
    .then(doc => {
      res.status(201).json(doc);

      //帐号创建成功后，发送激活邮件
      return User.sendMailToUser(doc);
    })

    //邮件发送成功
    .then(info => {
      logger.debug('Send Email Success:', info.response);
    })

    //捕捉错误
    .catch(err => {
      logger.error(err);

      if (res.headersSent)return;

      res.responseError(err);
    });
  }

  static sendMail(req, res) {
    let id = req.query.id;

    User.sendMailToUser(id)
      .then(function(info) {
        res.send({
          result:true,
          msg:'send mail Success'
        });
        logger.debug(info);
      }, function(err)  {

        res.responseError(err);
        logger.err(err);
      });
  }
  /**
   * 用户登录
   * @param req
   * @param res
   * @returns {*|any}
   */
  static signin(req, res) {

    //验证帐号
    //不能为空
    //必须是email
    req
      .checkBody(
        'account',
        '帐号不能为空且必须是电子邮件')
      .notEmpty()
      .isEmail();

    //验证密码
    //不能为空
    //长度在6-20之间
    req
      .checkBody(
        'password',
        '密码不能为空且长度必须在6-20位之间')
      .notEmpty()
      .isLength(6, 20);

    let mapErrors = req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if (mapErrors) {
      return res.status(403).send({
        result: false,
        msg: mapErrors
      });
    }

    User
      .signin(req.body.account, req.body.password)
      .then(user => {
        return req.generateSession(user);
      })
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.responseError(err);
      });
  }

  /**
   * 退出登录
   * @param req
   * @param res
   */
  static signout(req, res) {

    //销毁session
    req.session.destroy(function() {
      res.redirect('/signin');
    });
  }

  /**
   * qq 开放平台授权登录
   * @param req
   * @param res
   * @returns {*|any}
   */
  static qqOAuth(req, res) {

    let code = req.query.code;
    let token;
    let openId;
    let qqUser;

    //如果所带的参数state与本地不符，则拒绝授权登录
    if (!qqAuthClient.validateState(req.query.state)) {
      return res.status(403).send({
        result: false,
        msg: 'state is incorrect'
      });
    }

    qqAuthClient
      .getToken(code)
      .then(resp => {
        token = resp.access_token;
        return qqAuthClient.getOpenId(token);
      })
      .then(resp => {
        openId = resp.openid;
        return qqAuthClient.getUserInfo(token, openId);
      })
      .then(resp => {
        qqUser = resp;

        //根据openId在数据库查找此用户
        return User.unique(openId, 'openId');
      })
      .then(isExist => {

        let account = {
          account: 'angular2club' + Date.now(),
          openId: openId,
          type: config.userType.QQ,
          isActive: true,
          profile: {
            nickName: qqUser.nickname,
            gender: config.genderType[qqUser.gender],
            avatar: qqUser.figureurl_qq_1,
            province: qqUser.province,
            city: qqUser.city
          }
        };

        //如果用户已经存在，就更新用户资料
        //如果用户不存在，就创建用户
        if (isExist) {
          return User.updateByOpenId(openId, {
            profile: account.profile
          });

          //return user.save();
        } else {
          return User.createUser(account);
        }
      })
      .then(doc => {
        return Util.generateSession(req, doc);
      })
      .then(doc => {
        res.redirect('/');
      })
      .catch(err => {

        logger.error('catch error', err);
        res.status(err.code).render('error', {
          title: err.msg,
          message: err.msg,
          error: err
        });
      });

  }

  /**
   * github 开放平台授权登录
   * @param req
   * @param res
   * @returns {*|any}
   */
  static githubOAuth(req, res) {
    let code = req.query.code;
    let githubUserInfo;

    //如果state不正确，返回错误，防止攻击
    if (!githubAuthClient.validateState(req.query.state)) {
      return res.status(403).send({
        result: false,
        msg: 'state is incorrect'
      });
    }

    githubAuthClient
      .getToken(code)
      .then(resp => {
        logger.debug('得到token\n');
        return githubAuthClient.getUserInfo(resp.access_token);
      })
      .then(resp => {
        logger.debug('得到用户信息\n');
        githubUserInfo = resp;

        return User.unique(githubUserInfo.id, 'openId');
      })
      .then(isExist => {
        let account = {
          account: githubUserInfo.email,
          openId: githubUserInfo.id,
          type: config.userType.GITHUB,
          isActive: true,
          profile: {
            nickName: githubUserInfo.login,
            avatar: githubUserInfo.avatar_url,
            website: githubUserInfo.html_url,
            github: githubUserInfo.email
          }
        };

        if (isExist) {
          logger.debug('用户已经存在，更新\n');
          return User.updateByOpenId(account.openId, account.profile);

          //return user.save();
        } else {
          logger.debug('用户不存在，创建');
          return User.createUser(account);
        }
      })
      .then(doc => {
        logger.debug('创建或更新用户成功\n');

        return Util.generateSession(req, doc);

      })
      .then(doc => {
        res.redirect('/');
      })
      .catch(err => {
        res.responseError(err);
      });
  }
}

module.exports = SignController;
