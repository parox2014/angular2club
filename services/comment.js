'use strict';

const models = require('../models');
const Comment = models.Comment;
const User = models.User;
const Topic = models.Topic;
const Message = require('./message');
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

			let topicId = comment.get('topicId');
			let replyTo = comment.get('replyTo');
			let mentions = comment.get('mentions');
			//1.添加评论
			//2.评论创建者加分
			//3.TODO 给文章创建者发送消息
			//4.TODO 如果存在回复的人，则给此人发通知
			//5.TODO 如果存在@的人，则给@的人发通知

			Topic.findById(topicId)
				.exec((err,doc)=>{
					if (err){
						logger.error(err);
						return reject(err);
					};

					if (!doc){
						return reject({
							code:404,
							msg:'主题未找到或已经删除',
							data:comment
						});
					}
					/**/
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

					//发送消息给文章创建者
					Message.send(user,doc.creator,{
						type:config.messageType.REPLY_TOPIC,
						topicId:topicId
					})
					.then(doc=>{
						logger.info('send message to topic creator success',doc);
					})
					.catch(err=>{
						logger.error(err);
					});

					//发送消息给回复的人
					if (replyTo){
						Message.send(user,replyTo,{
							type:config.messageType.REPLY_COMMENT,
							topicId
						})
						.then(doc=>{
							logger.info('send message to replyTo success',doc);
						})
						.catch(err=>{
							logger.error(err);
						});
					}

					//发送消息给提及的人
					if (Array.isArray(mentions)&&mentions.length>0){
						Message.send(user,mentions,{
							type:config.messageType.AT,
							topicId:topicId
						})
						.then(doc=>{
							logger.info('send message to mentions success',doc);
						})
						.catch(err=>{
							logger.error(err);
						});
					}
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

	static removeById(commentId) {
		return new Promise(function(resolve, reject) {
			Comment.findById(commentId)
				.exec((err,doc)=>{
					if (err){
						return reject(err);
					}else if (!doc){
						return reject(new Error({
							code:404,
							msg:'comment not found'
						}));
					}

					let p1 = doc.remove();
					let p2 = User.update({
						$inc:{
							'meta.score':-config.score.COMMENT,
							'meta.commentCount':-1
						}
					})
					.where('_id')
					.equals(user)
					.exec();

					Promise.all([ p1,p2 ])
						.then(args=>{
							resolve(args);
						})
						.catch(err=>{
							reject(err);
						});
				});
		});
	}
}

module.exports = CommentService;
