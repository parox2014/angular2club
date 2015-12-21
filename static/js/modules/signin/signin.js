angular
    .module('app.login',[
        'app.core',
        'app.config'
    ])
    .controller('LoginController',function ($scope,$timeout,$dialog,$filter,$mdToast) {
        $scope.onSuccess=function (user) {
            $mdToast.showSimple('登录成功');
            
            $timeout(function () {
                location.href='/';
            },2000);

        };

        $scope.onError=function (error) {
            var msg=$filter('translate')(error.msg);
            $dialog.alert(msg,function () {
                console.log('fuck');
            });
        };
    })
    .run(function () {
        // body...
    });
