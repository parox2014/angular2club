
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
