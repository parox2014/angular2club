'use strict';

const config=require('../config');
const User=require('../services/user');
const EventProxy=require('eventproxy');
const util=require('../util');
const qqAuthConfig=config.oAuth.qq;
const githubAuthConfig=config.oAuth.github;
const services=require('../services');

const QQOAuth2=services.QQOAuth2;
const qqAuthClient=new QQOAuth2(
    qqAuthConfig.APP_ID,
    qqAuthConfig.APP_KEY,
    qqAuthConfig.CALLBACK_URI
);

const GitHubOAuth2=services.GithubOAuth2;
const githubAuthClient=new GitHubOAuth2(
    githubAuthConfig.APP_ID,
    githubAuthConfig.APP_KEY,
    githubAuthConfig.CALLBACK_URI
);

const Mail=services.Mail;
const mailClient=new Mail('./views/mail/mail-active.ejs');

class SignController{

    /**
     * 渲染注册页
     * @param req
     * @param res
     */
    static showSignup(req,res){
        res.render('signup/signup', { title: '注册' });
    }

    /**
     * 渲染登录页
     * @param req
     * @param res
     */
    static showSignin(req,res){

        if(req.session.user){
            res.redirect('/');
        }else{
            res.render('signin/signin',{
                title:'登录',
                github:githubAuthClient.generateOAuthUri(githubAuthConfig.SCOPE),
                qq:qqAuthClient.generateOAuthUri()
            });
        }
    }

    /**
     * 用户注册
     * @param req
     * @param res
     * @returns {*|any}
     */
    static signup (req,res){

        //验证帐号
        //不能为空且格式必须是Email
        req.checkBody(
            'account',
            'account required and must be an email')
            .notEmpty()
            .isEmail();

        //验证昵称
        //不能为空且长度在2-50之间
        req.checkBody(
            'nickName',
            'nick name required and length must between 2-50')
            .notEmpty()
            .isLength(2,50);

        //验证密码是否合法
        //不能为空且长度在6-20之间
        req.checkBody(
            'password',
            'password required and length must between 6-20')
            .notEmpty()
            .isLength(6,20);

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

                let mailOption= {
                    to: user.account
                };

                let data={
                    user:user,
                    config:config,
                    link:`http://test.angular2.club/user/${user._id}/active`
                };


                //帐号创建成功后，发送激活邮件
                mailClient
                    .sendMail(data,mailOption)
                    .then(function (info) {
                        logger.debug('Send Email Success:',info.response);
                    },function (err) {
                        logger.error('Send Email Failed:',err);
                    });
            },function(err){
                res.status(err.code).send(err);
            });
    }

    /**
     * 用户登录
     * @param req
     * @param res
     * @returns {*|any}
     */
    static signin (req,res){

        //验证帐号
        //不能为空
        //必须是email
        req
            .checkBody(
                'account',
                '帐号不能为空且必须是电子邮件')
            .notEmpty()
            .isEmail();

        //验证密码
        //不能为空
        //长度在6-20之间
        req
            .checkBody(
                'password',
                '密码不能为空且长度必须在6-20位之间')
            .notEmpty()
            .isLength(6,20);

        let mapErrors=req.validationErrors(true);

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
    }

    /**
     * 退出登录
     * @param req
     * @param res
     */
    static signout (req,res){

        //销毁session
        req.session.destroy(function () {
            res.redirect('/signin');
        });
    }

    /**
     * qq 开放平台授权登录
     * @param req
     * @param res
     * @returns {*|any}
     */
    static qqOAuth (req,res){

        let code=req.query.code;
        let token,openId,qqUser;

        //如果所带的参数state与本地不符，则拒绝授权登录
        if(!qqAuthClient.validateState(req.query.state)){
            return res.status(403).send({result:false,msg:'state is incorrect'});
        }

        qqAuthClient
            .getToken(code)
            .then(resp=>{

                token=resp.access_token;
                logger.debug(`得到口令：${token}\n`);
                return qqAuthClient.getOpenId(token);
            })
            .then(resp=>{
                openId=resp.openid;
                logger.debug(`得到openId：${openId}\n`);
                return qqAuthClient.getUserInfo(token,openId);
            })
            .then(resp=>{
                qqUser=resp;

                logger.debug(`得到用户信息：${JSON.stringify(qqUser)}\n`);
                //根据openId在数据库查找此用户
                return User.findUserByOpenId(openId);
            })
            .then(user=>{

                let account={
                    account:'angular2club'+Date.now(),
                    openId:openId,
                    type:config.userType.QQ,
                    isActive:true,
                    profile:{
                        nickName:qqUser.nickname,
                        gender:config.genderType[qqUser.gender],
                        avatar:qqUser.figureurl_qq_1,
                        province:qqUser.province,
                        city:qqUser.city
                    }
                };
                //如果用户已经存在，就更新用户资料
                //如果用户不存在，就创建用户
                if(user){
                    logger.debug(`用户已经存在，更新\n`);
                    user.set('profile',account.profile);
                    return user.save();
                }else{
                    logger.debug(`用户不存在，创建用户\n`);
                    return User.createUserByThirdPartyInfo(account);
                }
            })
            .then(doc=>{
                logger.debug(`创建或更新用户成功\n`);
                util
                    .generateSession(req,doc)
                    .then(function(doc){
                        res.redirect('/');
                    });
            })
            .catch(err=>{

                logger.error('catch error',err);
                res.status(err.code).render('error', {
                    title:err.msg,
                    message: err.msg,
                    error: err
                });
            });

    }

    /**
     * github 开放平台授权登录
     * @param req
     * @param res
     * @returns {*|any}
     */
    static githubOAuth (req,res){
        let code=req.query.code;
        let proxy=new EventProxy();
        let githubUserInfo={};

        const onGetTokenSuccess='getTokenSuccess';
        const onGetUserSuccess='getUserSuccess';

        let onError=function(err){
            res.status(500).send(err);
        };



        //如果state不正确，返回错误，防止攻击
        if(!githubAuthClient.validateState(req.query.state)){
            return res.status(403).send({result:false,msg:'state is incorrect'});
        }

        githubAuthClient
            .getToken(code)
            .then(resp=>{
                logger.debug('得到token\n');
                return githubAuthClient.getUserInfo(resp.access_token);
            })
            .then(resp=>{
                logger.debug('得到用户信息\n');
                githubUserInfo=resp;

                return User.findUserByOpenId(githubUserInfo.id);
            })
            .then(user=>{
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

                logger.debug('数据库查找用户完成\n');
                if(user){
                    user.set('profile',account.profile);
                    return user.save();
                }else{

                    return User.createUserByThirdPartyInfo(account);
                }
            })
            .then(doc=>{
                logger.debug('创建或更新用户成功\n');

                util
                    .generateSession(req,doc)
                    .then(function(){
                        res.redirect('/');
                    });
            })
            .catch(err=>{
                logger.error('catch error',err);
                res.status(err.code).render('error', {
                    title:err.msg,
                    message: err.msg,
                    error: err
                });
            });
    }
}

module.exports=SignController;