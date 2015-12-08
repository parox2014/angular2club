'use strict';

const models = require('../models');
const Comment = models.Comment;
const User = models.User;

const config = require('../config');
class CommentService {
	/**
	 * 创建评论
	 * @method create
	 * @param  {[type]} user  [description]
	 * @param  {[type]} model [description]
	 * @return {[type]}       [description]
	 */
	static create(user,model) {
		let comment = new Comment(model);
		comment.set('creator',user);
		return new Promise(function(resolve, reject) {
			let p1 = comment.save();
			let p2 = User.update({
				$inc:{
					'meta.score':config.score.COMMENT,
					'meta.commentCount':1
				}
			})
			.where('_id')
			.equals(user)
			.exec();

			Promise.all([ p1,p2 ])
				.then(args=>{
					resolve(args[0]);
				})
				.catch(err=>{
					reject(err);
				});
		});
	}

	static getCommentList(query) {
		return Comment.find(query)
			.populate('creator','profile')
			.exec();
	}

	static update(commentId,creator,update) {
		return Comment.findByIdAndUpdate(commentId,update).exec();
	}

	static getById(commentId) {
		return Comment.findByid(commentId);
	}

	static remove(commentId) {
		return Comment.findByIdAndRemove(commentId).exec();
	}
}

module.exports = CommentService;
