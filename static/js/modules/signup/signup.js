(function () {
    angular
    .module('app.register',[
        'app.core',
        'app.config',
        'app.user',
        'ngMessages'
    ])
    .controller('RegisterStep1Controller',function ($scope,$state) {
        $scope.nextStep=nextStep;

        function nextStep(user) {
            $state.go('step2',{userId:user._id});
        }
    })
    .controller('RegisterStep2Controller',function ($scope,$stateParams,$state) {
        $scope.vm={
            userId:$stateParams.userId
        };

        if(!$scope.vm.userId){
            $state.go('step1');
        }
    })
    .config(function ($stateProvider,$urlRouterProvider) {
        $stateProvider
            .state('step1',{
                url:'/step1',
                template:'<div flex="30" class="md-whiteframe-1dp mdl-mg-2x mdl-pd-2x">'+
                            '<register-form form-title="{{ \'REGISTER\'|translate }}" on-success="nextStep(user)">'+
                            '</register-form>'+
                        '</div>',
                controller:'RegisterStep1Controller'
            })
            .state('step2',{
                url:'/step2/:userId',
                template:'<div flex="30" class="md-whiteframe-1dp mdl-mg-2x mdl-pd-2x">'+
                            '<h2>注册成功，请前往你的邮箱激活帐号！</h2>'+
                        '</div>',
                controller:'RegisterStep2Controller'
            });

            $urlRouterProvider.otherwise('/step1');
    });

})();
