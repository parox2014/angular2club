'use strict';

var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var MessageSchema=new Schema({
    comment:{
        type:String,
        required:true
    },
    type:{
        type:Number,//消息类型,1:回复您的贴子,2:回复评论,3:@ at您
        required:true
    },
    from:{
        type:ObjectId,
        required:true
    },
    to:{
        type:ObjectId,
        required:true
    },
    topicId:{
        type:ObjectId,
        required:true
    },
    createAt:{
        type:Date,
        default:Date.now
    },
    isReaded:{
        type:Boolean,
        default:false
    }
});

MessageSchema.index({createAt: -1});

module.exports=mongoose.model('Message',MessageSchema);