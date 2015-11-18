var express=require('express');
var topicCtrl=require('../controllers/controllers').topicCtrl;
var topicRouter=express.Router();
var auth=require('../middlewares/auth');

//获取topic列表
topicRouter.get('/',topicCtrl.getTopicList);

//创建topic
topicRouter.post('/',auth.signinRequired,topicCtrl.createTopic);


//更新topic
topicRouter.put('/:topicId',auth.signinRequired,topicCtrl.updateTopic);

//删除topic
topicRouter.delete('/:topicId',auth.signinRequired,topicCtrl.removeTopic);

module.exports=topicRouter;