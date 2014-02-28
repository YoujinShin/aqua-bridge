var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define astronaut schema
var SmsSchema = new Schema({
	slug : { type: String, lowercase: true, required: true, unique: true },
	sender : String,
	message : String,
    lastupdated : { type: Date, default: Date.now },
});

// export 'Astronaut' model
module.exports = mongoose.model('Sms', SmsSchema);