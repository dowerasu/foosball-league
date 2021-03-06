var express = require('express');
var app = express();
var port = process.env.PORT || 9001;

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);

//sockets stuff
var http = require('http').Server(app);
var io = require('socket.io')(http);

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'anystringoftext',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({mongooseConnection: mongoose.connection,
    ttl: 2 * 24 * 60 * 60})}));

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

io.on('connection', function (socket) {

  Message.find(function (err, messages) {
    if (err)
      return console.error(err);
    io.emit('messages', messages);
  });
  Player.find(function (err, players) {
    if (err)
      return console.error(err);
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
    
    User.findById(data.userId, function (err, user) {
      Player.findOneAndUpdate({'_id': data.playerId}, {'user': user, 'status': data.status}, {upsert: true}, function (err, doc) {
        if (err)
          return console.error(err);
      });

      io.emit('statusChange', {'user': user, playerIndex: data.playerIndex, status: data.status});
    });    
  });

  socket.on('disconnect', function () {
    console.log('lost connection');
  });
});

http.listen(port);
console.log('Server running on port: ' + port);