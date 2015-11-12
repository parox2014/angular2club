'use strict';

var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var CommentSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    topicId:{
        type:ObjectId,
        required:true
    },
    replyTo:ObjectId,
    createdBy:{
        type:ObjectId,
        required:true
    },
    createAt:{
        type:Date,
        default:Date.now
    },
    updateAt:{
        type:Date,
        default:Date.now
    },
    vote:{
        type:Number,
        default:0
    },
    comments:[ObjectId]
});

CommentSchema.index({_id: 1});
CommentSchema.index({createdBy: 1, createAt: -1});
CommentSchema.index({vote: 1});

module.exports=mongoose.model('Comment',CommentSchema);