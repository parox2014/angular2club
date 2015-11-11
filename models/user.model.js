'use strict';

var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var UserSchema=new Schema({
    account:{
        type:String,
        required:true
    },
    nickName:{
        type:String,
        required:true
    },
    openId:String,
    description:String,
    type:{
        required:true,
        type:Number,//1：注册用户，2：QQ用户，3：微信用户，4：微博用户
        default:1
    },
    isActive:{
        type:Boolean,
        default:false//帐号是否激活，默认未激活
    },
    qq:Number,
    weibo:String,
    weixin:String,
    avatar:String,
    gender:String,//male为男性,female为女性
    address:String,
    createAt:{
        type:Date,
        default:Date.now
    },
    updateAt:{
        type:Date,
        default:Date.now
    },
    lastOnline:{
        type:Date,
        default:Date.now
    }
});

UserSchema.statics.findUserByNickName=function (nickName) {
    return this.find({ nickName: nickName });
};

UserSchema.statics.unique=function (query) {
    return new Promise((resolve,reject)=>{
        this.findOne(query,function (err,doc) {
                console.log(query);
                console.log(doc);

                if(err){
                    reject(err);
                }else{
                    let isExist=!!doc;
                    resolve(isExist);
                }
            });
    });
};

module.exports=mongoose.model('User',UserSchema);