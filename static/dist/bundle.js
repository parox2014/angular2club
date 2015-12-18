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
      },
      topic:{
        BASE:'/topics',
        GOOD:'/:id/good',
        VOTE:'/:id/vote'
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

(function(){
  "use strict";
  angular
    .module('app.filters',[])
    .filter('')
})();
(function () {
    angular.module('app.routes',[])
    .config(routeConfig);

    function routeConfig($stateProvider,$urlRouterProvider) {
        $stateProvider
        .state('main',{
            url:'/',
            template:`
                <topic-list></topic-list>
                `
        });

        $urlRouterProvider.otherwise('/');
    }
})();


angular.module('app.starter',[
        'app.core',
        'app.config',
        'app.routes',
        'app.user',
        'app.baiduWeather'
      ])
      .controller('MainController',function ($scope,BaiduWeather,baiduWeatherApiKey) {
        var baiduWeather = new BaiduWeather(baiduWeatherApiKey);
        var cityId;

        $scope.getData = function () {
          baiduWeather
            .getCityListByName('杭州')
            .then(function (resp) {
              cityId = resp[0].area_id;
              return baiduWeather.getRecentWeatherByCityId(cityId);
            })
            .then(function(data) {
              console.log('recent',data);
              return baiduWeather.getTodayWeatherByCityId(cityId);
            })
            .then(function(data) {
              console.log('today',data);
            })
            .catch(function(err) {
              console.error(err);
            });

        };
      })
      .run(function (user) {
        user.currentUser(window.__currentUser);
      });

(function() {
  angular
    .module('app.component', ['app.user', 'ngMessages'])
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
.directive('loginForm',function (user,$rootScope) {
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

            $scope.onClick=function(e){
                "use strict";
                $rootScope.$broadcast('$requestStart',e);
            };
        }
    };
});

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

(function() {
  angular.module('app.component')
    .directive('registerForm', registerFormDirective);

  function registerFormDirective(user) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '../templates/register-form.html',
      scope: {
        formTitle: '@',
        onSuccess: '&',
        onError: '&'
      },
      link: function(scope, element) {

        var viewModel = scope.vm = {
          isSubmiting: false
        };

        scope.user = user;

        scope.onSubmit = function() {
          viewModel.isSubmiting = true;
          user.signup()
            .success(function(resp) {
              scope.onSuccess({
                user: resp
              });
            })
            .error(function(resp) {
              viewModel.isSubmiting = false;
              scope.onError({
                error: resp
              });
            });
        };

      }
    };
  }
})();

(function(){
  "use strict";
  angular
    .module('app.component')
    .directive('topicList',topicListDirective);

  function TopicListController($scope,$attrs,$element,Topic){
    var that=this;

    that.init=init;
    that.getList=getList;

    function init(){
      $scope.topics=this.getList();
    }

    function getList(params){
      return Topic.query(params);
    }
  }

  function topicListDirective(){
    return {
      restrict:'EA',
      templateUrl:'../templates/topic-list.html',
      replace:true,
      controller:TopicListController,
      link:function(scope,element,attrs,topicCtrl){
        topicCtrl.init();
      }
    }
  }
})();
(function() {
  var directives = angular.module('app.directives', []);

  directives.directive('unique', uniqueDirecitve);

  function uniqueDirecitve($parse, user) {
    return {
      require: '?^ngModel',
      link: function(scope, element, attr, ngModel) {
        var isUnique = false;
        var getNgModel = $parse(attr.ngModel);

        element.bind('blur', function() {
          var value = getNgModel(scope);

          if (isUnique || !value) {
            return;
          }

          user.unique(value)
            .success(function(resp) {
              console.log(resp);
              ngModel.$setValidity('unique', true);
              isUnique = true;
            })
            .error(function(err) {
              console.log(err);
              ngModel.$setValidity('unique', false);
              isUnique = true;
            });
        });

        element.bind('input', function() {
          isUnique = false;
        });
      }
    };
  }

  directives.directive('languageMenu', languageMenuDirective);

  function languageMenuDirective($translate) {
    return {
      link: function(scope, element) {
        var langs = [{
          text: '中文',
          value: 'zh_CN',
          isChecked: true
        }, {
          text: 'English',
          value: 'en',
          isChecked: false
        } ];

        scope.openMenu = function($mdOpenMenu, ev) {
          $mdOpenMenu(ev);
        };

        scope.changeLang = function(lang) {
          $translate.use(lang.value);
          angular.forEach(langs, function(item) {
            item.isChecked = false;
          });

          lang.isChecked = true;
        };

        scope.langs = langs;
      }
    };
  }

  directives.directive('mdAvatar', avatarDirective);

  function avatarDirective() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '../templates/avatar.html',
      scope: {
        profile: '='
      }
    };
  }

})();

(function (angular) {
    angular.module('app.services', ['ngMaterial','app.config'])
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

(function () {
  angular
      .module('app.baiduWeather',[])
      //百度天气服务
      .factory('BaiduWeather',function ($http,$q) {
        var cityListUri = 'http://apis.baidu.com/apistore/weatherservice/citylist';
        var recentWeatherUri = 'http://apis.baidu.com/apistore/weatherservice/recentweathers';
        var todayWeatherUri = 'http://apis.baidu.com/apistore/weatherservice/cityid';

        function BaiduWeather(apiKey) {
          this.API_KEY = apiKey;
        }

        BaiduWeather.prototype = {
          /**
           * 判断请求是否成功
           * @method _isReqSuccess
           * @param  {String}      msg [description]
           * @return {Boolean}         [description]
           * @private
           */
          _isReqSuccess:function (msg) {
            return msg === 'success';
          },
          /**
           * 共用请求
           * @param {String} url 请求地址
           * @param {Object} param 请求参数
           * @returns {*|d.promise|promise}
           * @private
           */
          _request:function(url,param){
            var deferred = $q.defer();
            var that = this;

            $http({
              url:url,
              method:'GET',
              params:param,
              headers:{
                apiKey:this.API_KEY
              }
            })
            .success(function (resp) {
              if (that._isReqSuccess(resp.errMsg)){
                return deferred.resolve(resp.retData);
              }
              deferred.reject(resp);
            })
            .error(function (err) {
              deferred.reject(err);
            });

            return deferred.promise;
          },
          /**
           * 获取城市列表
           * @method getCityListByName
           * @param  {String}          cityName 城市名称
           * @return {[type]}                   [description]
           */
          getCityListByName:function (cityName) {
            return this._request(cityListUri, {
                  cityname:cityName
                });
          },
          /**
           * 获取最近天气，过去七天与未来四天
           * @method getRencentWeatherByCityId
           * @param  {String}                  cityId 城市Id
           * @return {Promise}                         [description]
           */
          getRecentWeatherByCityId:function (cityId) {
            return this._request(recentWeatherUri,{
              cityid:cityId
            });
          },
          /**
           * 获取今天的天气
           * @param cityId
           * @returns {*|d.promise|promise}
             */
          getTodayWeatherByCityId:function(cityId){
            return this._request(todayWeatherUri,{
              cityid:cityId
            });
          }
        };
        return BaiduWeather;
      });
})();

(function(){
  "use strict";
  angular
    .module('app.services')
    .factory('Topic',function($resource,api){
      var Topic=$resource(api.topic.BASE);

      return Topic;
    });
})();
(function() {

  angular
    .module('app.user', [
      'app.config'
    ])
    .factory('user', userService);

  function userService($http, api) {
    var currentUser = null;
    return {
      signup: function() {
        return $http.post(api.user.SIGN_UP, this.toJson());
      },
      signin: function() {
        return $http.post(api.user.SIGN_IN, this.toJson());
      },
      unique: function(value) {
        var params = {
          account: value
        };
        return $http.get(api.user.UNIQUE, {
          params: params
        });
      },
      toJson: function() {
        return {
          account: this.account,
          nickName: this.nickName,
          password: this.password
        };
      },
      currentUser: function(user) {
        if (user) {
          currentUser = user;
        } else {
          return currentUser;
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
