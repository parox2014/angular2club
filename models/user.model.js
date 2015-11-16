'use strict';

var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var UserSchema=new Schema({
    account:{
        type:String,
        required:true,
        unique:true
    },
    nickName:{
        type:String,
        required:true
    },
    hashedPassword:{
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
    score:{
        type:Number,
        default:0
    },
    postCount:{
        type:Number,
        default:0
    },
    commentCount:{
        type:Number,
        default:0
    },
    qq:String,
    weibo:String,
    weixin:String,
    github:String,
    googlePlus:String,
    facebook:String,
    twitter:String,
    avatar:String,
    gender:String,//male为男性,female为女性
    address:String,
    website:String,
    birthday:Date,
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


UserSchema.statics.unique=function (query) {
    return new Promise((resolve,reject)=>{
        this.findOne(query,function (err,doc) {
                if(err){
                    reject(err);
                }else{
                    let isExist=!!doc;
                    resolve(isExist);
                }
            });
    });
};

UserSchema.pre('save',function(next){
    console.log(this.isNew);
    next();
});

module.exports=mongoose.model('User',UserSchema);