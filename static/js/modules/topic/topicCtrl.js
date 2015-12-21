(function(ng){
  "use strict";
  ng.module('app.topic',['app.core'])
    .controller('TopicController',function($scope,$stateParams){
      $scope.vm=$stateParams;
    });
})(window.angular);