'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  topicId: {
    type: ObjectId,
    required: true,
  },

  //回复
  replyTo: ObjectId,

  //创建者
  creator: {
    type: ObjectId,
    required: true,
  },

  //赞成
  votes: {
    type: Number,
    default: 0,
  },
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

CommentSchema.index({
  _id: 1,
});
CommentSchema.index({
  creator: 1,
  createdAt: -1,
});
CommentSchema.index({
  votes: 1,
});

module.exports = mongoose.model('Comment', CommentSchema);
