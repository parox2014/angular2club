'use strict';

const models = require('../models');
const Message = models.Message;

class MessageService {
	/**
	 * 发送消息
	 * @method send
	 * @param  {ObjectId} from   发送者
	 * @param  {ObjectId} to     接收者
	 * @param  {Object} option 其它选项
	 * @return {Promise}        [description]
	 */
	static send(from,to,option) {
		if (!Array.isArray(to)){
			to = [ to ];
		}
		let obj = {
			from:from,
			to:to
		};
		Object.assign(obj,option);
		return Message.create(obj);
	}
	/**
	 * 标记消息为已读
	 * @method markAsReaded
	 * @param  {ObjectId}     id [description]
	 * @param  {ObjectId}     sessionUser
	 * @return {Promise}        [description]
	 */
	static markAsReaded(id,sessionUser) {
		return Message.findOneAndUpdate({ _id:id,to:sessionUser },{ isReaded:true });
	}

	static removeReaded(sessionUser) {
		return Message.findAndRemove({ isReaded:true,to:sessionUser });
	}
}

module.exports = MessageService;
