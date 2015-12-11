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
