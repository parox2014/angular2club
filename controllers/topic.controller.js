'use strict';

const Topic=require('../models/models').Topic;
const EventProxy=require('eventproxy');
const config=require('../config');
const User=require('../models/models').User;
const _=require('underscore');
const mongoose=require('mongoose');

exports.createTopic=function(req,res){

    req.checkBody('title','title required').notEmpty().isLength(2,100);
    req.checkBody('content','content required').notEmpty().isLength(5,500);

    let mapErrors=req.validationErrors(true);

    //如果存在错误，则向客户端返回错误
    if(mapErrors){
        res.set('X-Error','REGISTER_ERROR');
        return res.status(403).send({
            result:false,
            msg:mapErrors
        });
    }

    let topic=new Topic(req.body);

    topic.set('createdBy',req.session.user);

    topic.save(function(err,doc){
        if(err){
            res.status(500).send({msg:err});
        }else{
            //贴子发成功后，用户加分
            let query=User.update({
                    $inc:{
                        score:config.score.TOPIC,
                        postCount:1
                    }
                });

            query.where('_id').equals(req.session.user);

            query.exec(function(err){
                if(err){
                    res.status(500).send({msg:err});
                }else{
                    res.json(doc);
                }
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
        .exec(function(err,topics){
            if(err){
                return res.status(500).send({msg:err});
            }

            if(!topics){
                return res.send([]);
            }

            let userids=_.pluck(topics,'createdBy');

            User
                .find()
                .where('_id')
                .in(userids)
                .select({_id:1,nickName:1,avatar:1})
                .exec(function(err,users){
                    if(err){
                        return res.status(500).send({msg:err});
                    }
                    let objectTopics=[];

                    topics.forEach(function(topic){
                        let createdBy=topic.createdBy.toString();
                        let user=_.find(users,function(user){
                            return user._id.toString()===createdBy;
                        });
                        let objectTopic=topic.toObject();

                        objectTopic.user=user;
                        objectTopics.push(objectTopic);
                    });

                    res.json(objectTopics);
                });

        });
};

exports.updateTopic=function(req,res){
    let topicId=req.params.topicId;
    let sessionUser=req.session.user;

    let update=Object.assign({
        updateAt:Date.now()
    },req.body);

    delete update.meta;
    delete update.isTop;
    delete update.isGood;
    delete update.isLock;
    delete update.deleted;
    delete update.createdBy;

    Topic.findById(topicId,function(err,topic){
        if(err){
            return res.status(500).send({msg:err});
        }

        if(!topic.isAuthor(sessionUser)){
            return res.status(403).send({msg:'you are not the topic\'s author'});
        }

        topic.set(update);

        topic.save(function(err,doc){
            res.json(doc);
        });
    });
};

exports.removeTopic=function(req,res){
    let topicId=req.params.topicId;
    let sessionUser=req.session.user;

    Topic.findOneAndUpdate({deleted:true})
        .where({_id:topicId,createdBy:sessionUser,deleted:false})
        .exec(function(err,doc){

            if(err){
                return res.status(500).send({msg:err});
            }

            if(doc){
                res.send({
                    result:true
                });
            }else{
                res.status(404).send({msg:'Topic not found or topic is already removed erlier'});
            }
        });
};