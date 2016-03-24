'use strict';

angular.module('feeds-directives', []).directive('feed', ['feedService', '$compile', '$templateCache', '$http', function(feedService, $compile, $templateCache, $http) {
  return {
    restrict: 'E',
    transclude: true,
    controller: ['$scope', '$element', '$attrs', '$timeout', '$transclude', function($scope, $element, $attrs, $timeout, $transclude) {
      $scope.$watch('finishedLoading', function(value) {
        if ($attrs.postRender && value) {
          $timeout(function() {
            new Function("element", $attrs.postRender + '(element);')($element);
          }, 0);
        }
      });

      $scope.feeds = [];

      function refreshFeed(url) {
        feedService.getFeeds(url, $attrs.count).then(function(feedsObj) {
          if (feedsObj) {
            $scope.feeds = [];
            $scope.error = false;
            for (var i = 0; i < feedsObj.length; i++) {
              $scope.feeds.push(feedsObj[i]);
            }
          }

          $transclude($scope, function(transEl) {
            $element.append(transEl);
          });
        }, function(error) {
          console.error('Error loading feed ', error);
          $scope.error = error;
        }).finally(function() {
          $element.find('.spinner').slideUp();
          $scope.$evalAsync('finishedLoading = true');
        });
      }

      $scope.$refreshFeed = function() {
        if ($scope.feedUrl) {
          refreshFeed($scope.feedUrl);
        }
      };

      var spinner = $templateCache.get('feed-spinner.html');
      $element.append($compile(spinner)($scope));

      $attrs.$observe('url', function(url) {
        if (!url) return;
        $scope.feedUrl = url;
        refreshFeed($scope.feedUrl);
      });
    }]
  };
}]);
