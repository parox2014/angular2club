'use strict';

const util = require('../util');
const User = require('../services').User;

const config = require('../config');

class UserController {

  /**
   * 验证帐户是否已经存在
   * @param req
   * @param res
   */
  static unique(req, res) {

    logger.debug(req.query);
    User.unique(req.query)
      .then(function(isExist) {
        if (isExist) {
          res.responseError({
            code:403,
            msg:'account is exist'
          });
        } else {
          res.json({
            result: true,
            msg: 'account is not exist'
          });
        }
      }, function(err) {

        res.responseError({
          code:403,
          msg:err
        });
      });
  }

  /**
   * 激活用户帐号
   * @param req
   * @param res
   */
  static active(req, res) {
    let userid = req.params.id;

    userService.active(userid, function(err, user) {
      if (err) {
        return res.responseError(err);
      }

      res.json(user);
    });
  }

  /**
   * 更新用户资料
   * @param req
   * @param res
   */
  static update(req, res) {
    var reqBody = req.body;

    var update = Object.assign({}, reqBody);

    User
      .findByIdAndUpdate(
        req.session.user, {
          $set: {
            profile: update
          }
        }
      )
      .exec(function(err, result) {
        if (err) {
          res.status(500).send({
            result: false,
            msg: err
          });
        } else {
          res.json(result);
        }
      });
  }

  /**
   * 获取用户资料
   * @param req
   * @param res
   */
  static getUserProfile(req, res) {
    var uid = req.params.id;

    User.getById(uid)
      .then(doc=>{
        res.json(doc);
      })
      .catch(err=>{
        res.responseError(err);
      });
  }
}

module.exports = UserController;
