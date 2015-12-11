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
