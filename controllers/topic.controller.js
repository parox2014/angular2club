'use strict';

const Topic=require('../models/models').Topic;
const EventProxy=require('eventproxy');
const config=require('../config');
const User=require('../models/models').User;
const _=require('underscore');
const util=require('../util/util');
const mongoose=require('mongoose');
const props=['title','content','type'];

exports.createTopic=function(req,res){

    req.checkBody('title','title required').notEmpty().isLength(2,100);
    req.checkBody('content','content required').notEmpty().isLength(5,500);
    req.checkBody('type','type required').notEmpty();

    let mapErrors=req.validationErrors(true);
    //如果存在错误，则向客户端返回错误
    if(mapErrors){
        res.set('X-Error','REGISTER_ERROR');
        return res.status(403).send({
            result:false,
            msg:mapErrors
        });
    }

    let topic=new Topic(util.pick(req.body,props));
    let sessionUser=req.session.user;

    topic.set('creator',sessionUser);

    topic.save(function(err,doc){
        if(err){
            res.status(500).send({msg:err});
        }else{
            //贴子发成功后，用户加分
            User
                .update({
                    $inc:{
                        'meta.score':config.score.TOPIC,
                        'meta.topicCount':1
                    },
                    $push:{
                        topics:doc._id
                    }
                })
                .where('_id').equals(sessionUser)
                .exec(function(err){
                    if(err){
                        return res.status(500).send({msg:err});
                    }

                    res.json(doc);
                });
        }
    });
};

exports.getTopicList=function(req,res){
    var query=req.query;
    var limit=query.limit||20;
    var skip=query.start||'0';

    var cond=Object.assign({deleted:false},query);

    delete cond.limit;
    delete cond.start;

    Topic
        .find()
        .where(cond)
        .limit(limit)
        .skip(skip)
        .populate('creator','nickName profile.avatar')
        .select('title type createdAt creator meta')
        .exec(function(err,topics){
            if(err){
                return res.status(500).send({msg:err});
            }

            if(!topics){
                return res.send([]);
            }

            res.json(topics);
        });
};

exports.updateTopic=function(req,res){
    let topicId=req.params.topicId;
    let sessionUser=req.session.user;
    let update=util.pick(req.body,props);


    Topic.findById(topicId,function(err,topic){
        if(err){
            return res.status(500).send({msg:err});
        }

        if(!topic){
            return res.status(404).send({msg:'topic not found'});
        }

        if(!topic.isAuthor(sessionUser)){
            return res.status(403).send({msg:'you are not the topic\'s author'});
        }

        topic.set(update);

        topic.save(function(err,doc){
            if(err){
                return res.status(500).send({msg:err});
            }
            res.json(doc);
        });
    });
};

exports.removeTopic=function(req,res){
    let topicId=req.params.topicId;
    let sessionUser=req.session.user;

    Topic.findOneAndUpdate({deleted:true})
        .where({_id:topicId,creator:sessionUser,deleted:false})
        .exec(function(err,doc){

            if(err){
                return res.status(500).send({msg:err});
            }

            if(!doc){

                return res.status(404).send({msg:'Topic not found or topic is already removed'});
            }

            let goodScore=doc.isGood?confog.score.GOOD:0;

            //当删除一篇文章，该用户的分数减去该文章所得分数，发贴数减一
            User
                .update({
                    $inc:{
                        'meta.score':-(config.score.TOPIC+goodScore),
                        'meta.topicCount':-1
                    },
                    $pull:{
                        topics:doc._id
                    }
                })
                .where('_id').equals(sessionUser)
                .exec(function(err){
                    if(err){
                        return res.status(500).send({msg:err});
                    }
                });


            res.send({
                result:true
            });
        });
};

//获取文章详情
exports.getTopicDetail=function(req,res){
    let topicId=req.params.topicId;

    Topic
        .findByIdAndUpdate(topicId,{
            $inc:{
                'meta.visits':1
            }
        })
        .populate('creator','nickName _id profile')
        .exec(function(err,topic){
            if(err){
                return res.status(500).send({msg:err});
            }

            res.json(topic);
        });
};

exports.toggleIsTop=function(req,res){
    let topicId=req.params.topicId;

    Topic.toggleIsTop(topicId,function(err,topic){
        if(err){
            return res.status(500).send({msg:err});
        }

        res.json(topic);
    });
};

exports.toggleIsGood=function(req,res){
    let topicId=req.params.topicId;

    Topic.toggleIsGood(topicId,function(err,topic){
        if(err){
            return res.status(500).send({msg:err});
        }

        res.json(topic);
    });
};

exports.toggleVote=function(req,res){
    let topicId=req.params.topicId;
    let vote=Number(req.query.vote);
    let modifer=vote===1?'$addToSet':'$pull';
    let update={};

    update[modifer]={
        voters:req.session.user
    };


    Topic
        .update(update)
        .where({_id:topicId})
        .exec(function(err){
            if(err){
                return res.status(500).send({msg:err});
            }

            Topic.findById(topicId,function(err,topic){

                topic.set('meta.votes',topic.voters.length);

                topic.save(function(err,doc){
                    res.json(doc);
                });
            });
        });
};