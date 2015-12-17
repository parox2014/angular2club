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
