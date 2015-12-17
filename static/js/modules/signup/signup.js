(function() {
  angular
    .module('app.register', [
      'app.core',
      'app.config',
      'app.user',
      'ngMessages'
    ])
    .controller('RegisterStep1Controller', function($scope, $state, $mdToast) {
      $scope.nextStep = nextStep;

      function nextStep(user) {
        $mdToast.showSimple('注册成功');
        $state.go('step2', {
          userId: user._id
        });
      }
    })
    .controller('RegisterStep2Controller', function($scope, $stateParams,
      $state) {
      var uid = $stateParams.userId;
      if (!uid) {
        return $state.go('step1');
      }
      $scope.vm = {
        userId: uid
      };
    })
    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('step1', {
          url: '/step1',
          template: '<register-form form-title="用户注册" on-success="nextStep(user)"></register-form>',
          controller: 'RegisterStep1Controller'
        })
        .state('step2', {
          url: '/step2/:userId',
          template: '<h2>注册成功，请前往你的邮箱激活帐号！</h2>',
          controller: 'RegisterStep2Controller'
        });

      $urlRouterProvider.otherwise('/step1');
    });

})();
