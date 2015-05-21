angular.module('ioniclub')

.controller('MyCtrl', function($scope, $state, $rootScope, $timeout,
    $cordovaClipboard, $cordovaEmailComposer, $cordovaGoogleAnalytics,
    $ionicHistory, $ionicLoading, $ionicPopup, $log, ENV, User, My) {
    console.log("enter My ctrl");




    $scope.$on('$ionicView.beforeEnter', function() {

      $scope.ENV = ENV;
      $rootScope.hideTabs = '';
    });

    $scope.$on('$ionicView.afterEnter', function() {

      document.addEventListener("deviceready", function() {
        // trackView
        $cordovaGoogleAnalytics.trackView('my view');
      }, false);



    });

    $scope.$on('$ionicView.beforeLeave', function() {
      // $rootScope.hideTabs = '';
    });

    $scope.now = new Date();
    $scope.settings = My.getSettings();
    $scope.platform = ionic.Platform;

    // mail feedback
    var feedbackMailAddr = 'v@ionichina.com';
    var feedbackMailSubject = 'Ioniclub Feedback v' + $scope.settings.version;
    var device = ionic.Platform.device();
    var feedbackMailBody = '<br><br>' + device.platform + ' ' + device.version + ' | ' + device.model;
    $scope.feedback = function() {

      document.addEventListener("deviceready", function() {

        $cordovaEmailComposer.isAvailable().then(function() {
          // is available
        }, function() {
          // not available
          window.open('mailto:' + feedbackMailAddr + '?subject=' + feedbackMailSubject);
        });

        var email = {
          to: feedbackMailAddr,
          subject: feedbackMailSubject,
          body: feedbackMailBody
        };

        $cordovaEmailComposer.open(email).then(null, function() {
          // user cancelled email
        });

      }, false);







      // if (window.cordova && window.cordova.plugins.email) {
      //   window.cordova.plugins.email.open({
      //     to: feedbackMailAddr,
      //     subject: feedbackMailSubject,
      //     body: feedbackMailBody
      //   });
      // } else {
      //   window.open('mailto:' + feedbackMailAddr + '?subject=' + feedbackMailSubject);
      // }
    };


    $scope.settingsChange = function() {
      My.save($scope.settings);
      $rootScope.$broadcast('ioniclub.settingUpdate');
      // $rootScope.$broadcast('ioniclub.settingUpdate',$scope.settings);
      console.log('ioniclub.settingUpdate');
      // console.log('Push Notification Change', $scope.settings.saverMode);
    };

    // get current user
    var currentUser = User.getCurrentUser();
    $scope.loginName = currentUser.loginname || null;
    $scope.currentUser = currentUser;
    if ($scope.loginName !== null) {
      // $rootScope.getMessageCount();
    }

    // login action callback
    var loginCallback = function(response) {
      $ionicLoading.hide();
      $scope.loginName = response.loginname;
      // $rootScope.getMessageCount();
    };

    // on hold login action
    $scope.onHoldLogin = function() {


      document.addEventListener("deviceready", function() {
        $scope.processing = true;
        $cordovaClipboard
          .paste()
          .then(function(result) {
            // success, use result

            if (result) {
              $log.log('get Access Token', result);
              $ionicLoading.show();
              User.login(result).$promise.then(loginCallback, $rootScope.requestErrorHandler());
            } else {
              $ionicLoading.show({
                noBackdrop: true,
                template: '粘贴板无内容',
                duration: 1000
              });

            }

            $timeout(function() {
              $scope.processing = false;
            }, 1000);




          }, function() {
            // error
            console.log("no clipboad plugin");

            $ionicLoading.show({
              noBackdrop: true,
              template: '粘贴板无内容',
              duration: 1000
            });
          });
      }, false);


    };


    // do login
    $scope.login = function() {
      if ($scope.processing) {
        return;
      }

      if (window.cordova && window.cordova.plugins.barcodeScanner) {
        var loginPrompt = $ionicPopup.show({
          template: 'PC端登录 http://ionichina.com 后，扫描设置页面的Access Token二维码即可完成登录',
          title: '扫码登录',
          scope: $scope,
          buttons: [{
            text: '<b>我知道了</b>',
            type: 'button-positive',
            onTap: function(e) {
              e.preventDefault();
              loginPrompt.close();
              dologin();
            }
          }]
        });
      } else {
        // auto login if in debug mode
        if (ENV.debug) {
          $ionicLoading.show();
          User.login(ENV.accessToken).$promise.then(loginCallback, $rootScope.requestErrorHandler());
        } else {
          $scope.data = {};
          // show login popup if no barcodeScanner in pc browser
          var loginPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.token">',
            title: '输入Access Token',
            subTitle: 'PC端登录 http://ionichina.com 后，在设置页可以找到Access Token',
            scope: $scope,
            buttons: [{
              text: '取消'
            }, {
              text: '<b>提交</b>',
              type: 'button-positive',
              onTap: function(e) {
                e.preventDefault();
                if ($scope.data.token) {
                  User.login($scope.data.token).$promise.then(function(response) {
                    loginPopup.close();
                    loginCallback(response);
                  }, $rootScope.requestErrorHandler());
                }
              }
            }]
          });
        }
      }
    };
    var dologin = function() {
      $scope.processing = true;
      $timeout(function() {
        $scope.processing = false;
      }, 1000);
      cordova.plugins.barcodeScanner.scan(
        function(result) {
          $scope.processing = false;
          if (!result.cancelled) {
            $log.log('get Access Token', result.text);
            $ionicLoading.show();
            User.login(result.text).$promise.then(loginCallback, $rootScope.requestErrorHandler());
          }
        },
        function(error) {
          $scope.processing = false;
          $ionicLoading.show({
            noBackdrop: true,
            template: 'Scanning failed: ' + error,
            duration: 1000
          });
        }
      );

      // track event
      if (window.analytics) {
        window.analytics.trackEvent('User', 'scan login');
      }
    };

    // logout
    $rootScope.$on('ioniclub.logout', function() {
      $log.debug('logout broadcast handle');
      $scope.loginName = null;
      $scope.messagesCount = 0;
      // setBadge(0);
      // 清空历史记录

      // $ionicHistory.clearHistory();
      // $ionicHistory.clearCache();
    });

    // save settings on destroy
    // $scope.$on('$stateChangeStart', function() {
    //   $log.debug('settings controller on $stateChangeStart');
    //   My.save();
    // });

    $scope.collectList = function() {
      var alertPopup = $ionicPopup.alert({

        template: '该功能暂无！',
        okText: '确定'
      });
      alertPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
    };


    $scope.messageList = function() {
      if ($scope.loginName) {
        $state.go('tab.my-messages');
        return;
      }


      var alertPopup = $ionicPopup.confirm({

        template: '登录后继续操作',
        cancelText: '取消',
        okText: '确定'
      });
      alertPopup.then(function(res) {
        if (res) {
          $scope.login();
        } else {
          console.log('cancel');
          // console.log('You are not sure');

        }
      });
    };



  })
  .controller('PersonalCtrl', function($scope, $rootScope, $state, $timeout, $ionicActionSheet,
    $ionicHistory, $cordovaGoogleAnalytics,
    $log, User) {
    $log.log("Personal ctrl");
    // get current user
    var currentUser = User.getCurrentUser();
    $scope.loginName = currentUser.loginname || null;
    $scope.currentUser = currentUser;

    // before enter view event
    $scope.$on('$ionicView.beforeEnter', function() {

      $rootScope.hideTabs = 'tabs-item-hide';

    });

    $scope.$on('$ionicView.afterEnter', function() {


      document.addEventListener("deviceready", function() {
        // trackView
        $cordovaGoogleAnalytics.trackView('personal view');
      }, false);



    });



    $scope.$on('$ionicView.beforeLeave', function() {
      $rootScope.hideTabs = '';
    });



    $scope.logout = function() {
      console.log('logout');
      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({

        destructiveText: '退出登录',
        titleText: '确定退出当前登录账号么？',
        cancelText: '取消',
        cancel: function() {
          // add cancel code..
        },
        destructiveButtonClicked: function() {
          logout();
          return true;
        }
      });

      // For example's sake, hide the sheet after two seconds
      $timeout(function() {
        // hideSheet();
      }, 2000);
    };


    // logout action
    var logout = function() {
      $log.debug('logout button action');
      User.logout();
      $rootScope.$broadcast('ioniclub.logout');

      // track event
      if (window.analytics) {
        window.analytics.trackEvent('User', 'logout');
      }
      // 刷新页面
      // $ionicHistory.clearHistory();
      // $ionicHistory.clearCache();
      $state.go('tab.my');

      // $state.go("tab.setting", {}, {
      //   reload: true
      // });


    };


  })
  .controller('MessagesCtrl', function($scope, $log, $stateParams, $rootScope, $cordovaGoogleAnalytics, Messages) {
    $log.log('messages ctrl');

    // before enter view event
    $scope.$on('$ionicView.beforeEnter', function() {
      // track view
      if (window.analytics) {
        window.analytics.trackView('messages view');
      }

      $rootScope.hideTabs = 'tabs-item-hide';

      // load messages
      loadMessages();
    });

    $scope.$on('$ionicView.afterEnter', function() {

      document.addEventListener("deviceready", function() {
        // trackView
        $cordovaGoogleAnalytics.trackView('messages view');
      }, false);



    });


    $scope.$on('$ionicView.beforeLeave', function() {
      // $rootScope.hideTabs = '';
    });



    var loadMessages = function() {
      Messages.getMessages().$promise.then(function(response) {
        $scope.messages = response.data;
        if ($scope.messages.hasnot_read_messages.length === 0) {
          $rootScope.$broadcast('messagesMarkedAsRead');
        } else {
          Messages.markAll().$promise.then(function(response) {
            $log.debug('mark all response:', response);
            if (response.success) {
              $rootScope.$broadcast('messagesMarkedAsRead');
            }
          }, function(response) {
            $log.debug('mark all response error:', response);
          });
        }
      }, function(response) {
        $log.debug('get messages response error:', response);
      });
    };
  })

.factory('User', function(ENV, $resource, $log, $q, Storage, Push) {
    var storageKey = 'user';
    var resource = $resource(ENV.api + '/accesstoken');
    var userResource = $resource(ENV.api + '/user/:loginname', {
      loginname: ''
    });
    var user = Storage.get(storageKey) || {};
    return {
      login: function(accesstoken) {
        var $this = this;
        return resource.save({
          accesstoken: accesstoken
        }, null, function(response) {
          $log.debug('post accesstoken:', response);
          user.accesstoken = accesstoken;
          $this.getByLoginName(response.loginname).$promise.then(function(r) {
            user = r.data;
            user.id = response.id;
            user.accesstoken = accesstoken;

            // set alias for jpush
            Push.setAlias(user.id);

            Storage.set(storageKey, user);
          });
          user.loginname = response.loginname;
        });
      },
      logout: function() {
        user = {};
        Storage.remove(storageKey);

        // unset alias for jpush
        Push.setAlias('');
      },
      getCurrentUser: function() {
        $log.debug('current user:', user);
        return user;
      },
      getByLoginName: function(loginName) {
        if (user && loginName === user.loginname) {
          var userDefer = $q.defer();
          $log.debug('get user info from storage:', user);
          userDefer.resolve({
            data: user
          });
          return {
            $promise: userDefer.promise
          };
        }
        return this.get(loginName);
      },
      get: function(loginName) {
        return userResource.get({
          loginname: loginName
        }, function(response) {
          $log.debug('get user info:', response);
          if (user && user.loginname === loginName) {
            angular.extend(user, response.data);

            Storage.set(storageKey, user);
          }
        });
      }
    };
  })
  .factory('Messages', function(ENV, $resource, $log, User) {
    var messages = {};
    var messagesCount = 0;
    var resource = $resource(ENV.api + '/messages', null, {
      count: {
        method: 'get',
        url: ENV.api + '/message/count'
      },
      markAll: {
        method: 'post',
        url: ENV.api + '/message/mark_all'
      }
    });
    return {
      currentMessageCount: function() {
        return messagesCount;
      },
      getMessageCount: function() {
        $log.debug('get messages count');
        var currentUser = User.getCurrentUser();
        return resource.count({
          accesstoken: currentUser.accesstoken
        });
      },
      getMessages: function() {
        $log.debug('get messages');
        var currentUser = User.getCurrentUser();
        return resource.get({
          accesstoken: currentUser.accesstoken
        });
        // return messages;
      },
      markAll: function() {
        $log.debug('mark all as read');
        var currentUser = User.getCurrentUser();
        return resource.markAll({
          accesstoken: currentUser.accesstoken
        }, function(response) {
          $log.debug('marked messages as read:', response);
          messagesCount = 0;
        });
      }
    };
  })
  .factory('My', function(ENV, $resource, $log, Storage) {
    var storageKey = 'settings';
    var settings = Storage.get(storageKey) || {
      sendFrom: true,
      showAvatar: true,
      version: ENV.version
    };
    return {
      getSettings: function() {
        $log.debug('get settings', settings);
        return settings;
      },
      setSettings: function(key, value) {
        settings[key] = value;
        // return settings;
        $log.debug('set settings', settings);
      },
      save: function(settings) {
        $log.debug('save settings', settings);
        Storage.set(storageKey, settings);
      }
    };
  });
