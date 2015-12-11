const express = require('express');
const CommentCtrl = require('../controllers').CommentCtrl;
const commentRouter = express.Router();
const auth = require('../middlewares');

//查询评论列表
//GET /comments
commentRouter.get('/',CommentCtrl.getCommentList);

//添加评论
//POST /comments
commentRouter.post('/',auth.signinRequired,CommentCtrl.createComment);

//删除评论
//DELETE /comments/:id
commentRouter.delete('/:id',auth.signinRequired,CommentCtrl.removeComment);

//更新评论
//PUT /comments/:id
commentRouter.put('/:id',auth.signinRequired,CommentCtrl.updateComment);
module.exports = commentRouter;
