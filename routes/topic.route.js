'use strict';

const express = require('express');
const topicCtrl = require('../controllers').topicCtrl;
const topicRouter = express.Router();
const auth = require('../middlewares');

//获取topic列表
topicRouter.get('/', topicCtrl.getTopicList);

//获取topic详情
topicRouter.get('/:topicId', topicCtrl.getTopicDetail);

//创建topic
topicRouter.post('/', auth.signinRequired, topicCtrl.createTopic);

//更新topic
topicRouter.put('/:topicId', auth.signinRequired, topicCtrl.updateTopic);

//删除topic
topicRouter.delete('/:topicId', auth.signinRequired, topicCtrl.removeTopic);

//置顶
//PUT /topics/:id/top
topicRouter.put(
  '/:topicId/top',
  auth.signinRequired,
  auth.adminRequired,
  topicCtrl.toggleIsTop
);

//设为精华文章
////PUT /topics/:id/good
topicRouter.put(
  '/:topicId/good',
  auth.signinRequired,
  auth.adminRequired,
  topicCtrl.toggleIsGood
);

//点赞
//PUT /topics/:id/vote
topicRouter.put(
  '/:topicId/vote',
  auth.signinRequired,
  topicCtrl.toggleVote
);

//收藏
topicRouter.put(
  '/:topicId/fav',
  auth.signinRequired,
  topicCtrl.toggleFavorite
);

//获取收藏的topic
topicRouter.get(
  '/favs/:id',
  auth.signinRequired,
  topicCtrl.getFavoriteTopics
);

//获取点赞的topic
topicRouter.get(
  '/votes/:id',
  auth.signinRequired,
  topicCtrl.getVoteTopics
);

module.exports = topicRouter;
