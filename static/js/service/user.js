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

