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
			//3. 给文章创建者发送消息
			//4. 如果存在回复的人，则给此人发通知
			//5. 如果存在@的人，则给@的人发通知

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

					//更新主题的最后评论及最后评论时间，并增加评论数
					Topic.update({
						$set:{
							lastComment:comment.get('_id'),
							lastCommentAt:Date.now()
						},
						$inc:{
							'meta.comments':1
						}
					})
					.where('_id')
					.equals(topicId)
					.exec((err,result)=>{
						if (err){
							return logger.error(err);
						}
						logger.info(result);
					});

					let promises = [];
					//发送消息给文章创建者
					let p3 = Message.send(user,doc.creator,{
						type:config.messageType.REPLY_TOPIC,
						topicId:topicId
					});

					promises.push(p3);

					//发送消息给回复的人
					if (replyTo){
						let p4 = Message.send(user,replyTo,{
							type:config.messageType.REPLY_COMMENT,
							topicId
						});
						promises.push(p4);
					}

					//发送消息给提及的人
					if (Array.isArray(mentions)&&mentions.length>0){
						let p5 = Message.send(user,mentions,{
							type:config.messageType.AT,
							topicId:topicId
						});
						promises.push(p5);
					}

					Promise.all(promises)
						.then(results=>{
							logger.info('send message success');
						})
						.catch(err=>{
							logger.error(err);
						});
				});
		});
	}

	static getCommentList(query) {
		return Comment.find(query)
			.populate('creator','profile')
			.exec();
	}

	static update(commentId,creator,update) {

		return new Promise(function(resolve, reject) {
			Comment
				.findOneAndUpdate(
					{ _id:commentId,creator:creator },
					update
				).exec((err,doc)=>{
					if (err){
						return reject(err);
					}

					if (!doc){
						return reject({
							code:404,
							msg:'comment not found or you are not the author of this comment'
						});
					}

					doc.set(update);
					resolve(doc);

					let mentions = doc.get('mentions');

					if (Array.isArray(mentions)&&mentions.length>0){
						Message.send(creator,mentions,{
							type:config.messageType.AT,
							topicId:doc.get('topicId')
						})
						.then(msg=>{
							logger.info('send message to mentions success',msg);
						})
						.catch(err=>{
							logger.error(err);
						});
					}
				});
		});
		return;
	}

	static removeById(commentId,creator) {

		return new Promise(function(resolve, reject) {
			Comment.findOne({ _id:commentId,creator:creator })
				.exec((err,doc)=>{
					if (err){
						return reject(err);
					}else if (!doc){
						return reject({
							code:404,
							msg:'comment not found or you are not the author of this comment'
						});
					}
					let topicId = doc.get('topicId');
					let p1 = doc.remove();
					let p2 = User.update({
						$inc:{
							'meta.score':-config.score.COMMENT,
							'meta.commentCount':-1
						}
					})
					.where('_id')
					.equals(creator)
					.exec();

					let p3 = Topic.update({
						$inc:{
							'meta.comments':-1
						}
					})
					.where('_id')
					.equals(topicId)
					.exec();

					Promise.all([ p1,p2,p3 ])
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
