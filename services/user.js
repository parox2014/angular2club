'use strict';

const User = require('../models').User;

const config = require('../config');
const Util = require('../util');
const _ = require('underscore');
const Mail = require('./mail');
const mailClient = new Mail('./views/mail/mail-active.ejs');
const EventProxy = require('eventproxy');

class UserService {
  constructor() {
    throw new Error('not need instance');
  }
  static getById(id) {
    return new Promise(function(resolve, reject) {
      User.findById(id,function (err,doc) {
        if (err){
          return reject(err);
        }
        resolve(doc);
      });
    });
  }
  /**
   * 根据openid查询用户
   * @param openId {String}
   * @param callback {Function}
   * @returns {Promise}
   */
  static findUserByOpenId(openId, callback) {
    callback = callback || noop;

    return new Promise((resolve, reject) => {
      User.findOne({
          openId: openId
        })
        .exec((err, doc) => {
          if (err) {
            callback(err);
            reject(err);
            return;
          }

          callback(undefined, doc);
          resolve(doc);
        });
    });
  }

  /**
   * 验证用户的唯一性
   * @param  {String}   value       [需验证的值]
   * @param  {[String]}   uniqueField [需验证的字段]
   * @param  {Function} callback    [回调]
   * @return {[Promise]}               [返回promise]
   */
  static unique(value, uniqueField, callback) {
    if (!uniqueField) {
      //如果不传入比较字段，则默认为account
      uniqueField = 'account';
    } else if (_.isFunction(uniqueField)) {
      callback = uniqueField;
      uniqueField = 'accout';
    }

    callback = callback || noop;

    let query = {};

    query[uniqueField] = value;

    return new Promise(function(resolve, reject) {
      User
        .findOne(query)
        .exec((err, doc) => {
          if (err) {
            callback(err);
            reject(err);
            return;
          }

          let isExist = !!doc;
          callback(isExist);
          resolve(isExist);
        });
    });
  }

  /**
   *  创建用户
   * @param params {Object}
   * @param [callback] {Function}
   * @returns {Promise}
   */
  static createUser(params, callback) {

    let user = new User(params);

    return user.save();
  }

  /**
   * 登录
   * @param account {String} email
   * @param pwd {string}
   * @param [callback] {Function}
   * @returns {Promise}
   */
  static signin(account, pwd, callback) {
    callback = callback || noop;

    return new Promise((resolve, reject) => {
      User.findOne({
          account: account
        })
        .select('account profile.nickName isActive hashedPassword siteAdmin')
        .exec(function(err, user) {

          if (err) {
            err = {
              code: 500,
              result: false,
              msg: err
            };
          } else if (!user) {
            err = {
              code: 404,
              result: false,
              msg: 'user not found'
            };

          } else if (!user.isActive) {
            err = {
              code: 403,
              result: false,
              msg: 'user is not actived'
            };
          } else if (Util.createHash(pwd) !== user.hashedPassword) {
            err = {
              code: 403,
              result: false,
              msg: 'password incorrect'
            };
          }

          if (err) {
            callback(err, undefined);
            reject(err);
            return;
          }

          callback(undefined, user);
          resolve(user);
        });
    });
  }

  /**
   * 用户帐号激活
   * @param id {ObjectId} userid
   * @param [callback] {Function}
   */
  static active(id, callback) {
    callback = callback || noop;

    return new Promise((resolve, reject) => {

      User.findById(id)
        .select('isActive')
        .exec(function(err, user) {
          if (err) {
            err = {
              code: 500,
              result: false,
              msg: err
            };
          } else if (!user) {

            err = {
              code: 404,
              result: false,
              msg: 'user not found'
            };
          } else if (user.get('isActive')) {
            err = {
              code: 403,
              result: false,
              msg: 'user is actived'
            };
          }

          if (err) {
            callback(err, undefined);
            reject(err);
            return;
          }

          user.set('isActive', true);

          user.save(function(err, doc) {
            if (err) {
              callback(err, undefined);
              reject(err);
              return;
            }

            callback(undefined, doc);
            resolve(doc);
          });
        });
    });
  }

  /**
   * 根据openId更新用户
   * @param  {[String]}   openId   [description]
   * @param  {[Object]}   params   [description]
   * @param  {Function} callback [description]
   * @return {[Promise]}            [description]
   */
  static updateByOpenId(openId, params, callback) {
    let query = {
      openId: openId
    };
    return User.findOneAndUpdate(query, params, callback);
  }

  /**
   * 给用户发送邮件
   * @method sendMailToUser
   * @param  {[Object||String]}       user [用户的model或者id]
   * @return {[promise]}            [description]
   */
  static sendMailToUser(user, callback) {
    let proxy = new EventProxy();
    let events = 'getUserSuccess';

    callback = callback || noop;

    return new Promise(function(resolve, reject) {

      proxy.on(events, function(doc) {

        let mailOption = {
          to: doc.account
        };

        let data = {
          user: doc,
          config: config,
          link: `http://test.angular2.club/users/${doc._id}/active`
        };

        mailClient
          .sendMail(data, mailOption)
          .then(function(info) {
            resolve(info);
            callback(null, info);
          })
          .catch(function(err) {
            reject(err);
            callback(err);
          });
      });

      if (_.isObject(user)) {
        proxy.emit(events, user);
      }else {
        User.findById(user)
          .exec(function(err, doc) {

            if (!doc) {
              err = {
                code:404,
                result:false,
                msg:'user not found'
              };
            }

            if (err) {
              callback(err);
              return reject(err);
            }

            proxy.emit(events, doc);
          });
      }

    });
  }
}

module.exports = UserService;
