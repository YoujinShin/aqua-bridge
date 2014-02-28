var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define astronaut schema
var SmsSchema = new Schema({
	sender : String,
	message : String,
    lastupdated : { type: Date, default: Date.now },
});

// export 'Astronaut' model
module.exports = mongoose.model('Sms', SmsSchema);