'use strict';


const User=require('../models/models').User;
const mailService=require('../services/mail');
const util=require('../util/util');

const https=require('https');
const querystring=require('querystring');
const EventProxy=require('eventproxy');

const config=require('../config');
const qqAuthConfig=config.oAuth.qq;
const githubAuthConfig=config.oAuth.github;

const QQOAuth2=require('../services/qq.auth.service');
const qqAuthClient=new QQOAuth2(
    qqAuthConfig.APP_ID,
    qqAuthConfig.APP_KEY,
    qqAuthConfig.CALLBACK_URI
);

const GitHubOAuth2=require('../services/github.auth.service');
const githubAuthClient=new GitHubOAuth2(
    githubAuthConfig.APP_ID,
    githubAuthConfig.APP_KEY,
    githubAuthConfig.CALLBACK_URI
);

/**
 * @description 验证用户帐号是否唯一
 * @param req
 * @param req.params.account {String}需要验证的帐号
 * @param res
 */
exports.unique=function (req,res) {
    User.unique(req.query)
        .then(function (isExist) {
            if(isExist){
                var msg='ACCOUNT_IS_EXIST';
                res.set('X-Error',msg);
                res.status(403).send({msg:msg});
            }else{
                res.json({
                    result:true,
                    msg:'ACCOUNT_IS_NOT_EXIST'
                });
            }
        },function(err){
            res.status(403).send({msg:err});
        });
};

/**
 * @description 注册帐号
 * @param req
 * @param req.body.account {String} 帐号email
 * @param req.body.password {String} 密码
 * @param req.body.nickName {String} 用户昵称
 * @param res
 * @returns {*|any}
 */
exports.signup=function(req,res){

    //验证帐号是否合法
    req.checkBody('account','ACCOUNT_INCORRECT').notEmpty().isEmail();

    //验证昵称是否合法
    req.checkBody('nickName','NICKNAME_INCORRECT').notEmpty().isLength(2,20);

    //验证密码是否合法
    req.checkBody('password','password required and length must between 6-20').notEmpty().isLength(6,10);

    var mapErrors=req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if(mapErrors){
        res.set('X-Error','REGISTER_ERROR');
        return res.status(403).send({
            result:false,
            msg:mapErrors
        });
    }

    var reqBody=req.body;

    var account={
        account:reqBody.account,
        nickName:reqBody.nickName,
        hashedPassword:util.hashPW(reqBody.password)
    };

    User.unique({account:account.account})
        .then(function (isExist) {
            //如果帐号已经存在,返回403错误
            if(isExist){
                return res.status(403).send({
                    result:false,
                    msg:'ACCOUNT_IS_EXIST'
                });
            }

            //如果帐号不存在，则创建帐号
            User.create(account,function(err,user){

                if(err){
                    //如果创建帐号发生错误，返回500错误
                    return res.status(500).send({msg:err});
                }

                //帐号创建成功后，发送激活邮件
                mailService
                 .sendActiveMail(user)
                 .then(function (info) {
                    console.log('Send Email Success',info.response);
                 },function (err) {
                    console.error('Send Email Failed',err);
                 });

                //返回用户信息
                res.json(user);
            });
        });
};

/**
 * @description 激活帐号
 * @param req
 * @param req.params.id {ObjectId} 用户id
 * @param res
 */
exports.active=function(req,res){
    User.findById(req.params.id,function(err,user){
        if(err){
            return res.status(500)
                    .send({
                        result:false,
                        msg:err
                    });
        }

        if(!user){
            return res
                .status(404)
                .send({
                    result:false,
                    msg:'USER_NOT_FOUND'
                });
        }

        if(user.get('isActive')){
            return res
                .status(400)
                .send({
                    result:false,
                    msg:'USER_IS_ACTIVED'
                });
        }

        user.set('isActive',true);

        user.save(function(err,doc){
            res.send({msg:'ACTIVE_USER_SUCCESS',result:true});
        });
    });
};

/**
 * @description 用户登录
 * @param req
 * @param req.body.account {String} 帐号email
 * @param req.body.password {String} 密码
 * @param res
 * @returns {*|any}
 */
exports.signin=function(req,res){
    req.checkBody('account','ACCOUNT_REQUIRED&MUST_BE_EMAIL').notEmpty().isEmail();
    req.checkBody('password','PASSWORD_REQUIRED&MUST_BETWEEN_6-20').notEmpty().isLength(6,20);

    var mapErrors=req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if(mapErrors){
        res.set('X-Error','LOGIN_ERROR');

        return res.status(403).send({
            result:false,
            msg:mapErrors
        });
    }

    User.findOne({account:req.body.account})
        .exec(function(err,user){
            if(err){
                return res.status(500)
                    .send({
                        result:false,
                        msg:err
                    });
            }

            if(!user){
                return res
                    .status(404)
                    .send({
                        result:false,
                        msg:'USER_NOT_FOUND'
                    });
            }

            if(!user.get('isActive')){
                res.status(403)
                    .send({
                        result:false,
                        msg:'USER_IS_NOT_ACTIVE'
                    });
            }else if(util.hashPW(req.body.password)===user.hashedPassword){
                util.generateSession(req,res,user)
                    .then(function(data){
                        res.json(data);
                    });
            }else{
                res
                    .status(400)
                    .send({
                        result:false,
                        msg:'PASSWORD_INCORRECT',
                        data:user
                    });
            }
        });
};

exports.update=function(req,res){
    var reqBody=req.body;

    var update=Object.assign({},reqBody);

    User
        .findByIdAndUpdate(
            req.session.user,
            {$set:{profile:update}}
        )
        .exec(function(err,result){
            if(err){
                res.status(500).send({result:false,msg:err});
            } else {
                res.json(result);
            }
        });
};


exports.getUserDetail=function(req,res){
    var uid=req.params.id;

    User.findOne({_id:uid})
        .populate('topics','title content')
        .exec(function(err,user){
            if(err){
                res.status(500).send({result:false,msg:err});
            } else {
                res.json(user);
            }
        });
};

//渲染登录页
exports.showSignin=function(req,res){

    if(req.session.user){
        res.redirect('/');
    }else{
        res.render('signin/signin',{
            title:'登录',
            github:githubAuthClient.generateAuthUrl(githubAuthConfig.SCOPE),
            qq:qqAuthClient.generateAuthUrl()
        });
    }
};

exports.authQQ=function(req,res){
    let code=req.query.code;
    let proxy=new EventProxy();
    let accessToken,openId;

    const ON_GET_TOKEN='getTokenSuccess';
    const ON_GET_OPEN_ID='getOpenIdSuccess';
    const FIND_USER_FROM_DB='findUserFromDb';
    const GET_QQ_USER_INFO_SUCCESS='getQQUserInfoSuccess';

    if(!qqAuthClient.isQQAuthState(req.query.state)){
        return res.status(403).send({result:false,msg:'state is incorrect'});
    }

    proxy.on(ON_GET_TOKEN,function(token){
        qqAuthClient
            .getOpenId(token)
            .then(function(data){
                openId=data.openid;

                proxy.emit(ON_GET_OPEN_ID,openId);
            });
    });

    proxy.on(ON_GET_OPEN_ID,function(openId){

        User.findOne({openId:openId})
            .exec(function(err,user){
                if(err){
                    return res.status(500).send(err);
                }
                proxy.emit(FIND_USER_FROM_DB,user);
                console.log(FIND_USER_FROM_DB);
            });

        qqAuthClient
            .getUserInfo(accessToken,openId)
            .then(function(data){
                proxy.emit(GET_QQ_USER_INFO_SUCCESS,data);
                console.log(GET_QQ_USER_INFO_SUCCESS);
            },function(err){
                res.status(500).render('error',{
                    title:err.msg,
                    message:err.msg,
                    error:err
                });
            });
    });

    proxy.all(FIND_USER_FROM_DB,GET_QQ_USER_INFO_SUCCESS,function(user,data){

        var account={
            account:openId,
            openId:openId,
            nickName:data.nickname,
            type:config.userType.QQ,
            isActive:true,
            profile:{
                gender:data.gender,
                avatar:data.figureurl_qq_1,
                province:data.province,
                city:data.city
            }
        };

        let onSaveUserSuccess=function(err,doc){

            if(err){
                //如果创建帐号发生错误，返回500错误
                return res.status(500).render('error', {
                    title:err.message,
                    message: err.message,
                    error: err
                });
            }

            util
                .generateSession(req,res,doc)
                .then(function(doc){
                    res.redirect('/');
                });
        };

        if(user){
            user.save(account,onSaveUserSuccess);
        }else{
            User.create(account,onSaveUserSuccess);
        }

    });

    qqAuthClient
        .getToken(code)
        .then(function(data){
            accessToken=data.access_token;
            proxy.emit(ON_GET_TOKEN,accessToken);
        });
};

exports.authGithub=function(req,res){
    let code=req.query.code;
    let proxy=new EventProxy();

    const onGetTokenSuccess='getTokenSuccess';
    const onGetUserSuccess='getUserSuccess';

    let onError=function(err){
        res.status(500).send(err);
    };

    //如果state不正确，返回错误，防止攻击
    if(!githubAuthClient.isGithubAuthState(req.query.state)){
        return res.status(403).send({result:false,msg:'state is incorrect'});
    }

    proxy.on(onGetTokenSuccess,function(token){
        githubAuthClient
            .getUserInfo(token)
            .then(function(user){
                proxy.emit(onGetUserSuccess,user);
            },onError);
    });

    proxy.on(onGetUserSuccess,function(user){
        var account={
            account:user.email,
            openId:user.id,
            nickName:user.login,
            type:config.userType.GITHUB,
            isActive:true,
            profile:{
                avatar:user.avatar_url,
                website:user.html_url,
                github:user.email
            }
        };

        let onSaveUserSuccess=function(err,doc){

            if(err){
                //如果创建帐号发生错误，返回500错误
                return res.status(500).send({msg:err});
            }

            util
                .generateSession(req,res,doc)
                .then(function(){
                    res.redirect('/');
                });
        };

        User.findOne({openId:user.id})
            .select('_id')
            .exec(function(err,user){
                if(err){
                    return res.status(500).send(err);
                }

                if(user){
                    user.save(account,onSaveUserSuccess)
                }else{
                    User.create(account,onSaveUserSuccess);
                }
            });
    });

    githubAuthClient
        .getToken(code)
        .then(function(data){
            proxy.emit(onGetTokenSuccess,data.access_token);
        },onError);
};