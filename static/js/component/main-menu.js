(function() {
  angular.module('app.component')
    .directive('mainMenu', mainMenuDirective);

  function mainMenuDirective(user) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '../templates/main-menu.html',
      link: function(scope, element) {

      }
    };
  }
})();
