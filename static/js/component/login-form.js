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
