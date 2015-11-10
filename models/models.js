var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var UserSchema=new Schema({
    id:{
        type:ObjectId,
        required:true
    },
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
    gender:String,//male为男性,female为女性
    address:String
});

module.exports=mongoose.model('User',UserSchema);