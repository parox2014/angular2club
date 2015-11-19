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
    creator:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    lastComment: { type: ObjectId,ref:'Comment' },
    lastCommentAt: { type: Date },
    voters:[{type:ObjectId,ref:'User'}],//点赞的人
    favers:[{type:ObjectId,ref:'User'}],//收藏的人
    meta:{
        //点赞数
        votes:{
            type:Number,
            default:0
        },
        //收藏数
        favs:{
            type:Number,
            default:0
        },
        //访问数
        visits:{
            type:Number,
            default:0
        },
        //评论数
        comments:{
            type:Number,
            default:0
        }
    }
},{
    versionKey:false,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt:'updatedAt'
    }
});

TopicSchema.index({createAt: -1});
TopicSchema.index({isTop: -1, lastCommentAt: -1});
TopicSchema.index({createdBy: 1, createAt: -1});


TopicSchema.methods.isAuthor=function (userId) {
    return this.creator.toString()===userId;
};

TopicSchema.statics.toggleIsTop=function(topicId,callback){
    this.findById(topicId,function(err,topic){
        if(err){
            return callback(err,null)
        }

        topic.isTop=!topic.isTop;

        topic.save(function(err,doc){
            if(err){
                return callback(err,null)
            }

            callback(null,doc);
        });
    });
};

TopicSchema.statics.toggleIsGood=function(topicId,callback){
    this.findById(topicId,function(err,topic){
        if(err){
            return callback(err,null)
        }

        topic.isGood=!topic.isGood;

        topic.save(function(err,doc){
            if(err){
                return callback(err,null)
            }

            callback(null,doc);
        });
    });
};

module.exports=mongoose.model('Topic',TopicSchema);