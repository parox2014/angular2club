'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var MessageSchema = new Schema({
  //消息类型
  type: {
    type: Number, //消息类型,1:回复您的贴子,2:回复评论,3:@ at您
    required: true
  },

  //消息发送者
  from: {
    type: ObjectId,
    required: true
  },

  //消息接收者
  to: [ {
    type: ObjectId,
    required: true,
    ref:'User'
  } ],

  //贴子ID
  topicId: {
    type: ObjectId,
    required: true,
    ref: 'Topic'
  },
  //是否已读
  isReaded: {
    type: Boolean,
    default: false
  }
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

MessageSchema.index({
  createAt: -1
});

module.exports = mongoose.model('Message', MessageSchema);
