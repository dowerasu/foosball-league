var express = require('express');
var app = express();
var serverConfig = require('./config/server');
var port = process.env.PORT || serverConfig.port;

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);

var CronJob = require('cron').CronJob;
new CronJob('* * * * * *', function () {
//  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');

//sockets stuff
var http = require('http').Server(app);
var io = require('socket.io')(http);

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(express.static(__dirname + '/public'));

app.use(morgan(serverConfig.env));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: serverConfig.secret,
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({mongooseConnection: mongoose.connection,
    ttl: serverConfig.ttl})}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('view engine', 'ejs');

var api = express.Router();
require('./app/routes/api.js')(api, passport);
app.use('/api', api);

var auth = express.Router();
require('./app/routes/auth.js')(auth, passport);
app.use('/auth', auth);

var secure = express.Router();
require('./app/routes/secure.js')(secure, passport);
app.use('/', secure);

var User = require('./app/models/user');
var Message = require('./app/models/message');
var Player = require('./app/models/player');

var currentPlayers = null;

io.on('connection', function (socket) {

  Message.find(function (err, messages) {
    if (err)
      return console.error(err);
    io.emit('messages', messages);
  });
  Player.find(function (err, players) {
    if (err) {
      return console.error(err);
    }

    if (currentPlayers !== null) {
//      players = currentPlayers;
    }
    
    io.emit('players', players);
  });

  socket.on('message', function (data) {
//    for (var index = 0; index < 4; index++) {
//      var newPlayer = new Player({userId: '0', status: false});
//      newPlayer.save(function (err, newPlayer) {
//        console.log('player saved');
//      });
//    }

    User.findById(data.userId, function (err, user) {
      var newMessage = new Message({'user': user, message: data.message});
      newMessage.save(function (err, newMessage) {
        if (err)
          return console.error(err);
        io.emit('message', {'user': user, message: data.message, date: new Date()});
      });
    });
  });

  socket.on('statusChange', function (data) {
    if (data.playerIndex < 0 || data.playerIndex > 3) {
      return console.error('Invalid player index: ' + data.playerIndex);
    }

    //@todo: compare userId with session data

    User.findById(data.userId, function (err, user) {
      Player.findOneAndUpdate({'_id': data.playerId}, {'user': user, 'status': data.status}, {upsert: true}, function (err, doc) {
        if (err)
          return console.error(err);
      });

      io.emit('statusChange', {'user': user, playerIndex: data.playerIndex, status: data.status});
    });
  });

  socket.on('readyToPlay', function () {
    setTimeout(function () {
      currentPlayers = [];
//      io.emit('players', currentPlayers);
    }, serverConfig.gameSessionTime);
  });

  socket.on('disconnect', function () {
    console.log('lost connection');
  });
});

http.listen(port);
console.log('Server running on port: ' + port);