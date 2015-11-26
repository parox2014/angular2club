'use strict';

const config=require('../config');
const User=require('../services/user');
const EventProxy=require('eventproxy');
const util=require('../util');
const qqAuthConfig=config.oAuth.qq;
const githubAuthConfig=config.oAuth.github;

const QQOAuth2=require('../services/qq.oauth');
const qqAuthClient=new QQOAuth2(
    qqAuthConfig.APP_ID,
    qqAuthConfig.APP_KEY,
    qqAuthConfig.CALLBACK_URI
);

const GitHubOAuth2=require('../services/github.oauth');
const githubAuthClient=new GitHubOAuth2(
    githubAuthConfig.APP_ID,
    githubAuthConfig.APP_KEY,
    githubAuthConfig.CALLBACK_URI
);

//渲染登录页
exports.showSignup=function(req,res){
    res.render('signup/signup', { title: '注册' });
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
    req.checkBody('account','account required and must be an email').notEmpty().isEmail();

    //验证昵称是否合法
    req.checkBody('nickName','nick name required and length must between 2-50').notEmpty().isLength(2,50);

    //验证密码是否合法
    req.checkBody('password','password required and length must between 6-20').notEmpty().isLength(6,20);

    let mapErrors=req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if(mapErrors){
        res.set('X-Error','REGISTER_ERROR');
        return res.status(403).send({
            result:false,
            msg:mapErrors
        });
    }

    User
        .createUser(req.body)
        .then(function(user){
            res.json(user);
        },function(err){
            res.status(500).send(err);
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


/**
 * @description 用户登录
 * @param req
 * @param req.body.account {String} 帐号email
 * @param req.body.password {String} 密码
 * @param res
 * @returns {*|any}
 */
exports.signin=function(req,res){
    req.checkBody('account','帐号不能为空且必须是电子邮件').notEmpty().isEmail();
    req.checkBody('password','密码不能为空且长度必须在6-20位之间').notEmpty().isLength(6,20);

    var mapErrors=req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if(mapErrors){
        return res.status(403).send({
            result:false,
            msg:mapErrors
        });
    }

    User
        .signin(req.body)
        .then(function(user){

            util.generateSession(req,user)
                .then(function(data){
                    res.json(data);
                });

        },function(err){
            res.status(err.code).send(err);
        });
};

exports.signout=function(req,res){
    req.session.destroy(function () {
        res.redirect('/signin');
    });
};

exports.qqOAuth=function(req,res){
    let code=req.query.code;
    let proxy=new EventProxy();
    let accessToken,openId;

    const onGetAccessToken='getTokenSuccess';
    const onGetOpenId='getOpenIdSuccess';
    const onFindUserFromDb='findUserFromDb';
    const onGetUserInfo='getQQUserInfoSuccess';

    if(!qqAuthClient.isQQAuthState(req.query.state)){
        return res.status(403).send({result:false,msg:'state is incorrect'});
    }

    proxy.on(onGetAccessToken,function(token){
        qqAuthClient
            .getOpenId(token)
            .then(function(data){
                openId=data.openid;

                proxy.emit(onGetOpenId,openId);
            });
    });

    proxy.on(onGetOpenId,function(openId){

        User.findUserByOpenId(openId)
            .then(user=>{
                proxy.emit(onFindUserFromDb,user);

            },err=>{
                if(err){
                    res.status(500).render('error',{
                        title:err.msg,
                        message:err.msg,
                        error:err
                    });
                }
            });

        qqAuthClient
            .getUserInfo(accessToken,openId)
            .then(function(data){

                proxy.emit(onGetUserInfo,data);
            },function(err){

                res.status(500).render('error',{
                    title:err.msg,
                    message:err.msg,
                    error:err
                });
            });
    });

    proxy.all(onFindUserFromDb,onGetUserInfo,function(user,qqUserInfo){

        var account={
            account:'angular2club'+Date.now(),
            openId:openId,
            type:config.userType.QQ,
            isActive:true,
            profile:{
                nickName:qqUserInfo.nickname,
                gender:config.genderType[qqUserInfo.gender],
                avatar:qqUserInfo.figureurl_qq_1,
                province:qqUserInfo.province,
                city:qqUserInfo.city
            }
        };


        if(user){
            user.set('profile',account.profile);
            user.save(onSaveUserSuccess);
        }else{
            User.createUserByThirdPartyInfo(account,onSaveUserSuccess);
        }
    });

    qqAuthClient
        .getToken(code)
        .then(function(data){
            accessToken=data.access_token;
            proxy.emit(onGetAccessToken,accessToken);
        });

    function onSaveUserSuccess(err,doc){

        if(err){

            //如果创建帐号发生错误，返回500错误
            return res.status(500).render('error', {
                title:err.message,
                message: err.message,
                error: err
            });
        }

        util
            .generateSession(req,doc)
            .then(function(doc){
                res.redirect('/');
            });
    }
};

exports.githubOAuth=function(req,res){
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

    proxy.on(onGetUserSuccess,function(githubUserInfo){
        let account={
            account:githubUserInfo.email,
            openId:githubUserInfo.id,
            type:config.userType.GITHUB,
            isActive:true,
            profile:{
                nickName:githubUserInfo.login,
                avatar:githubUserInfo.avatar_url,
                website:githubUserInfo.html_url,
                github:githubUserInfo.email
            }
        };

        User.findUserByOpenId(githubUserInfo.id)
            .then(function(user){

                if(user){

                    user.set('profile',account.profile);
                    user.save(onSaveUserSuccess)
                }else{

                    User.createUserByThirdPartyInfo(account,onSaveUserSuccess);
                }
            },function(err){

                res.status(500).send(err);
            });
    });


    githubAuthClient
        .getToken(code)
        .then(function(data){
            proxy.emit(onGetTokenSuccess,data.access_token);
        },onError);

    function onSaveUserSuccess(err,doc){

        if(err){
            logger.error(err);
            //如果创建帐号发生错误，返回500错误
            return res.status(500).send({msg:err});
        }

        util
            .generateSession(req,doc)
            .then(function(){
                res.redirect('/');
            });
    };
};