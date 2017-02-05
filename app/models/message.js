var mongoose = require('mongoose');
var messageSchema = mongoose.Schema({
	user: {},
	message: String,
	date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);