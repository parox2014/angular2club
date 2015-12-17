(function() {
  angular.module('app.config', [])
    .factory('api', api)
    .constant('baiduWeatherApiKey', '6aa7516564286a7fed27f1b7745a3b6c')
    .factory('httpInterceptor', interceptor)
    .config(appConfig);

  function api() {
    return {
      user: {
        SIGN_UP: '/signup',
        SIGN_IN: '/signin',
        SIGN_OUT: '/signout',
        UNIQUE: '/users/unique'
      }
    };
  }

  function appConfig($translateProvider, $mdThemingProvider, $httpProvider) {

    $mdThemingProvider
      .theme('default')
      .primaryPalette('indigo')
      .accentPalette('red');

    $httpProvider.defaults.headers.common['X-Requested-With'] =
      'XMLHttpRequest';

    $httpProvider.interceptors.push('httpInterceptor');
  }

  //拦截器
  function interceptor($q, $rootScope) {
    return {
      // optional method
      'request': function(config) {
        $rootScope.$broadcast('$requestStart', config);
        return config;
      },

      // optional method
      'requestError': function(rejection) {
        $rootScope.$broadcast('$requestError', rejection);
        return $q.reject(rejection);
      },



      // optional method
      'response': function(response) {
        $rootScope.$broadcast('$requestSuccess', response);
        return response;
      },

      // optional method
      'responseError': function(rejection) {
        $rootScope.$broadcast('$responseError', rejection);
        return $q.reject(rejection);
      }
    };
  }
})();
