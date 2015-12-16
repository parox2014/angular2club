(function () {
    angular.module('app.config',[])
    .factory('api',api)
    .config(appConfig);

    function api() {
        return{
            user:{
                SIGN_UP:'/signup',
                SIGN_IN:'/signin',
                SIGN_OUT:'/signout',
                UNIQUE:'/user/unique'
            }
        };
    }

    function appConfig($translateProvider,$mdThemingProvider,$httpProvider) {

        $mdThemingProvider
            .theme('default')
            .primaryPalette('indigo')
            .accentPalette('red');

        $httpProvider.defaults.headers.common['X-Requested-With']='XMLHttpRequest';
    }
})();
