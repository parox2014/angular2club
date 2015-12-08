'use strict';

const Comment = require('../services').Comment;

class CommentController {

	static createComment(req,res) {

		req.checkBody('content','评论内容不能为空').notEmpty();
		req.checkBody('topicId','评论的主题不能为空').notEmpty();

		let mapErrors = req.validationErrors(true);

	  //如果存在错误，则向客户端返回错误
	  if (mapErrors) {
	    return res.responseError({
				code:403,
	      msg: mapErrors
	    });
	  }

		let user = req.session.user;

		Comment.create(user,req.body)
			.then(result=>{
				res.json(result);
			})
			.catch(err=>{
				res.responseError(err);
			});
	}

	static getCommentList(req,res) {
		let query = req.query||{};
		Comment.getCommentList(query)
			.then(docs=>{
				res.json(docs);
			})
			.catch(err=>{
				res.responseError(err);
			});
	}
	static updateComment(req,res) {
		Comment.update();
	}
}
module.exports = CommentController;
