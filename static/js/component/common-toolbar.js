(function() {
  angular
    .module('app.component', ['app.services', 'ngMessages'])
    .directive('commonToolbar', function($mdSidenav, user, $timeout) {
      return {
        templateUrl: '../templates/common-toolbar.html',
        scope: {
          showMenuButton: '@'
        },
        replace: true,
        link: function(scope, element) {
          scope.toggleSideMenu = function() {
            $mdSidenav('leftMenu').toggle();
          };

          scope.currentUser = user.currentUser();

          scope.vm = {
            isShowLoading: false
          };

          scope.$on('$requestStart', function(argument) {
            toggleLoading(true);
          });

          scope.$on('$requestSuccess', function() {
            toggleLoading(false);
          });

          scope.$on('$responseError', function() {
            toggleLoading(false);
          });

          function toggleLoading(isShow) {
            if (isShow) {
              return (scope.vm.isShowLoading = isShow);
            }
            $timeout(function() {
              scope.vm.isShowLoading = isShow;
            }, 500);
          }
        }
      };
    });
})();
