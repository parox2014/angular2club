'use strict';

const User=require('../models').User;

const config=require('../config');
const util=require('../util');

exports.findUserByOpenId=function(openId,callback){
    callback=callback||noop;
    return new Promise((resolve,reject)=>{
        User.findOne({openId:openId})
            .exec((err,doc)=>{
                if(err){
                    callback(err);
                    reject(err);
                    return;
                }
                callback(undefined,doc);
                resolve(doc);
            });
    });
};

exports.createUser=function(params,callback){

    callback=callback||noop;

    return new Promise((resolve,reject)=>{
        User.unique({account:params.account})
            .then(function (isExist) {
                //如果帐号已经存在,返回错误
                if(isExist){
                    let err={
                        code:403,
                        result:false,
                        msg:'account is exist'
                    };

                    callback(err,undefined);
                    reject(err);
                    return;
                }

                //如果帐号不存在，则创建帐号
                let user=new User();

                user.set('account',params.account);
                user.set('hashedPassword',util.hashPW(params.password));
                user.set('profile.nickName',params.nickName);

                user.save(function(err,doc){
                    if(err){
                        callback(err,undefined);
                        reject(err);
                        return;
                    }

                    callback(undefined,user);
                    resolve(user);
                });
            });
    });

};

exports.createUserByThirdPartyInfo=function(userInfo,callback){
    callback=callback||noop;

    return new Promise((resolve,reject)=>{
        let user=new User(userInfo);

        user.save(function(err,doc){
            if(err){
                callback(err,undefined);
                reject(err);
                return;
            }

            callback(undefined,doc);
            resolve(doc);
        });
    });
};

exports.updateUser=(params,callback)=>{

};

exports.signin=function(params,callback){
    callback=callback||noop;

    return new Promise((resolve,reject)=>{
        User.findOne({account:params.account})
            .select('account nickName isActive hashedPassword')
            .exec(function(err,user){

                if(err){
                    err={
                        code:500,
                        result:false,
                        msg:err
                    };
                }else if(!user){
                    err={
                        code:404,
                        result:false,
                        msg:'user not found'
                    };

                }else if(!user.isActive){
                    logger.debug(user);
                    err={
                        code:403,
                        result:false,
                        msg:'user is not actived'
                    };
                } else if(util.hashPW(params.password)!==user.hashedPassword){
                    err={
                        code:403,
                        result:false,
                        msg:'password incorrect'
                    };
                }

                if(err){
                    callback(err,undefined);
                    reject(err);
                    return;
                }

                callback(undefined,user);
                resolve(user);
            });
    });
};

/**
 * @description 激活帐号
 * @param userId {ObjectId} 用户id
 * @param [callback] {Function}
 */
exports.active=function(userId,callback){
    callback=callback||noop;

    new Promise((resolve,reject)=>{

        User.findById(userId)
            .select('isActive')
            .exec(function(err,user){
                if(err){
                    err={
                        code:500,
                        result:false,
                        msg:err
                    };
                }else if(!user) {

                    err={
                        code:404,
                        result:false,
                        msg:'user not found'
                    };
                }else if(user.get('isActive')){
                    err={
                        code:403,
                        result:false,
                        msg:'user is actived'
                    };
                }

                if(err){
                    callback(err,undefined);
                    reject(err);
                    return;
                }

                user.set('isActive',true);

                user.save(function(err,doc){
                    if(err){
                        callback(err,undefined);
                        reject(err);
                        return;
                    }
                    callback(undefined,doc);
                    resolve(doc);
                });
            });
    });
};

