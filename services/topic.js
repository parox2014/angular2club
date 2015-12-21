'use strict';

const models = require('../models');
const EventProxy = require('eventproxy');
const config = require('../config');

const _ = require('underscore');
const util = require('../util');

const Topic = models.Topic;
const User = models.User;

const modiferMap = {
  '-1':'$pull',
  1:'$addToSet'
};

class TopicService{

  /**
   * 创建文章
   * @method createTopic
   * @param  {ObjectId}    userId   当前用户Id
   * @param  {Object}    model    文章数据
   * @param  {Function}  [callback]
   * @return {Promise}
   */
  static create(userId, model, callback) {
    let topic = new Topic(model);

    callback = _.isFunction(callback) ? callback : noop;
    topic.set('creator', userId);

    return new Promise(function(resolve, reject) {

      topic.save(function(err, doc) {
        if (err) {
          callback(err);
          reject(err);
          return;
        }

        User
          .update({
            $inc: {
              'meta.score': config.score.TOPIC,
              'meta.topicCount': 1
            }
          })
          .where('_id').equals(userId)
          .exec(function(err) {
            if (err) {
              callback(err);
              reject(err);
              return;
            }

            callback(null, doc);
            resolve(doc);
          });
      });
    });
  }

  /**
   * 获取文章列表
   * @method getTopicListByQuery
   * @param  {Object}            query    [查询条件]
   * @param  {Number}            limit    [条数]
   * @param  {Number}            skip     [跳过的条数]
   * @param  {Function}          [callback] [description]
   * @return {Promise}                     [description]
   */
  static getTopicListByQuery(query, limit, skip, callback) {

    callback = callback || noop;

    if(query.type){
      query.type=Number(query.type);
    }

    if(query.type===0){
      delete query.type;
    }

    query.isGood=query.isGood==='true';

    query.deleted = false;

    return new Promise(function(resolve, reject) {
      return Topic
        .find()
        .where(query)
        .limit(limit)
        .skip(skip)
        .sort('lastCommentAt')
        .populate('creator', 'profile.nickName profile.avatar')
        .select('title type createdAt updatedAt creator meta favers')
        .exec((err,docs)=>{
          if (err) {
            callback(err);
            reject(err);
            return;
          }

          callback(null, docs);
          resolve(docs);
        });
    });
  }
  /**
   * 更新文章
   * @method update
   * @param  {ObjectId}   topicId     [description]
   * @param  {ObjectId}   sessionUser [description]
   * @param  {Object}   update      [description]
   * @param  {Function} callback    [description]
   * @return {Promise}               [description]
   */
  static update(topicId, sessionUser, update, callback) {

    callback = callback || noop;

    return new Promise(function(resolve, reject) {
      Topic.findOneAndUpdate({ _id:topicId, creator:sessionUser }, update)
        .exec((err, doc)=> {
          if (err) {
            err.code = 500;
            err.result = false;
          }else if (!doc) {
            err = {
              code:404,
              result:false,
              msg:'topic not found or current user is not this topic\'s author'
            };
          }

          if (err) {
            callback(err);
            reject(err);
            return;
          }

          doc.set(update);
          callback(null, doc);
          resolve(doc);
        });
    });
  }

  /**
   * 软删除
   * @method softRemove
   * @param  {[type]}   topicId     [description]
   * @param  {[type]}   sessionUser [description]
   * @param  {Function} callback    [description]
   * @return {[type]}               [description]
   */
  static softRemove(topicId, sessionUser, callback) {
    callback = _.isFunction(callback) ? callback : noop;

    return new Promise((resolve, reject)=> {
      Topic.findOneAndUpdate({
          deleted: true
        })
        .where({
          _id: topicId,
          creator: sessionUser,
          deleted: false
        })
        .exec(function(err, doc) {

          if (err) {
            err.code = 500;
            err.msg = err;
            err.result = false;
          }else if (!doc) {
            err = {
              code:404,
              result:false,
              msg:'Topic not found or topic is already removed'
            };
          }

          if (err) {
            reject(err);
            callback(err);
            return;
          }

          let goodScore = doc.isGood ? config.score.GOOD : 0;

          //当删除一篇文章，该用户的分数减去该文章所得分数，发贴数减一
          User
            .update({
              $inc: {
                'meta.score': -(config.score.TOPIC + goodScore),
                'meta.topicCount': -1
              }
            })
            .where('_id').equals(sessionUser)
            .exec(function(err, result) {
              if (err) {
                reject(err);
                callback(err);
                return;
              }

              resolve(result);
              callback(err, result);
            });
        });
    });
  }

  /**
   * 获取文章详情
   * @method getById
   * @param  {[type]}   topicId  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  static getById(topicId, callback) {
    callback = _.isFunction(callback) ? callback : noop;

    return new Promise(function(resolve, reject) {
      Topic
        .findOneAndUpdate({ _id:topicId, deleted:false }, {
          $inc: {
            'meta.visits': 1
          }
        })
        .populate('creator', 'nickName profile')
        .exec(function(err, topic) {
          if (err) {
            err.code = 500;
            err.result = false;
            err.msg = err;
          }else if (!topic) {
            err = {
              code:404,
              result:false,
              msg:'topic not found'
            };
          }

          if (err) {
            callback(err);
            reject(err);
            return;
          }

          topic.set('meta.visits', topic.get('meta.visits') + 1);
          callback(err, topic);
          resolve(topic);
        });
    });
  }

  /**
   * 查询用户收藏的文章
   * @method getFavoriteTopicsByUserId
   * @param  {ObjectId}                  sessionUser [description]
   * @param  {Function}                callback    [description]
   * @return {[type]}                              [description]
   */
  static getFavoriteTopicsByUserId(sessionUser,callback) {
    return this.getTopicListByQuery({
        favers: sessionUser
      },20,0,callback);
  }

  /**
   * 查询用户点赞的文章
   * @method getVoteTopicsByUserId
   * @param  {ObjectId}              sessionUser [description]
   * @param  {Function}            callback    [description]
   * @return {Promise}                          [description]
   */
  static getVoteTopicsByUserId(sessionUser,callback) {
    return this.getTopicListByQuery({
        favers: sessionUser
      },20,0);
  }

  /**
   * 点赞或取消赞
   * @method toggleVote
   * @param  {ObjectId}   topicId     [description]
   * @param  {ObjectId}   sessionUser [description]
   * @param  {Number}   vote        [description]
   * @return {Promise}               [description]
   */
  static toggleVote(topicId, sessionUser, vote,callback) {

    let modifer = modiferMap[vote];
    let update = {};

    update[modifer] = {
      voters: sessionUser
    };

    callback = _.isFunction(callback)?callback:noop;
    return new Promise((resolve, reject) => {

      Topic.update(update)
        .where({ _id:topicId })
        .exec((err,result) => {
          if (err){
            err.code = 500;
          }else if (!result.nModified === 0){
            err = {
              code:404,
              msg:'topic not found'
            };
          }

          if (err){
            callback(err);
            reject(err);
          }

          Topic.findById(topicId)
            .exec((err,doc)=>{
              doc.set('meta.votes',doc.voters.length);
              doc.save((e,topic)=>{
                resolve(topic);
                callback(e,topic);
              });
            });

        });
    });
  }

  /**
   * 收藏或取消收藏
   * @method toggleFavorite
   * @param  {ObjectId}       topicId     [description]
   * @param  {ObjectId}       sessionUser [description]
   * @param  {Number}       fav         [description]
   * @return {Promise}                   [description]
   */
  static toggleFavorite(topicId,sessionUser,fav) {
    let modifer = modiferMap[fav];
    let update = {};

    update[modifer] = {
      favers: sessionUser
    };

    return new Promise((resolve, reject) => {
      Topic
        .update(update)
        .where({
          _id: topicId
        })
        .exec((err) => {
          if (err) {
            return reject(err);
          }

          Topic.findById(topicId, (err, topic)=> {
            if (err) {
              return reject(err);
            }

            topic.set('meta.favs', topic.favers.length);

            topic.save((err, doc) => {
              if (err) {
                return reject(err);
              }

              resolve(doc);
            });
          });
        });
    });
  }
  /**
   * 切换文章某个字段的Boolean值
   * @method _toggleProp
   * @param  {[type]}    topicId [description]
   * @param  {[type]}    prop    [description]
   * @return {[type]}            [description]
   */
  static _toggleProp(topicId,prop) {
    return new Promise(function(resolve, reject) {
      Topic.findById(topicId, function(err, topic) {
        logger.debug(topic);
        if (err){
          return reject(err);
        }else if (!topic){
          return reject({
            code:404,
            msg:'topic not found'
          });
        }

        topic.set(prop,!topic.get(prop));

        topic.save(function(err, doc) {
          logger.warn(err);
          if (err){
            return reject(err);
          }

          resolve(doc);
        });
      });
    });
  }

  /**
   * 文章加精或取消，文章作者相应加分或减分
   * @method toggleIsGood
   * @param  {ObjectId}     topicId [description]
   * @return {Promise}             [description]
   */
  static toggleIsGood(topicId) {
    return new Promise((resolve, reject)=> {
      this._toggleProp(topicId,'isGood')
        .then(doc=>{
          let author = doc.get('creator');
          let isGood = doc.get('isGood');
          let score = config.score.GOOD;
          let modifer = {
            $inc:{
              'meta.score':isGood?score:-score,
              'meta.goodTopicCount':isGood?1:-1
            }
          };
          User.update(modifer)
            .where({ _id:author })
            .exec((err,result)=>{
              if (err){
                return reject(err);
              }
              doc.result = result;
              resolve(doc);
            });
        })
        .catch(err=>{
          reject(err);
        });
    });

  }
  /**
   * 文章置顶
   * @method toggleIsTop
   * @param  {[type]}    topicId [description]
   * @return {[type]}            [description]
   */
  static toggleIsTop(topicId) {
    return this._toggleProp(topicId,'isTop');
  }
}

module.exports = TopicService;
