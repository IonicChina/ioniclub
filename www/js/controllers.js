angular.module('ioniclub.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, $timeout) {
  console.log("AppCtrl");
  // Form data for the login modal
  $scope.loginData = {};

  // error handler
  var errorMsg = {
    0: '网络出错啦，请再试一下',
    'wrong accessToken': '授权失败'
  };

  $rootScope.requestErrorHandler = function(options, callback) {
    return function(response) {
      var error;
      if (response.data && response.data.error_msg) {
        error = errorMsg[response.data.error_msg];
      } else {
        error = errorMsg[response.status] || 'Error: ' + response.status + ' ' + response.statusText;
      }
      var o = options || {};
      angular.extend(o, {
        template: error,
        duration: 1000
      });
      $ionicLoading.show(o);
      return callback && callback();
    };
  };


});
