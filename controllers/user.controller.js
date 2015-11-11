'use strict';


const User=require('../models/models').User;
const mailService=require('../services/mail');
const util=require('../util/util');

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

//帐号注册
exports.signup=function(req,res){

    //验证帐号是否合法
    req.checkBody('account','ACCOUNT_INCORRECT').notEmpty().isEmail();

    //验证昵称是否合法
    req.checkBody('nickName','NICKNAME_INCORRECT').notEmpty().isLength(2,20);

    //验证密码是否合法
    req.checkBody('password','PASSWORD_INCORRECT').notEmpty().isLength(6,10);

    var mapErrors=req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if(mapErrors){
        res.set('X-Error','REGISTER_ERROR');
        return res.status(403).send(mapErrors);
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
                return res.status(403).send({msg:'ACCOUNT_IS_EXIST'});
            }

            //如果帐号不存在，则创建帐号
            User.create(account,function(err,user){

                console.log(user);
                if(err){
                    //如果创建帐号发生错误，返回500错误
                    return res.status(500).send({msg:err});
                }

                //帐号创建成功后，发送激活邮件
                /*mailService
                 .sendActiveMail(user)
                 .then(function (info) {
                 console.log('Send Email Success',info.response);
                 },function (err) {
                 console.error('Send Email Failed',err);
                 });*/

                //返回用户信息
                res.json(user);
            });
        });
};