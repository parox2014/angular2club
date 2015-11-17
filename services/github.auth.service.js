'use strict';

const https=require('https');
const querystring=require('querystring');
const util=require('../util/util');
const githubAuthConfig={
    AUTH_URI:'https://github.com/login/oauth/authorize?',
    HOST_NAME:'github.com',
    PATH_ACCESS_TOKEN:'/login/oauth/access_token?',
    SCOPE:['user']
};

class GitHubOAuth2{
    constructor(appId,appKey,redirectUrl){
        this._appId=appId;
        this._appKey=appKey;
        this._redirectUrl=redirectUrl;
        this._requestOptions={
            hostname:githubAuthConfig.HOST_NAME,
            method:'GET',
            headers:{
                'Accept':'application/json'
            }
        };

        this._state=util.hashPW('github_oauth_angular2_club');
    }

    /**
     * @description get access token
     * @param code {String} code
     */
    getToken(code){
        let params={
            client_id:this._appId,
            client_secret:this._appKey,
            code:code,
            redirect_uri:this._redirectUrl
        };

        let options=Object.assign({
            path:githubAuthConfig.PATH_ACCESS_TOKEN+querystring.stringify(params)
        },this._requestOptions);

        return new Promise(function(resolve,reject){
            let req=https.get(options,function(response){
                let data='';
                response.on('data',function(chunk){
                    data+=chunk;
                });

                response.on('end',function(){
                    resolve(JSON.parse(data));
                });
            });

            req.on('error',function(err){
                reject(err);
            });
            req.end();
        });
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

        return new Promise(function(resolve,reject){
            let req=https.request(options,function(response){
                let data='';
                response.on('data',function(chunk){
                    data+=chunk;
                });

                response.on('end',function(){
                    resolve(JSON.parse(data));
                });
            });

            req.on('error',function(err){
                reject(err);
            });
            req.end();
        });
    }
    generateAuthUrl(scope){
        let githubParams={
            client_id:this._appId,
            redirect_uri:this._redirectUrl,
            scope:Array.isArray(scope)?scope.join(','):'',
            state:this._state
        };

        return githubAuthConfig.AUTH_URI+querystring.stringify(githubParams)
    }
    isGithubAuthState(state){
        return state===this._state;
    }
}


module.exports=GitHubOAuth2;