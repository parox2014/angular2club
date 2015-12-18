(function(){
  "use strict";
  angular
    .module('app.services')
    .factory('Topic',function($resource,api){
      var Topic=$resource(api.topic.BASE);

      return Topic;
    });
})();