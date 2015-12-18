(function () {
    angular.module('app.routes',[])
    .config(routeConfig);

    function routeConfig($stateProvider,$urlRouterProvider) {
        $stateProvider
        .state('main',{
            url:'/',
            template:`
                <topic-list></topic-list>
                `
        });

        $urlRouterProvider.otherwise('/');
    }
})();
