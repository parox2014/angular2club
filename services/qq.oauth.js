'use strict';

const https = require('https');
const querystring = require('querystring');
const Util = require('../util');
const OAuth2 = require('./oauth2');

class QQOAuth2 extends OAuth2 {

  /**
   * [constructor description]
   * @method constructor
   * @param  {[type]}    appId       [description]
   * @param  {[type]}    appKey      [description]
   * @param  {[type]}    redirectUrl [description]
   * @return {[type]}                [description]
   */
  constructor(appId, appKey, redirectUrl) {

    super(appId, appKey, redirectUrl);

    this._config = {
      HOST_NAME: 'graph.qq.com',
      PATH_ACCESS_TOKEN: '/oauth2.0/token?',
      PATH_OPEN_ID: '/oauth2.0/me?',
      PATH_GET_USER_INFO: '/user/get_user_info?',
      OAUTH_URI: 'https://graph.qq.com/oauth2.0/authorize?',
    };

    this._requestOptions.hostname = this._config.HOST_NAME;

    this._state = Util.createHash('qq_oauth_angular2_club');
  }

  /**
   * @description get user's openId by access token
   * @param token {String} access token
   */
  getOpenId(token) {
      let params = {
        access_token: token,
      };

      let options = Object.assign({
        path: this._config.PATH_OPEN_ID + querystring.stringify(params),
      }, this._requestOptions);

      return new Promise((resolve, reject) => {
        https
          .request(options, resp => {
            this._handleResponse(resp, resolve, reject);
          })
          .on('error', function(err) {
            reject(err);
          })
          .end();
      });
    }
    /**
     * @description get user's info by access token and openId
     * @param token {String} access token
     * @param openId {String} openId
     */
  getUserInfo(token, openId) {
    let params = {
      access_token: token,
      openid: openId,
      oauth_consumer_key: this._appId,
    };

    let options = Object.assign({
      path: this._config.PATH_GET_USER_INFO + querystring.stringify(
        params),
    }, this._requestOptions);

    return new Promise((resolve, reject) => {
      https
        .request(options, resp => {
          this._handleResponse(resp, resolve, reject);
        })
        .on('error', function(err) {
          reject(err);
        })
        .end();
    });
  }
}

module.exports = QQOAuth2;
