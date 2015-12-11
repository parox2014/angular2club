(function (angular) {
    angular.module('app.component')
        .directive('leftMenu',function () {
            return {
              replace:true,
              templateUrl:'../templates/left-menu.html',
              link:function (scope) {
                  scope.currentUser = window.__currentUser;
              }
            };
        });
})(window.angular);
