const express = require('express');
const CommentCtrl = require('../controllers').CommentCtrl;
const commentRouter = express.Router();
const auth = require('../middlewares');

//查询评论列表
//GET /comments
commentRouter.get('/',CommentCtrl.getCommentList);

//添加评论
//POST /commets
commentRouter.post('/',auth.signinRequired,CommentCtrl.createComment);

module.exports = commentRouter;
