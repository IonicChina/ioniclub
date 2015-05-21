/**
 * 各种定制化的服务
 */

angular.module('ioniclub.services', [])
  .factory('Storage', function() {
    "use strict";
    return {
      set: function(key, data) {
        return window.localStorage.setItem(key, window.JSON.stringify(data));
      },
      get: function(key) {

        return window.JSON.parse(window.localStorage.getItem(key));
      },
      remove: function(key) {
        return window.localStorage.removeItem(key);
      }
    };
  })
  .factory('Push', function(ENV) {
    var push;
    return {
      setBadge: function(badge) {
        if (push) {

          plugins.jPushPlugin.setBadge(badge);
        }
      },
      resetBadge: function() {
        if (push) {
          plugins.jPushPlugin.resetBadge();
        }
      },
      setAlias: function(alias) {
        if (push) {
          plugins.jPushPlugin.setAlias(alias);

        }
      },
      check: function() {

        if (window.jpush && push) {

          window.jpush = null;
        }
      },
      init: function(notificationCallback) {


        push = window.plugins && window.plugins.jPushPlugin;
        if (push) {


          plugins.jPushPlugin.init();
          plugins.jPushPlugin.setDebugMode(false);
          try {
            if (plugins.jPushPlugin.isPlatformIOS()) {
              plugins.jPushPlugin.setLogOFF();
            }
            plugins.jPushPlugin.openNotificationInAndroidCallback = notificationCallback;

            plugins.jPushPlugin.receiveNotificationIniOSCallback = notificationCallback;
          } catch (exception) {
            console.debug('exception--------------------');
            console.debug("JPushPlugin initexception ： " + exception);
          }
        }
      },
      stopPush: function() {
        // 停止推送
        plugins.jPushPlugin.stopPush();


      },
      resumePush: function() {
        // 唤醒推送

        plugins.jPushPlugin.resumePush();

      }
    };
  })
  .factory('CommonService', function($http, $rootScope, LXS, Storage) {

    return {
      getIOSVersion: function() {

        return $http.post(LXS.api + "/getIOSVersion.do")
          .success(function(data, status, headers, config) {


            $rootScope.$broadcast('lxs.IOSVersionUpdate', data);
          });
      },
      getAndroidVersion: function() {

        return $http.post(LXS.api + "/getAndroidVersion.do")
          .success(function(data, status, headers, config) {

            $rootScope.$broadcast('lxs.AndroidVersionUpdate', data);
          });
      }
    };
  })
  .factory('Tabs', function() {
    return [{
      value: 'all',
      label: '全部'
    }, {
      value: 'share',
      label: '分享'
    }, {
      value: 'ask',
      label: '问答'
    }, {
      value: 'job',
      label: '招聘'
    }, {
      value: 'bb',
      label: '吐槽'
    }, {
      value: undefined,
      label: '其他'
    }];
  })
  .filter('tabName', function(Tabs) {
    return function(tab) {
      for (var i in Tabs) {
        if (Tabs[i].value === tab) {
          return Tabs[i].label;
        }
      }
    };
  })
  .filter('link', function($sce) {
    return function(content) {
      if (typeof content === 'string') {
        var userLinkRegex = /href="\/user\/([\S]+)"/gi;
        var noProtocolSrcRegex = /src="\/\/([\S]+)"/gi;
        var externalLinkRegex = /href="((?!#\/user\/)[\S]+)"/gi;
        return $sce.trustAsHtml(
          content
          .replace(userLinkRegex, 'href="#/user/$1"')
          .replace(noProtocolSrcRegex, 'src="https://$1"')
          .replace(externalLinkRegex, "onClick=\"window.open('$1', '_blank', 'location=yes')\"")
        );
      }
      return content;
    };
  })
  .filter('protocol', function() {
    return function(src) {
      // add https protocol
      if (/^\/\//gi.test(src)) {
        return 'https:' + src;
      } else {
        return src;
      }
    };
  })
  .filter('avatarFilter', function() {
    return function(src) {
      // add https protocol
      if (src) {
        src = src.replace("https://avatars.githubusercontent.com", "http://7xj5bc.com1.z0.glb.clouddn.com");
        src = src + "&imageView2/2/w/120";
      }
      return src;
    };
  })
  // .directive('hideTabs', function($rootScope) {
  //
  //   return {
  //
  //     restrict: 'AE',
  //
  //     link: function($scope) {
  //
  //       $rootScope.hideTabs = 'tabs-item-hide';
  //
  //       $scope.$on('$destroy', function() {
  //
  //         $rootScope.hideTabs = ' ';
  //
  //       });
  //
  //     }
  //
  //   };
  //
  // })


.directive(
  // Collection-repeat image recycling while loading
  // https://github.com/driftyco/ionic/issues/1742
  'resetImg',
  function($document) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attributes) {
        var applyNewSrc = function(src) {
          var newImg = $element.clone(true);

          newImg.attr('src', src);
          $element.replaceWith(newImg);
          $element = newImg;
        };

        $attributes.$observe('src', applyNewSrc);
        $attributes.$observe('ngSrc', applyNewSrc);
      }
    };
  }
);
