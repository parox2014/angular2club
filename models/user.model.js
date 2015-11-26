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
    hashedPassword:{
        type:String
    },
    openId:String,//第三方帐号登录的用户ID

    type:{
        required:true,
        type:Number,//1：注册用户，2：QQ用户，3：微博用户:4:github用户,5:微信
        default:1
    },
    isActive:{
        type:Boolean,
        default:false//帐号是否激活，默认未激活
    },
    meta:{
        //用户积分
        score:{
            type:Number,
            default:0
        },
        //发贴数
        topicCount:{
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
        }
    },
    profile:{
        nickName:{
            type:String,
            required:true
        },
        realName:String,
        mobile:String,
        email:String,
        qq:String,
        weibo:String,
        weixin:String,
        github:String,
        googlePlus:String,
        facebook:String,
        twitter:String,
        avatar:String,
        gender:Number,//1为男性,0为女性
        province:String,
        city:String,
        address:String,
        website:String,
        birthday:Date,
        description:String
    },

    siteAdmin:{
        type:Boolean,
        default:false
    },
    lastOnline:{
        type:Date,
        default:Date.now
    }
},{
    versionKey:false,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt:'updatedAt'
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

module.exports=mongoose.model('User',UserSchema);
