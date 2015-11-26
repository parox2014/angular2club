'use strict';


const User=require('../models').User;
const util=require('../util');
const userService=require('../services/user');

const querystring=require('querystring');

const config=require('../config');

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
 * @description 激活帐号
 * @param req
 * @param req.params.id {ObjectId} 用户id
 * @param res
 */
exports.active=function(req,res){
    let userid=req.params.id;

    userService.active(userid,function(err,user){
        if(err){
            return res.status(err.code).send(err);
        }

        res.json(user);
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




