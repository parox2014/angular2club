'use strict';

var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var TopicSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    type:{
        type:Number,
        required:true
    },
    isTop: { type: Boolean, default: false }, // 置顶帖
    isGood: {type: Boolean, default: false}, // 精华帖
    isLock: {type: Boolean, default: false}, // 被锁定主题
    deleted:{type:Boolean,default:false},
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
    lastComment: { type: ObjectId },
    lastCommentAt: { type: Date, default: Date.now },
    meta:{
        votes:{
            type:Number,
            default:0
        },
        favs:{
            type:Number,
            default:0
        },
        visits:{
            type:Number,
            default:0
        },
        comments:{
            type:Number,
            default:0
        }
    }
});

TopicSchema.index({createAt: -1});
TopicSchema.index({isTop: -1, lastCommentAt: -1});
TopicSchema.index({createdBy: 1, createAt: -1});

module.exports=mongoose.model('Topic',TopicSchema);