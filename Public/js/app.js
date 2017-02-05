var myApp = angular.module('myApp', [
  'ngRoute', 'btford.socket-io']);
//.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
//	$routeProvider.when('/page1', {template: 'page1', controller: 'page1Controller'});
//	$routeProvider.otherwise({redirectTo: '/home'});
//	$locationProvider.html5Mode({enabled: true, requireBase: false});
//}]);