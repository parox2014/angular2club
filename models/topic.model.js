'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const TopicSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    required: true
  },
  isTop: {
    type: Boolean,
    default: false
  }, // 置顶帖
  isGood: {
    type: Boolean,
    default: false
  }, // 精华帖
  isLock: {
    type: Boolean,
    default: false
  }, // 被锁定主题
  deleted: {
    type: Boolean,
    default: false
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  lastComment: {
    type: ObjectId,
    ref: 'Comment'
  },
  lastCommentAt: {
    type: Date
  },
  //点赞的人
  voters: [ {
    type: ObjectId,
    ref: 'User'
  } ],

  //收藏的人
  favers: [ {
    type: ObjectId,
    ref: 'User'
  } ],
  meta: {
    //点赞数
    votes: {
      type: Number,
      default: 0
    },

    //收藏数
    favs: {
      type: Number,
      default: 0
    },

    //访问数
    visits: {
      type: Number,
      default: 0
    },

    //评论数
    comments: {
      type: Number,
      default: 0
    }
  }
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

TopicSchema.index({
  isTop: -1,
  lastCommentAt: -1
});
TopicSchema.index({
  creator: 1,
  createdAt: -1
});

module.exports = mongoose.model('Topic', TopicSchema);
