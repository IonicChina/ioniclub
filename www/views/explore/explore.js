angular.module('ioniclub')

.controller('ExploreCtrl', function($scope, $timeout, $cordovaGoogleAnalytics) {
  console.log("enter Explore ctrl");



  $scope.$on('$ionicView.afterEnter', function() {


    document.addEventListener("deviceready", function() {
      // trackView
      $cordovaGoogleAnalytics.trackView('explore view');
    }, false);

  });



});
