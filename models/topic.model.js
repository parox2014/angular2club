'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const TopicSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    isTop: { type: Boolean, default: false }, // 置顶帖
    isGood: { type: Boolean, default: false }, // 精华帖
    isLock: { type: Boolean, default: false }, // 被锁定主题
    deleted: { type: Boolean, default: false },
    creator: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    lastComment: { type: ObjectId, ref: 'Comment' },
    lastCommentAt: { type: Date },
    voters: [{ type: ObjectId, ref: 'User' }],//点赞的人
    favers: [{ type: ObjectId, ref: 'User' }],//收藏的人
    comments:[],
    meta: {
        //点赞数
        votes: {
            type: Number,
            default: 0
        },
        //收藏数
        favs: {
            type: Number,
            default: 0
        },
        //访问数
        visits: {
            type: Number,
            default: 0
        },
        //评论数
        comments: {
            type: Number,
            default: 0
        }
    }
}, {
        versionKey: false,
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

TopicSchema.index({ createAt: -1 });
TopicSchema.index({ isTop: -1, lastCommentAt: -1 });
TopicSchema.index({ createdBy: 1, createAt: -1 });


TopicSchema.methods.isAuthor = function (userId) {
    return this.creator.toString() === userId;
};

TopicSchema.statics.toggleIsTop = function (topicId, callback) {
    this.findById(topicId, function (err, topic) {
        if (err) {
            return callback(err, null)
        }

        topic.isTop = !topic.isTop;

        topic.save(function (err, doc) {
            if (err) {
                return callback(err, null)
            }

            callback(null, doc);
        });
    });
};

TopicSchema.statics.toggleIsGood = function (topicId, callback) {
    this.findById(topicId, function (err, topic) {
        if (err) {
            return callback(err, null)
        }

        topic.isGood = !topic.isGood;

        topic.save(function (err, doc) {
            if (err) {
                return callback(err, null)
            }

            callback(null, doc);
        });
    });
};

TopicSchema.statics.toggleVote = function (topicId,voteUser,vote) {
    let modifer=vote===1?'$addToSet':'$pull';
    let update={};

    update[modifer]={
        voters:voteUser
    };
    return new Promise((resolve,reject) =>{
        this
            .update(update)
            .where({_id:topicId})
            .exec((err)=>{
                if(err){
                    return reject(err);
                }

                this.findById(topicId,function(err,topic){
                    if(err){
                        return reject(err);
                    }

                    topic.set('meta.votes',topic.voters.length);

                    topic.save((err,doc)=>{
                        if(err){
                            return reject(err);
                        }
                        resolve(doc);
                    });
                });
            });
    });
};

TopicSchema.statics.toggleFavorite=function (topicId,favUser,fav) {
    let modifer=fav===1?'$addToSet':'$pull';
    let update={};

    update[modifer]={
        favers:favUser
    };

    return new Promise((resolve,reject) =>{
        this
            .update(update)
            .where({_id:topicId})
            .exec((err)=>{
                if(err){
                    return reject(err);
                }

                this.findById(topicId,function(err,topic){
                    if(err){
                        return reject(err);
                    }

                    topic.set('meta.favs',topic.favers.length);

                    topic.save((err,doc)=>{
                        if(err){
                            return reject(err);
                        }
                        resolve(doc);
                    });
                });
            });
    });
};

TopicSchema.statics.getMyFavorites=function (sessionUser) {

    return new Promise((resolve,reject) =>{
        this.find({favers:sessionUser})
            .exec(function(err,doc){
                if(err){
                    return reject(err);
                }

                resolve(doc);
            });
    });
};
module.exports = mongoose.model('Topic', TopicSchema);
