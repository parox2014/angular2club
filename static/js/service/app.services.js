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
