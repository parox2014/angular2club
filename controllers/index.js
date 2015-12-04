'use strict';

var User = require('../models').User;
var Topic = require('../models').Topic;
var EventProxy = require('eventproxy');
var config = require('../config');

class MainController {
  static getSessionUserAndAllTopics(req, res) {
    var evtProxy = new EventProxy();
    var findSessionUser = 'findSessionUserSuccess';
    var findTopics = 'findTopicsSuccess';

    evtProxy.all([ findSessionUser, findTopics ], function(user, topics) {
      res.render('index', {
        title: config.SITE_NAME,
        user: user,
        topics: topics || []
      });
    });

    if (req.session.user) {
      User.findOne({
        _id: req.session.user
      }, function(err, user) {
        evtProxy.emit(findSessionUser, user);
      });

      Topic.find()
        .where('creator').equals(req.session.user)
        .exec(function(err, topics) {
          evtProxy.emit(findTopics, topics);
        });

    } else {
      res.render('index', {
        title: config.SITE_NAME,
        user: null,
        topics: []
      });
    }
  }
}

module.exports = {
  MainCtrl: MainController,
  SignCtrl: require('./sign.controller'),
  topicCtrl: require('./topic.controller'),
  userCtrl: require('./user.controller')
};
