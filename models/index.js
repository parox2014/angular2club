'use strict';
const mongoose = require('mongoose');
const config = require('../config');

mongoose.connect(config.DATABASE, {
  poolSize: 20,
}, function(err) {
  if (!err) {
    logger.info('database connect success');
  } else {
    logger.error(err.message);
  }
});

exports.User = require('./user.model');
exports.Topic = require('./topic.model');
exports.Comment = require('./comment.model');
exports.Message = require('./message.model');
