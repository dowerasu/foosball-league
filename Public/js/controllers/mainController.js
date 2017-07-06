myApp.controller('mainController', ['$scope', 'Socket', function ($scope, Socket) {
    Socket.connect();

    var notifyMe = function (message) {
      if (!("Notification" in window)) {

      } else if (Notification.permission === "granted") {
        var notification = new Notification(message);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          if (permission === "granted") {
            var notification = new Notification(message);
          }
        });
      }
    };

    var checkReadyStatus = function () {
      var readyToPlay = true;
      for (var index = 0; index < 4; index++) {
        if (!$scope.players[index].status) {
          readyToPlay = false;
        }
      }

      return readyToPlay;
    };

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    $scope.players = [];

    var userId = document.getElementById('user-id').value;

    Socket.on('players', function (data) {
      $scope.players = data;
      if (checkReadyStatus()) {
        notifyMe('GO GO GO');
        Socket.emit('readyToPlay', {});
      }
    });

    $scope.messages = [];

    Socket.on('messages', function (data) {
      $scope.messages = data;
    });

    $scope.sendMessage = function (msg) {
      if (msg !== null && msg !== '') {
        Socket.emit('message', {userId: userId, message: msg});
      }
      $scope.message = '';
    };

    Socket.on('message', function (data) {
      $scope.messages.push(data);
    });

    $scope.togglePlayerStatus = function (playerIndex, playerId) {
      var status = false;
      if ($scope.players[playerIndex].status) {
        status = true;
      } else if ($scope.players[playerIndex].user._id !== userId) {
        status = true;
      }
      Socket.emit('statusChange', {'playerIndex': playerIndex, 'userId': userId, 'playerId': playerId, 'status': status});
    };

    Socket.on('statusChange', function (data) {
      $scope.players[data.playerIndex].status = data.status;
      var readyToPlay = checkReadyStatus();
      
      if (readyToPlay)  {
        Socket.emit('readyToPlay', {});
      }
     
      if (data.user._id !== userId && readyToPlay) {
        notifyMe('GO GO GO');
      }
    });

    //$scope.$on('$locationChangeStart', function(event) {
    //	Socket.disconnect(true);
    //});

  }]);