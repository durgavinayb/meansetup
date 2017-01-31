var app = angular.module('App', ['ngResource', 'ngRoute']);


app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.html5Mode({
    enabled: true
  });

  $routeProvider
    .when('/', { templateUrl: '/partials/main', controller: 'MainController'});

});

app.controller('MainController', function($scope) {
  $scope.myVar = "He llo Angular";
});