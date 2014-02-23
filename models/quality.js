var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define astronaut schema
var QualitySchema = new Schema({
    slug : { type: String, lowercase: true, required: true, unique: true },
	reference : { type: String, required: true},
	installdate : Date,
	//photo : String,
	photo: String,
	qualitydata : {
		colilert: Boolean,
		petrifilm: String,
		boilert: String
	},
    lastupdated : { type: Date, default: Date.now },
});

// export 'Astronaut' model
module.exports = mongoose.model('Quality', QualitySchema);