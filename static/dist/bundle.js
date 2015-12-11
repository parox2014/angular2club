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

(function () {
    angular.module('app.core',[
        'ngAria',
        'ngAnimate',
        'ngMaterial',
        'ngResource',
        'ngMessages',
        'ngSanitize',
        'ngTouch',
        'pascalprecht.translate',
        'ui.router',
        'app.directives',
        'app.component',
        'app.services'
    ]);
})();

(function () {
    angular.module('app.routes',[])
    .config(routeConfig);

    function routeConfig($stateProvider) {
        // body...
    }
})();

angular.module('app.starter',[
        'app.core',
        'app.config',
        'app.routes',
        'app.user'
      ]);

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
                }
            };
        });
})();

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

angular.module('app.component')
.directive('loginForm',function (user) {
    return {
        restrict:'EA',
        scope:{
            onSuccess:'&',
            onError:'&',
            formTitle:'@'
        },
        replace:true,
        templateUrl:'../templates/login-form.html',
        link:function ($scope,element) {
            var viewModel = $scope.vm = {
                isSubmiting:false,
                qqUri:document.querySelector('[name="qq"]').value,
                gitHubUri:document.querySelector('[name="github"]').value
            };

            $scope.user = user;

            $scope.onSubmit = function () {
                viewModel.isSubmiting = true;
                user.signin()
                .success(function (resp) {
                    $scope.onSuccess({ user:user });
                })
                .error(function (err) {
                    $scope.onError({ error:err });
                    viewModel.isSubmiting = false;
                });
            };
        }
    };
});

angular.module('app.component')
    .directive('mdlTextfield',function () {
        return {
            restrict:'EAC',
            link:function (scope,element)  {
                new MaterialTextfield(element[0]);
            }
        }
    })
    .directive('mdlButton',function () {
        return {
            restrict:'EAC',
            link:function (scope,element) {
                new MaterialButton(element[0]);
            }
        }
    });

(function () {
    angular.module('app.component')
        .directive('registerForm',registerFormDirective);

        function registerFormDirective(user) {
            return {
                restrict:'EA',
                replace:true,
                templateUrl:'../templates/register-form.html',
                scope:{
                    formTitle:'@',
                    onSuccess:'&',
                    onError:'&'
                },
                link:function (scope,element) {

                    var viewModel=scope.vm={
                        isSubmiting:false
                    };

                    scope.user=user;

                    scope.onSubmit=function () {
                        viewModel.isSubmiting=true;
                        user.signup()
                        .success(function (resp) {
                            scope.onSuccess({user:resp});
                        })
                        .error(function (resp) {
                            viewModel.isSubmiting=false;
                            scope.onError({error:resp});
                        });
                    };

                }
            };
        }
})();

(function () {
    var directives=angular.module('app.directives',[]);

    directives.directive('unique',uniqueDirecitve);

    function uniqueDirecitve($parse,user) {
        return {
            require:'?^ngModel',
            link:function (scope,element,attr,ngModel) {
                var field=attr.unique;
                var isUnique=false;
                var getNgModel=$parse(attr.ngModel);

                element.bind('blur',function () {
                    var value=getNgModel(scope);

                    if(isUnique||!value){
                        return;
                    }

                    user.unique(field,value)
                        .success(function (resp) {
                            console.log(resp);
                            ngModel.$setValidity('unique',true);
                            isUnique=true;
                        })
                        .error(function (err) {
                            console.log(err);
                            ngModel.$setValidity('unique',false);
                            isUnique=true;
                        });
                });

                element.bind('input',function () {
                    isUnique=false;
                });
            }
        };
    }

    directives.directive('languageMenu',languageMenuDirective);

    function languageMenuDirective ($translate) {
        return {
            link:function (scope,element) {
                var langs=[
                    {text:'中文',value:'zh_CN',isChecked:true},
                    {text:'English',value:'en',isChecked:false},
                ];

                scope.openMenu=function($mdOpenMenu, ev) {
                  $mdOpenMenu(ev);
                };

                scope.changeLang=function (lang) {
                    $translate.use(lang.value);
                    angular.forEach(langs, function(item) {
                        item.isChecked=false;
                    });

                    lang.isChecked=true;
                };

                scope.langs=langs;
            }
        }
    }

})();

(function (angular) {
    angular.module('app.services', ['ngMaterial'])
        .factory('$dialog', function($mdDialog,$filter) {
            var translateFilter=$filter('translate');
            return {
                confirm:_confirm,
                alert:_alert
            };

            function _confirm(template,callback) {
                var options;
                if(angular.isObject(template)){
                    options=template;
                }else {
                    options={
                        template:template,
                        onConfirm:callback
                    };
                }
                showDialog(options);
            }

            function _alert(template,callbakc) {
                var options;
                if(angular.isObject(template)){
                    options=template;
                }else{
                    options={
                        template:template,
                        type:'warn',
                        showOkButton:false,
                        cancelText:translateFilter('CLOSE'),
                        onCancel:callbakc
                    };
                }

                showDialog(options);
            }

            function showDialog(config) {
               var parentEl = angular.element(document.body);

               var defaults={
                    title:translateFilter('HINT'),
                    okText:translateFilter('CONFIRM'),
                    cancelText:translateFilter('CANCEL'),
                    showOkButton:true,
                    showCancelButton:true,
                    showToolbar:true,
                    template:'<strong>您确定要这样做吗？</strong>',
                    type:'primary',
                    clickOutsideToClose :true,
                    escapeToClose :true,
                    onConfirm:angular.noop,
                    onCancel:angular.noop
               };

               angular.extend(defaults,config);

               $mdDialog.show({
                   parent: defaults.parentEl||parentEl,

                   templateUrl:'../templates/dialog.html',
                    locals: {
                        config: defaults
                    },
                    controller: DialogController
              });
              function DialogController($scope, $mdDialog, config) {
                $scope.config = config;
                $scope.onConfirm=function () {
                    config.onConfirm();
                    $mdDialog.hide();
                };
                $scope.closeDialog = function() {
                    config.onCancel();
                    $mdDialog.hide();
                };
              }
            }
        });
})(angular);

(function(){

    angular
        .module('app.user',[
            'app.config'
        ])
        .factory('user',userService);

    function userService($http,api){
        return {
            signup:function () {
                return $http.post(api.user.SIGN_UP,this.toJson());
            },
            signin:function () {
                return $http.post(api.user.SIGN_IN,this.toJson());
            },
            unique:function (field,value) {
                var params={
                    field:field,
                    value:value
                };
                return $http.get(api.user.CHECK,{params:params});
            },
            toJson:function () {
                return {
                    account:this.account,
                    nickName:this.nickName,
                    password:this.password
                }
            }
        };
    }
})();


angular
    .module('app.login',[
        'app.core',
        'app.config',
        'app.user'
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
