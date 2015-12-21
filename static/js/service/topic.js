(function(){
  "use strict";
  angular
    .module('app.services')
    .factory('Topic',function($resource,api,$http,$q){
      var Topic=$resource(api.topic.BASE+'/:id',{
        id:'@_id'
      });


      Topic.prototype.toggleGood=toggleGood;
      Topic.prototype.toggleVote=toggleVote;

      return Topic;

      function toggleGood(){
        this.isGood=!this.isGood;
      }

      function toggleVote(cuid){
        var deffered=$q.defer();
        var uri=(api.topic.BASE+api.topic.VOTE).replace(':id',this._id);
        var vote=this.voters.indexOf(cuid)>-1?-1:1;
        var self=this;
        uri+='?vote='+vote;

        $http.put(uri)
            .then(function(resp){
              angular.extend(self,resp.data);
              deffered.resolve(resp);
            },function(err){
              deffered.reject(err);
            });

        return deffered.promise;
      }
    });
})();