(function () {
    angular.module('app.routes',['app.topic'])
    .config(routeConfig);

    function routeConfig($stateProvider,$urlRouterProvider) {
        $stateProvider
        .state('topicList',{
            url:'/topics?type&limit&skip&isGood',
            template:`
                <topic-list option="vm"></topic-list>
                `,
            controller:'TopicController'
        })
        .state('topicDetail',{
            url:'/topics/:topicId',
            template:`
                <div>
                    <h2>{{ topic.title }}</h2>
                    <p>{{ topic.content }}</p>
                    <button ng-click="vote()">赞</button>
                <div>
            `,
            controller:function($scope,Topic,$stateParams,user){
                "use strict";

                var topic=new Topic({_id:$stateParams.topicId});
                var sessionUser=user.currentUser();
                $scope.topic=topic;

                topic.$get();

                $scope.vote=function(){
                    topic.toggleVote(sessionUser?sessionUser._id:null)
                        .then(function(resp){
                            console.log(resp);
                        });
                };
            }
        })
        .state('topicCreate',{
            url:'/topics/create/new',
            template:`
                <form name="topicForm" ng-submit="createTopic($event)">

                        <md-input-container md-no-float class="md-block">
                            <input ng-model="topic.title"
                                name="title"
                                type="text"
                                placeholder="标题"
                                aria-label="标题"
                                required>
                        </md-input-container>

                        <md-input-container md-no-float class="md-block">
                            <input ng-model="topic.type"
                                name="type"
                                type="text"
                                placeholder="类型"
                                aria-label="类型"
                                required>
                        </md-input-container>

                        <md-input-container md-no-float class="md-block">
                            <textarea ng-model="topic.content"
                                name="content"
                                placeholder="内容"
                                aria-label="内容"
                                required>
                                </textarea>
                        </md-input-container>

                        <md-input-container md-no-float class="md-block">
                            <md-button type="submit" flex="100"
                                class="md-primary md-raised">
                                保存
                            </md-button>
                        </md-input-container>
                    </form>
            `,
            controller:function($scope,Topic,$dialog,$state){
                "use strict";
                $scope.topic=new Topic();

                $scope.createTopic=function(){
                    $scope.topic.$save()
                        .then(function(){
                            $dialog.alert('创建文章成功!');
                            $state.go('topicList');
                        },function(err){
                            $dialog.alert('需要登录才能发贴',function(){
                                window.href='/signin'
                            });
                        });
                }
            }
        });

        $urlRouterProvider.otherwise('/topics?type=1');
    }
})();
