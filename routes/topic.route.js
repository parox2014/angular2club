var express=require('express');
var topicCtrl=require('../controllers/controllers').topicCtrl;
var topicRouter=express.Router();
var auth=require('../middlewares/auth');

//获取topic列表
topicRouter.get('/',topicCtrl.getTopicList);

//获取topic详情
topicRouter.get('/:topicId',topicCtrl.getTopicDetail);


//创建topic
topicRouter.post('/',auth.signinRequired,topicCtrl.createTopic);


//更新topic
topicRouter.put('/:topicId',auth.signinRequired,topicCtrl.updateTopic);

//删除topic
topicRouter.delete('/:topicId',auth.signinRequired,topicCtrl.removeTopic);

//置顶
topicRouter.put(
    '/:topicId/top',
    auth.signinRequired,
    auth.adminRequired,
    topicCtrl.toggleIsTop);

//设为精华文章
topicRouter.put(
    '/:topicId/good',
    auth.signinRequired,
    auth.adminRequired,
    topicCtrl.toggleIsGood);

//点赞
topicRouter.put(
    '/:topicId/vote',
    auth.signinRequired,
    topicCtrl.toggleVote);

module.exports=topicRouter;