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
                CHECK:'/user/check'
            }
        };
    }

    function appConfig($translateProvider,$mdThemingProvider) {

        $mdThemingProvider
            .theme('default')
            .primaryPalette('indigo')
            .accentPalette('red');
    }
})();
