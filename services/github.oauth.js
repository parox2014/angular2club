'use strict';

const https=require('https');
const querystring=require('querystring');
const Util=require('../util');
const OAuth2=require('./oauth2');

class GitHubOAuth2 extends OAuth2{
    constructor(appId,appKey,redirectUrl){

        super(appId,appKey,redirectUrl);

        this._config={
            OAUTH_URI:'https://github.com/login/oauth/authorize?',
            HOST_NAME:'github.com',
            PATH_ACCESS_TOKEN:'/login/oauth/access_token?',
            SCOPE:['user']
        };

        this._requestOptions.hostname=this._config.HOST_NAME;

        this._state=Util.createHash('github_oauth_angular2_club');
    }

    /**
     * @description get user's info by access token
     * @param token {String} access token
     */
    getUserInfo(token){
        let params={
            access_token:token
        };

        let options={
            hostname:'api.github.com',
            path:'/user?'+querystring.stringify(params),
            headers:{
                'Accept':'application/json',
                'User-Agent':'angular2 club'
            }
        };

        return new Promise((resolve,reject)=>{
            let req=https.request(options,resp=>{
                this._handleResponse(resp,resolve,reject);
            });

            req.on('error',function(err){
                reject(err);
            });
            req.end();
        });
    }
}


module.exports=GitHubOAuth2;
