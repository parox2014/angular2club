(function () {
    angular
        .module('app.component',[ 'app.user','ngMessages' ])
        .directive('commonToolbar',function ($mdSidenav) {
            return {
                templateUrl:'../templates/common-toolbar.html',
                scope:{
                    showMenuButton:'@'
                },
                replace:true,
                link:function (scope,element) {
                    scope.toggleSideMenu = function () {
                        $mdSidenav('leftMenu').toggle();
                    };

                    scope.currentUser=window.__currentUser;
                }
            };
        });
})();
