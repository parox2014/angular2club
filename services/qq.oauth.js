'use strict';

const https = require('https');
const querystring = require('querystring');
const util = require('../util');
const qqAuthConfig = {
    HOST_NAME: 'graph.qq.com',
    PATH_ACCESS_TOKEN: '/oauth2.0/token?',
    PATH_OPEN_ID: '/oauth2.0/me?',
    PATH_GET_USER_INFO: '/user/get_user_info?'
};

class QQOAuth2 {
    constructor(appId, appKey, redirectUrl) {
        this._appId = appId;
        this._appKey = appKey;
        this._redirectUrl = redirectUrl;
        this._grantType = 'authorization_code';
        this._requestOptions = {
            hostname: qqAuthConfig.HOST_NAME,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        this._state = util.hashPW('qq_oauth_angular2_club');
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
            redirect_uri: this._redirectUrl
        };

        let options = Object.assign({
            path: qqAuthConfig.PATH_ACCESS_TOKEN + querystring.stringify(params)
        }, this._requestOptions);

        return new Promise(function (resolve, reject) {
            let req = https.request(options, function (response) {
                let buffers = [];
                response.on('data', function (chunk) {
                    buffers.push(chunk);
                });

                response.on('end', function () {
                    let buf = Buffer.concat(buffers);
                    let str = buf.toString('utf8');
                    let result;

                    logger.debug('token is:', str);
                    try {
                        result = querystring.parse(str);
                    } catch (e) {
                        result = JSON.parse(str);
                    }

                    resolve(result);
                });

            });
            req.on('error', function (e) {
                reject(e);
            });
            req.end();
        });
    }
    /**
     * @description get user's openId by access token
     * @param token {String} access token
     */
    getOpenId(token) {
        let params = {
            access_token: token
        };


        let options = Object.assign({
            path: qqAuthConfig.PATH_OPEN_ID + querystring.stringify(params)
        }, this._requestOptions);

        return new Promise(function (resolve, reject) {
            https
                .request(options, function (response) {
                    let data = '';

                    response.on('data', function (chunk) {
                        data += chunk;
                    });

                    response.on('end', function () {
                        data = util.transformJSONPData(data);

                        try {
                            data = JSON.parse(data);

                        } catch (e) {
                            data = querystring.parse(data);
                        }

                        resolve(data);
                    });
                })
                .on('error', function (err) {
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
            oauth_consumer_key: this._appId
        };


        let options = Object.assign({
            path: qqAuthConfig.PATH_GET_USER_INFO + querystring.stringify(params)
        }, this._requestOptions);

        return new Promise(function (resolve, reject) {
            https
                .request(options, function (response) {
                    let data = '';

                    response.on('data', function (chunk) {
                        data += chunk;
                    });

                    response.on('end', function () {
                        data = JSON.parse(data);

                        if (data.ret === -1) {
                            return reject(data);
                        }

                        resolve(data);
                    });
                })
                .on('error', function (err) {
                    reject(err);
                })
                .end();
        });
    }
    generateAuthUrl(responseType, scope) {
        let qqAuthParams = {
            response_type: responseType || 'code',
            client_id: this._appId,
            redirect_uri: this._redirectUrl,
            state: this._state,
            scope: Array.isArray(scope) ? scope.join(',') : ''
        };

        return 'https://graph.qq.com/oauth2.0/authorize?' + querystring.stringify(qqAuthParams)
    }
    isQQAuthState(state) {
        return state === this._state;
    }
}


module.exports = QQOAuth2;