'use strict';

const crypto=require('crypto');
//对密码进行hash
exports.hashPW=function(pass){
    return crypto.createHash('sha256').update(pass).digest('base64').toString();
};
exports.transformJSONPData=function(data){
    data=data.replace(/^callback\(/,'');
    return data.replace(');','');
};

exports.generateSession=function(req,res,user){

    return new Promise(function(resolve,reject){
        req.session.regenerate(function(){
            req.session.user=user._id;
            req.session.account=user.account;
            req.session.nickName=user.nickName;
            req.session.siteAdmin=user.siteAdmin;
            req.session.msg='Authenticated as '+user.nickName;

            user.set('lastOnline',Date.now());

            user.save(function(err){
                if(err){
                    reject(err);
                }else{
                    resolve(user);
                }
            });

        });
    });
};

exports.pick=function(model,props){
    var result={};

    props.forEach(function(prop){
        let value=model[prop];
        if(value){
            result[prop]=value;
        }
    });

    return result;
};