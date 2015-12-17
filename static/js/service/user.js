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
