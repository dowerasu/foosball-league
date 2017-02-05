myApp.controller('page1Controller', ['$scope', 'Socket', function($scope, Socket){
	Socket.connect();
	
	console.log('page1Controller');
	
	$scope.messages = [];
	
	$scope.sendMessage = function(msg) {
		console.log(msg);
		if (msg !== null && msg !== '') {
			Socket.emit('message', {username: $scope.userId, message: msg});
		}
		$scope.message = '';
	};
	
	Socket.on('message', function(data) {
		console.log(data);
		$scope.messages.push(data);
	});
	
	$scope.$on('$locationChangeStart', function(event) {
		//Socket.disconnect(true);
	});
}]);