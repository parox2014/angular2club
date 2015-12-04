'use strict';

const Topic = require('../services').Topic;
const EventProxy = require('eventproxy');
const config = require('../config');
const User = require('../models').User;
const _ = require('underscore');
const util = require('../util');
const mongoose = require('mongoose');
const props = [ 'title', 'content', 'type' ];

exports.createTopic = function(req, res) {

  req.checkBody('title', 'title required').notEmpty().isLength(2, 100);
  req.checkBody('content', 'content required').notEmpty().isLength(5, 500);
  req.checkBody('type', 'type required').notEmpty();

  let mapErrors = req.validationErrors(true);

  //如果存在错误，则向客户端返回错误
  if (mapErrors) {
    return res.status(403).send({
      result: false,
      msg: mapErrors
    });
  }

  let data = util.pick(req.body, props);
  let sessionUser = req.session.user;

  Topic.create(sessionUser, data)
    .then(doc=> {
      res.status(201).json(doc);
    })
    .catch(err=> {
      res.responseError(err);
    });
};

exports.getTopicList = function(req, res) {
  var query = Object.create(req.query);
  var limit = query.limit || 20;
  var skip = query.start || '0';

  delete query.limit;
  delete query.start;

  Topic.getTopicListByQuery(query, limit, skip)
    .then(docs=> {
      res.json(docs);
    })
    .catch(err=> {
      res.responseError(err);
    });
};

exports.updateTopic = function(req, res) {
  let topicId = req.params.topicId;
  let sessionUser = req.session.user;
  let update = util.pick(req.body, props);

  Topic.update(topicId, sessionUser, update)
    .then(doc=> {
      res.json(doc);
    })
    .catch(err=> {
      logger.error(err);
      res.responseError(err);
    });
};

exports.removeTopic = function(req, res) {
  let topicId = req.params.topicId;
  let sessionUser = req.session.user;

  Topic.softRemove(topicId, sessionUser)
    .then(result=> {
      res.status(204).send(result);
    })
    .catch(err=> {
      res.responseError(err);
    });
};

//获取文章详情
exports.getTopicDetail = function(req, res) {
  let topicId = req.params.topicId;

  Topic.getById(topicId)
    .then(doc=> {
      res.json(doc);
    })
    .catch(err=> {
      logger.debug(err);
      res.responseError(err);
    });
};

exports.getFavoriteTopics = function(req, res) {

  let sessionUser = req.session.user;
  Topic.getFavoriteTopicsByUserId(sessionUser)
    .then(docs=>{
      res.json(docs);
    })
    .catch(err=>{
      logger.err(err);
      res.responseError(err);
    });

};

exports.getVoteTopics = function(req, res) {
  let sessionUser = req.session.user;
  Topic.getVoteTopicsByUserId(sessionUser)
    .then(docs=>{
      res.json(docs);
    })
    .catch(err=>{
      logger.err(err);
      res.responseError(err);
    });
};

exports.toggleIsTop = function(req, res) {
  let topicId = req.params.topicId;

  Topic.toggleIsTop(topicId)
    .then(doc=>{
      res.json(doc);
    })
    .catch(err=>{
      res.responseError(err);
    });
};

exports.toggleIsGood = function(req, res) {
  let topicId = req.params.topicId;

  Topic.toggleIsGood(topicId)
    .then(doc=>{
      res.json(doc);
    })
    .catch(err=>{
      res.responseError(err);
    });
};

exports.toggleVote = function(req, res) {
  let topicId = req.params.topicId;
  let vote = Number(req.query.vote);

  Topic
    .toggleVote(topicId, req.session.user, vote)
    .then(doc=> {
      res.json(doc);
    })
    .catch(err=>{
      logger.error(err);
      res.responseError(err);
    });
};

exports.toggleFavorite = function(req, res) {
  let topicId = req.params.topicId;
  let fav = Number(req.query.fav);

  Topic
    .toggleFavorite(topicId, req.session.user, fav)
    .then(doc=> {
      res.json(doc);
    })
    .catch(err=>{
      res.responseError(err);
    });
};
