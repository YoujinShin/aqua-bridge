var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define astronaut schema
var QualitySchema = new Schema({
    slug : { type: String, lowercase: true, required: true, unique: true },
		reference : { type: String, required: true},
		installdate : Date,
		colilert: String,
		// petrifilm: String,
		petrifilm_blue: Number,
		petrifilm_red: Number,
		geometry : {
			type : { type: String },
			coordinates : []
		},
    lastupdated : { type: Date, default: Date.now },
});

// export 'Astronaut' model
module.exports = mongoose.model('Quality', QualitySchema);