'use strict';

const Topic=require('../models/models').Topic;
const EventProxy=require('eventproxy');
const config=require('../config');


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
            res.json(doc);
        }
    });
};