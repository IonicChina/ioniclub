angular.module('ioniclub')

.controller('TopicsCtrl', function($scope, $rootScope, $log, $timeout,
    $ionicTabsDelegate, $ionicPopover, $ionicModal, $ionicLoading,
    $location, $state,
    $cordovaNetwork, $cordovaGoogleAnalytics,
    Topics, Tabs, My, User, ENV) {
    console.log("enter topics ctrl");

    // get current user
    var currentUser = User.getCurrentUser();
    $scope.loginName = currentUser.loginname || null;

    $scope.$on('$ionicView.beforeEnter', function() {
      // get user settings
      $scope.settings = My.getSettings();
      $rootScope.hideTabs = '';
    });


    $scope.$on('$ionicView.afterEnter', function() {

      document.addEventListener("deviceready", function() {
        // trackView
        $cordovaGoogleAnalytics.trackView('topics view');
      }, false);


      $timeout(function() {
        $scope.topics = Topics.getTopics();
      }, 100);
    });




    // $scope.title = "全部话题";
    // assign tabs
    $scope.tabs = Tabs;
    $scope.currentTab = Topics.getCurrentTab();




    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('views/topic/popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
      // console.log('show popover');
      $scope.popover.show($event);
    };

    $scope.changeTab = function(tab) {
      Topics.setCurrentTab(tab);
      $scope.currentTab = Topics.getCurrentTab();
      $scope.popover.hide();
    };


    // $topicCategory = $ionicTabsDelegate.$getByHandle('topic-category');
    // var category = TabCategory.get($topicCategory.selectedIndex());
    // var category = "all";
    Topics.fetchTopStories();





    $scope.$on('ioniclub.topicsUpdated', function() {
      // $timeout(function() {
      $scope.topics = Topics.getTopics();
      $scope.$broadcast('scroll.refreshComplete');
      // }, 100);
    });

    // logout
    $rootScope.$on('ioniclub.logout', function() {
      $log.debug('logout broadcast handle');
      $scope.loginName = null;
      $scope.messagesCount = 0;
      // setBadge(0);
    });






    // $scope.onTabSelected = function() {
    //   // category = TabCategory.get($topicCategory.selectedIndex());
    //   Topics.setCurrentTab(category);
    //   Topics.fetchTopStories();
    //   $scope.topics = Topics.getTopics();
    //   // console.log(category);
    // };

    $scope.doRefresh = function() {
      Topics.fetchTopStories();
    };


    $scope.loadMore = function() {
      // console.log("loadMore");
      Topics.increaseNewTopicsCount(15);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.moreDataCanBeLoaded = function() {
      // console.log(Topics.hasNextPage());
      return Topics.hasNextPage();
    };

    // Create the new topic modal that we will use later
    $ionicModal.fromTemplateUrl('views/topic/newTopic.html', {
      tabs: Tabs,
      scope: $scope
    }).then(function(modal) {
      $scope.newTopicModal = modal;
    });

    $scope.newTopicData = {
      tab: 'share',
      title: '',
      content: ''
    };
    $scope.newTopicId = null;

    // save new topic
    $scope.saveNewTopic = function() {
      $log.debug('new topic data:', $scope.newTopicData);
      $ionicLoading.show();
      Topics.saveNewTopic($scope.newTopicData).$promise.then(function(response) {
        $ionicLoading.hide();
        $scope.newTopicId = response.topic_id;
        $scope.closeNewTopicModal();
        $timeout(function() {
          $state.go('tab.topic-detail', {
            id: $scope.newTopicId
          });
          $timeout(function() {
            $scope.doRefresh();
          }, 300);
        }, 300);
      }, $rootScope.requestErrorHandler);
    };
    $scope.$on('modal.hidden', function() {
      // Execute action
      if ($scope.newTopicId) {
        $timeout(function() {
          $location.path('#/tab/topics/' + $scope.newTopicId);
        }, 300);
      }
    });
    // show new topic modal
    $scope.showNewTopicModal = function() {

      // track view
      if (window.analytics) {
        window.analytics.trackView('new topic view');
      }

      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      $scope.newTopicModal.show();
    };

    // close new topic modal
    $scope.closeNewTopicModal = function() {
      if (window.StatusBar) {
        StatusBar.styleLightContent();
      }
      $scope.newTopicModal.hide();
    };



  })
  .controller('TopicCtrl', function($scope, $rootScope, $state, $timeout, $log,
    $ionicTabsDelegate, $stateParams, $ionicLoading,
    $ionicScrollDelegate, $ionicActionSheet,
    $cordovaSocialSharing, $cordovaGoogleAnalytics,
    Topic, User) {

    // console.table($ionicHistory.viewHistory());

    $scope.finished = false;
    // get current user
    var currentUser = User.getCurrentUser();
    $scope.loginName = currentUser.loginname || null;


    $scope.$on('$ionicView.afterEnter', function() {
      // $rootScope.hideTabs = 'tabs-item-hide';


      document.addEventListener("deviceready", function() {
        // trackView
        $cordovaGoogleAnalytics.trackView('topic view');
      }, false);
    });

    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      // $rootScope.hideTabs = '';
    });




    // $ionicLoading.show({
    //   template: 'Loading...',
    //   noBackdrop: true
    // });

    var halfHeight = null;
    $scope.getHalfHeight = function() {
      if (ionic.Platform.isAndroid()) return 0;
      if (!halfHeight) {
        halfHeight = (document.documentElement.clientHeight / 2) - 200;
      }
      // console.log("halfHeight:"+halfHeight);
      return halfHeight;

    };

    var id = $stateParams.id;

    Topic.getById(id).$promise.then(function(r) {
      // var topic = Topic.getById(id);

      $scope.finished = true;
      $scope.topic = r.data;




      // console.log(r.data);

    });


    // load topic data
    $scope.loadTopic = function(reload) {
      var topicResource;
      if (reload === true) {
        topicResource = Topic.get(id);
      } else {
        topicResource = Topic.getById(id);
      }
      return topicResource.$promise.then(function(response) {
        $scope.topic = response.data;
      }, $rootScope.requestErrorHandler({
        noBackdrop: true
      }, function() {
        $scope.loadError = true;
      }));
    };
    $scope.loadTopic();

    $scope.replyData = {
      content: ''
    };

    $scope.collect = function(topic) {
      // console.log(topic);
      Topic.collect(topic.id).$promise.then(function(response) {
        if (response.success) {
          $ionicLoading.show({
            noBackdrop: true,
            template: '收藏成功',
            duration: 1000
          });
        }
      }, $rootScope.requestErrorHandler);


    };

    $scope.share = function(topic) {
      var message = "测试分享内容",
        subject = topic.title,
        file = null,
        link = "http://ionichina.com/topic/" + topic.id;

      document.addEventListener("deviceready", function() {
        $cordovaSocialSharing
          .share(message, subject, file, link) // Share via native share sheet
          .then(function(result) {
            console.log('result:' + result);
            // Success!
          }, function(err) {
            console.log('err:' + err);
            // An error occured. Show a message to the user
          });
      }, false);
    };

    // save reply
    $scope.saveReply = function() {
      $log.debug('new reply data:', $scope.replyData);
      $ionicLoading.show();
      Topic.saveReply(id, $scope.replyData).$promise.then(function(response) {
        $ionicLoading.hide();
        $scope.replyData.content = '';
        $log.debug('post reply response:', response);
        $scope.loadTopic(true).then(function() {
          $ionicScrollDelegate.scrollBottom();
        });
      }, $rootScope.requestErrorHandler);
    };

    // show actions
    $scope.showActions = function(reply) {

      var currentUser = User.getCurrentUser();
      console.log('currentUser.loginname:' + currentUser.loginname + '   reply.author.loginname:' + reply.author.loginname);
      if (currentUser.loginname === undefined || currentUser.loginname === reply.author.loginname) {
        return;
      }
      $log.debug('action reply:', reply);
      var upLabel = '赞';
      // detect if current user already do up
      if (reply.ups.indexOf(currentUser.id) !== -1) {
        upLabel = '已赞';
      }
      var replyContent = '@' + reply.author.loginname;
      $ionicActionSheet.show({
        buttons: [{
          text: '回复'
        }, {
          text: upLabel
        }],
        titleText: replyContent,
        cancel: function() {},
        buttonClicked: function(index) {

          // reply to someone
          if (index === 0) {
            $scope.replyData.content = replyContent + ' ';
            $scope.replyData.reply_id = reply.id;
            $timeout(function() {
              document.querySelector('.reply-new input').focus();
            }, 1);
          }

          // up reply
          if (index === 1) {
            Topic.upReply(reply.id).$promise.then(function(response) {
              $log.debug('up reply response:', response);
              $ionicLoading.show({
                noBackdrop: true,
                template: response.action === 'up' ? '点赞成功' : '点赞已取消',
                duration: 1000
              });
            }, $rootScope.requestErrorHandler({
              noBackdrop: true,
            }));
          }
          return true;
        }
      });
    };

  })

.factory('Topics', function($resource, $rootScope, Storage, User, ENV) {
    var APIUrl = ENV.api + '/topics',
      // 用来存储话题类别的数据结构，包含了下一页、是否有下一页等属性
      topics = {},
      currentTab = "all";



    var resource = $resource(APIUrl, {}, {
      query: {
        method: 'get',
        params: {
          tab: '@tab',
          page: 1,
          limit: 20,
          mdrender: true
        },
        timeout: 20000
      }
    });


    return {
      fetchTopStories: function() {
        // console.log("currentTab: " + currentTab);
        var hasNextPage = true;
        resource.query({
          tab: currentTab
        }, function(r) {
          // console.log(r);
          if (r.data.length < 20) {
            hasNextPage = false;
          }
          topics[currentTab] = {
            'nextPage': 2,
            'hasNextPage': hasNextPage,
            'data': r.data
          };
          // topics[currentTab] = r.data;
          $rootScope.$broadcast('ioniclub.topicsUpdated', topics[currentTab].data);
          // console.table(topics);

        });

      },
      getTopics: function() {
        return topics[currentTab].data;
      },
      setCurrentTab: function(tab) {
        currentTab = tab;
        this.fetchTopStories();
        // $rootScope.$broadcast('ioniclub.topicsUpdated', topics[currentTab]);
      },
      getCurrentTab: function() {
        return currentTab;
      },
      increaseNewTopicsCount: function() {
        var nextPage = topics[currentTab].nextPage;
        var hasNextPage = topics[currentTab].hasNextPage;
        var topicsData = topics[currentTab].data;
        resource.query({
          tab: currentTab,
          page: nextPage,
          limit: 20,
          mdrender: true

        }, function(r) {
          // console.log(r);
          nextPage++;
          if (r.data.length < 20) {
            hasNextPage = false;
          }
          topicsData = topicsData.concat(r.data);
          topics[currentTab] = {
            'nextPage': nextPage,
            'hasNextPage': hasNextPage,
            'data': topicsData
          };
          // topics[currentTab] = r.data;
          $rootScope.$broadcast('ioniclub.topicsUpdated', topics[currentTab]);
          // console.table(topics);

        });
      },
      hasNextPage: function() {
        if (topics[currentTab] === undefined) {
          return false;
        }
        return topics[currentTab].hasNextPage;
      },
      saveNewTopic: function(newTopicData) {
        var currentUser = User.getCurrentUser();
        return resource.save({
          accesstoken: currentUser.accesstoken
        }, newTopicData);
      }

    };


  })
  .factory('Topic', function($resource, $rootScope, $q, Storage, User, My, ENV) {
    var APIUrl = ENV.api + '/topic/:id',
      topic,
      currentTab = "all";
    var resource = $resource(ENV.api + '/topic/:id', {
      id: '@id',
    }, {
      reply: {
        method: 'post',
        url: ENV.api + '/topic/:topicId/replies'
      },
      upReply: {
        method: 'post',
        url: ENV.api + '/reply/:replyId/ups'
      },
      collect: {
        method: 'post',
        url: ENV.api + '/topic/collect'
      },
      de_collect: {
        method: 'post',
        url: ENV.api + '/topic/de_collect'
      }
    });
    return {
      getById: function(id) {
        // console.log("id:" + id + "   topic:" + topic);
        if (topic !== undefined && topic.id === id) {
          var topicDefer = $q.defer();
          topicDefer.resolve({
            data: topic
          });
          return {
            $promise: topicDefer.promise
          };
        }
        return this.get(id);
      },
      get: function(id) {
        return resource.get({
          id: id
        }, function(response) {
          topic = response.data;
        });

      },
      saveReply: function(topicId, replyData) {
        var reply = angular.extend({}, replyData);
        var currentUser = User.getCurrentUser();
        // add send from
        if (My.getSettings().sendFrom) {
          reply.content = replyData.content + '\n<br/> 发自 [Ioniclub](https://github.com/IonicChina/ioniclub)';
        }
        return resource.reply({
          topicId: topicId,
          accesstoken: currentUser.accesstoken
        }, reply);
      },
      upReply: function(replyId) {
        var currentUser = User.getCurrentUser();
        return resource.upReply({
          replyId: replyId,
          accesstoken: currentUser.accesstoken
        }, null, function(response) {
          if (response.success) {
            angular.forEach(topic.replies, function(reply, key) {
              if (reply.id === replyId) {
                if (response.action === 'up') {
                  reply.ups.push(currentUser.id);
                } else {
                  reply.ups.pop();
                }
              }
            });
          }
        });
      },
      collect: function(topicId) {
        var currentUser = User.getCurrentUser();
        return resource.collect({
          topic_id: topicId,
          accesstoken: currentUser.accesstoken
        });
      },
      de_collect: function(topicId) {
        var currentUser = User.getCurrentUser();
        return resource.de_collect({
          topic_id: topicId,
          accesstoken: currentUser.accesstoken
        });
      }
    };

  });
