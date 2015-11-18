'use strict';

var mongoose=require('mongoose');
var Schema=mongoose.Schema;

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
        type:String
    },
    openId:String,//第三方帐号登录的用户ID
    description:String,
    type:{
        required:true,
        type:Number,//1：注册用户，2：QQ用户，3：微博用户:4:github用户,5:微信
        default:1
    },
    isActive:{
        type:Boolean,
        default:false//帐号是否激活，默认未激活
    },
    //用户积分
    score:{
        type:Number,
        default:0
    },
    //发贴数
    postCount:{
        type:Number,
        default:0
    },
    //评论数
    commentCount:{
        type:Number,
        default:0
    },
    //精华文章数
    goodTopicCount:{
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
    province:String,
    city:String,
    address:String,
    website:String,
    birthday:Date,
    siteAdmin:{
        type:Boolean,
        default:false
    },
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
},{
    versionKey:false
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