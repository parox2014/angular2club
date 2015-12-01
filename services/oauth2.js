'use strict';

const https = require('https');
const querystring = require('querystring');
const util = require('../util');

class OAuth2 {

  /**
   * 构造函数
   * @param appId
   * @param appKey
   * @param redirectUrl
   */
  constructor(appId, appKey, redirectUrl) {
    this._appId = appId;
    this._appKey = appKey;
    this._redirectUrl = redirectUrl;
    this._grantType = 'authorization_code';
    this._requestOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    this._config = {};
  }

  /**
   * 处理请求返回数据
   * @param response
   * @param resolve {Function}
   * @param reject {Function}
   * @private
   */
  _handleResponse(response, resolve, reject) {
    let buffers = [];

    response.on('data', function(chunk) {
      buffers.push(chunk);
    });

    response.on('end', function() {
      let buf = Buffer.concat(buffers);
      let str = buf.toString('utf8');
      let result;

      str = util.transformJSONPData(str);

      try {
        result = JSON.parse(str);
      } catch (e) {
        result = querystring.parse(str);
      }

      if (result.error) {
        result.code = result.error;
        result.msg = result.error_description;
        return reject(result);
      } else if (result.ret === -1) {
        result.code = 403;
        return reject(result);
      }

      resolve(result);
    });
  }

  /**
   * @description get access token
   * @param code {String} code
   */
  getToken(code) {
    let params = {
      grant_type: this._grantType,
      client_id: this._appId,
      client_secret: this._appKey,
      code: code,
      redirect_uri: this._redirectUrl,
    };

    let config = this._config || {};

    let options = Object.assign({
      path: config.PATH_ACCESS_TOKEN + querystring.stringify(params),
    }, this._requestOptions);

    return new Promise((resolve, reject) => {
      let req = https.request(options, resp => {
        this._handleResponse(resp, resolve, reject);
      });
      req.on('error', function(e) {
        reject(e);
      });

      req.end();
    });
  }

  /**
   * 生成开放平台授权链接
   * @param responseType
   * @param scope
   * @returns {*}
   */
  generateOAuthUri(scope, responseType) {
    let authParams = {
      response_type: responseType || 'code',
      client_id: this._appId,
      redirect_uri: this._redirectUrl,
      state: this._state,
      scope: Array.isArray(scope) ? scope.join(',') : '',
    };

    let config = this._config || {};

    return config.OAUTH_URI + querystring.stringify(authParams);
  }

  /**
   * 验证开放平台返回的状态值是否与本地的状态值一致
   * @param state
   * @returns {boolean}
   */
  validateState(state) {
    return state === this._state;
  }
}

module.exports = OAuth2;
