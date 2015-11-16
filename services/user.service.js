const config=require('../config');
const https=require('https');
const querystring=require('querystring');
const util=require('../util/util');
const qqAuthConfig=config.thirdPart.qq;

exports.getQQAccessToken=function(code){

    let params={
        grant_type:'authorization_code',
        client_id:qqAuthConfig.APP_ID,
        client_secret:qqAuthConfig.APP_KEY,
        code:code,
        redirect_uri:qqAuthConfig.CALLBACK_URI
    };

    let options={
        hostname:qqAuthConfig.HOST_NAME,
        path:qqAuthConfig.PATH_ACCESS_TOKEN+querystring.stringify(params),
        method:'GET'
    };

    return new Promise(function(resolve,reject){
        https
            .request(options,function(response){
                let data='';
                response.on('data',function(chunk){
                    data+=chunk;

                    data=util.transformJSONPData(data);

                    try{
                        data=querystring.parse(data);
                    }catch (e){
                        data=JSON.parse(data);
                    }

                    resolve(data);
                });
            })
            .on('error',function(e){
                reject(e);
            })
            .end();
    });
};

exports.getQQOpenId=function(accessToken){
    let params={
        access_token:accessToken
    };

    let options={
        hostname:qqAuthConfig.HOST_NAME,
        path:qqAuthConfig.PATH_OPEN_ID+querystring.stringify(params),
        method:'GET'
    };

    return new Promise(function(resolve,reject){
        https
            .request(options,function(response){
                let data='';

                response.on('data',function(chunk){
                    data+=chunk;
                    data=util.transformJSONPData(data);

                    data=JSON.parse(data);

                    resolve(data);
                });
            })
            .on('error',function(err){
                reject(err);
            })
            .end();
    });
};


exports.getQQUserInfo=function(accessToken,openId){

};

exports.generateSession=function(req,res,user){
    req.session.regenerate(function(){
        req.session.user=user._id;
        req.session.account=user.account;
        req.session.nickName=user.nickName;
        req.session.msg='Authenticated as '+user.nickName;

        user.set('lastOnline',Date.now());

        user.save(function(err){
            if(err){
                return res.status(500).send({result:false,msg:err});
            }
            res.json(user);
        });
    });
};