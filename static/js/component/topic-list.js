(function(){
  "use strict";
  angular
    .module('app.component')
    .directive('topicList',topicListDirective);

  function TopicListController($scope,$attrs,$element,Topic,$parse){
    var that=this;
    var params=$parse($attrs.option)($scope);

    that.init=init;
    that.getList=getList;

    function init(){
      $scope.topics=this.getList(params);
    }

    function getList(params){
      return Topic.query(params);
    }
  }

  function topicListDirective(){
    return {
      restrict:'EA',
      templateUrl:'../templates/topic-list.html',
      replace:true,
      controller:TopicListController,
      link:function(scope,element,attrs,topicCtrl){
        topicCtrl.init();
      }
    }
  }
})();