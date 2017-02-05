var mongoose = require('mongoose');
var playerSchema = mongoose.Schema({
	user: {},
	status: Boolean
});

module.exports = mongoose.model('Player', playerSchema);