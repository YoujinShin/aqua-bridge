var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QualitySchema = new Schema({
	slug : { type: String, lowercase: true, required: true, unique: true },
	type : { type: String },
	properties : {
		reference : { type: String, required: true},
		installdate : Date,
		colilert: String,
		petrifilm_blue: Number,
		petrifilm_red: Number,
		lastupdated : { type: Date, default: Date.now }
	},
	geometry : {
		type : { type: String },
		coordinates : [Number]
	}
});

// QualitySchema.index({ geometry: '2dsphere' });
module.exports = mongoose.model('Quality', QualitySchema);

