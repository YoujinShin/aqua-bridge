/*
 * routes/index.js
 * Routes contains the functions (callbacks) associated with request urls.
 */

var request = require('request'); // library to make requests to remote urls
var moment = require("moment"); // date manipulation library
var qualityModel = require("../models/quality.js"); //db model
var filterModel = require("../models/quality_tanzania.js"); //db model
var smsModel = require("../models/sms.js");
//var astronautModel = require("../models/astronaut.js"); //db model

var Twilio = require('twilio-js');
Twilio.AccountSid = 'AC057a2d8192eae97fdafe9dbc6c688dc6';
Twilio.AuthToken  = '086057d5fc72ca6b195f967fce2ba375';

exports.index = function(req, res) {
	console.log("main page requested");
	res.render('index_new.html');
	// res.render('index.html');
}

exports.aboutus = function(req, res) {
	console.log("about us page requested");
	res.render('aboutus.html');
}

exports.history_aqua = function(req, res) {
	console.log("history page requested");
	res.render('history.html');
}

exports.tech = function(req, res) {
	console.log("tech page requested");
	res.render('tech.html');
}

exports.area = function(req, res) {
	console.log("area page requested");
	res.render('area.html');
}

exports.team = function(req, res) {
	console.log("team page requested");
	res.render('team.html');
}

exports.contact = function(req, res) {
	console.log("contact page requested");
	// res.render('contact.html');
	res.render('clickmap.html');
}

// CURRENT PROJECTS
exports.project_summary = function(req, res) {
	console.log("project summary page requested");
	res.render('project_summary.html');
}
exports.tanzania = function(req, res) {
	console.log("tanzania page requested");
	res.render('tanzania.html');
}
exports.ghana = function(req, res) {
	console.log("ghana page requested");
	res.render('ghana.html');
}
exports.nigeria = function(req, res) {
	console.log("nigeria page requested");
	res.render('nigeria.html');
}

// RECENT NEWS
exports.news = function(req, res) {
	console.log("recent news page requested");
	res.render('news.html');
}

// water quality data
exports.water = function(req, res) {
	console.log("water quality input page requested");
	res.render('water_form.html');
}

exports.watertest = function(req, res) {
	console.log("water quality test quid page requested");
	res.render('watertest.html');
}

exports.createWater = function(req, res) {
	console.log("received water data form submission");
	console.log(req.body);
	var date = moment(this.date), formatted = date.format('YY[-]MM[-]DD[_]HH[:]mm[:]ss[_]');

	var newQuality = new qualityModel({
		slug : formatted + req.body.reference.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_'),
		type : "Feature",
		properties : {
			reference : req.body.reference,
			colilert : req.body.colilert,
			petrifilm_blue : parseFloat(req.body.petrifilm_blue),
			petrifilm_red : parseFloat(req.body.petrifilm_red),
			testdate : req.body.testdate
		},
		geometry : {
			type : "Point",
			coordinates : [parseFloat(req.body.lon), parseFloat(req.body.lat)]
		} 
	});

	if(req.body.sourcetype == "other") {
		newQuality.properties.sourcetype = req.body.sourcetype_other;
		// console.log(req.body.sourcetype_other);
	} else {
		newQuality.properties.sourcetype = req.body.sourcetype;
	}

	// save the new quality to the database
	if(req.body.password == "aquabridge") {
		newQuality.save(function(err){
			if (err) {
				console.error("Error on saving new water quality data");
				console.error(err); // log out to Terminal all errors

				var templateData = {
					page_title : 'Enlist a new quality',
					errors : err.errors, 
					quality : req.body
				};
				res.render('water_form.html', templateData);
				// return res.send("There was an error when creating a new astronaut");
			} else {
				console.log("Created a new quality!");
				console.log(newQuality);
				// res.redirect('/datamapping');
				res.redirect('/quality/'+ newQuality.slug);
				// res.redirect('/password_err');
			}
		});
	}  else {
				console.log("Created a new quality!");
				console.log(newQuality);
				// res.redirect('/datamapping');
				res.redirect('/quality/'+ newQuality.slug);
	};
}

exports.password_err = function(req, res) {
	console.log("wrong password warning page requested");
	res.render('password_err.html');
}

exports.oneWater = function(req, res) {
	console.log("one water data page requested for " + req.params.quality_id);
	var quality_id = req.params.quality_id; //get the requested astronaut by the param on the url :quality_id
	var qualityQuery = qualityModel.findOne({slug:quality_id}); // query the database for astronaut
	// console.log(qualityQuery);
	
	qualityQuery.exec(function(err, currentQuality){
		if (err) {
			return res.status(500).send("There was an error on the quality query");
		}
		if (currentQuality == null) {
			return res.status(404).render('404.html');
		}
		console.log("Found quality");
		console.log(currentQuality.reference);

		var templateData = {
			quality : currentQuality,
			pageTitle : currentQuality.reference
		}
		res.render('oneWater.html', templateData);
	}); 
}

exports.allwater = function(req, res) { 
	console.log("all quality data retrieved");
	qualityQuery = qualityModel.find({}); // query for all quality

	qualityQuery.exec(function(err, allQuality){
		// prepare data for JSON
		var jsonData = {
			status : 'OK',
			quality : allQuality
		}
		res.json(jsonData);
	});
}

exports.adminwater = function(req, res) {
	console.log("admin water form requested");
	qualityQuery = qualityModel.find({}); // query for all quality

	qualityQuery.exec(function(err, allQuality){
		console.log("retrieved all water : " + allQuality.length);

		var templateData = {
			status : 'OK',
			quality : allQuality
		}
		res.render('adminwater.html', templateData);
	});
}

exports.deleteallwater = function(req, res) {
	console.log("delete all water requested");
	qualityModel.remove(function(err) {
		if (err){ 
			console.error(err);
			res.send("all water data is deleted");
		}
	});
}

exports.deletewater = function(req,res) {
	console.log("delete one water requested for "+ req.params.quality_id);
	var quality_id = req.params.quality_id;

	qualityModel.remove({slug:quality_id}, function(err){
		if (err){ 
			console.error(err);
			res.send("Error when trying to remove quality: "+ quality_id);
		}
		res.send("Removed quality. <a href='/'>Back to home</a>.");
	});
};

// Filter performance data ////////////////////////////////////////////////
exports.filter_tanzania = function(req, res) {
	console.log("filter tanzania requested");
	res.render('filter_tanzania.html');
}

exports.createFilter = function(req, res) {
	console.log("received filter data form submission");
	console.log(req.body);
	var date = moment(this.date), formatted = date.format('YY[-]MM[-]DD[_]HH[:]mm[:]ss[_]');
	console.log(date);

	var newFilter = new filterModel({
		slug : formatted + req.body.reference.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_'),
		type : "Feature",
		properties : {
			reference : req.body.reference,
			colilert : req.body.colilert,
			petrifilm_blue : parseFloat(req.body.petrifilm_blue),
			petrifilm_red : parseFloat(req.body.petrifilm_red),
			testdate : req.body.testdate
		},
		geometry : {
			type : "Point",
			coordinates : [parseFloat(req.body.lon), parseFloat(req.body.lat)]
		} 
	});

	if(req.body.sourcetype == "other") {
		newFilter.properties.sourcetype = req.body.sourcetype_other;
		// console.log(req.body.sourcetype_other);
	} else {
		newFilter.properties.sourcetype = req.body.sourcetype;
	}

	// save the new quality to the database
	if(req.body.password == "tanzania") {
		newFilter.save(function(err){
			if (err) {
				console.error("Error on saving new water filter data");
				console.error(err); // log out to Terminal all errors

				var templateData = {
					page_title : 'Enlist a new filter',
					errors : err.errors, 
					filter : req.body
				};
				res.render('filter_tanzania.html', templateData);
				// return res.send("There was an error when creating a new astronaut");
			} else {
				console.log("Created a new filter!");
				// console.log(newQuality);
				// res.redirect('/datamapping');
				res.redirect('/filter/'+ newFilter.slug);
				// res.redirect('/password_err');
			}
		});
	}  else {
				console.log("Created a new filter!");
				// console.log(newQuality);
				// res.redirect('/datamapping');
				res.redirect('/filter/'+ newFilter.slug);
	};
}

exports.oneFilter = function(req, res) {
	console.log("one filter data page requested for " + req.params.filter_id);
	var filter_id = req.params.filter_id; //get the requested astronaut by the param on the url :quality_id
	var filterQuery = filterModel.findOne({slug:filter_id}); // query the database for astronaut
	// console.log(qualityQuery);
	
	filterQuery.exec(function(err, currentFilter){
		if (err) {
			return res.status(500).send("There was an error on the filter query");
		}
		if (currentFilter == null) {
			return res.status(404).render('404.html');
		}
		console.log("Found filter");
		console.log(currentFilter.reference);

		var templateData = {
			filter : currentFilter,
			pageTitle : currentFilter.reference
		}
		res.render('oneFilter.html', templateData);
	}); 
}

exports.allfilter = function(req, res) { 
	console.log("all filter data retrieved");
	filterQuery = filterModel.find({}); // query for all quality

	filterQuery.exec(function(err, allFilter){
		// prepare data for JSON
		var jsonData = {
			status : 'OK',
			filter : allFilter
		}
		res.json(jsonData);
	});
}

// JSON SMS DATA ///////////////////////////////////////////////////////////
exports.allsms = function(req, res) {
	console.log("all sms data retrieved");
	smsQuery = smsModel.find({}); // query for all sms
	smsQuery.select('sender message lastupdated');
	
	smsQuery.exec(function(err, allsms){
		// prepare data for JSON
		var jsonData = {
			status : 'OK',
			sms : allsms
		}
		res.json(jsonData);
	});
}

// SMS ON THE WEB
exports.sms = function(req, res) {
	console.log("sms page requested");
	smsQuery = smsModel.find({}); // query for all sms

	smsQuery.exec(function(err, allsms){
		console.log("retrieved all sms : " + allsms.length);

		// prepare data for JSON
		var templateData = {
			status : 'OK',
			sms : allsms
		}
		res.render('sms.html', templateData);
	});

	// all texts from Twilio database
	// Twilio.SMS.all(function(err, res) { 
	// 	// console.log('body : ' + res.smsMessages[0].body);
	// 	console.log(res.smsMessages);
	// }, {accountSid: Twilio.AccountSid, to: '+13479605166'}); //+16464309130
	//res.render("sms.html");
}

exports.incoming = function(req, res) {
	console.log("incoming sms");

	var t_message = req.body.Body;
 	var t_sender = req.body.From;
	var date = moment(this.date), formatted = date.format('YY[-]MM[-]DD[_]HH[:]mm[:]ss[_]');
	// formatted results in the format '14-02-01_06:11:20_sms'

	var mySms = new smsModel({
		message: req.body.Body,
		sender: req.body.From,
		slug : formatted + t_sender.replace(/[^\w\-]+/g, '') // Remove all non-word chars (fotmatted)
	});

	mySms.save(function(err){ // save the mySms to the database
		if (err) {
			console.error("Error on saving new sms data");
			console.error(err); // log out to Terminal all errors	
		} else {
			console.log("Created a new sms data!");
			console.log(mySms);
		}
	});

    // Sms back to the sender
	Twilio.SMS.create({to: t_sender, from: '+16463621117', body: t_message + ' >> Thanks, AQUA-BRIDGE', accountSid: 'AC057a2d8192eae97fdafe9dbc6c688dc6', connect: true}, function(err,res) {
		console.log('SMS Sent!');
	});
}

exports.deleteallsms = function(req, res) {
	console.log("delete all sms requested");
	smsModel.remove(function(err) {
		if (err){ 
			console.error(err);
			res.send("all sms data is deleted");
		}
	});
}

exports.dataviz = function(req, res) {
	console.log("data viz page requested");
	res.render("piechart.html");
	// res.render("piechart2.html");
	// res.render("cloud2.html");
}

exports.datamapping = function(req, res) {
	console.log("data mapping page requested");
	qualityQuery = qualityModel.find({}); // query for all sms

	qualityQuery.exec(function(err, allQuality){
		console.log("retrieved all water : " + allQuality.length);

		var templateData = {
			status : 'OK',
			quality : allQuality
		}
		// res.render('datamapping.html', templateData);
		res.render('datamapping_cluster.html', templateData);
	});

	// smsQuery = smsModel.find({}); // query for all sms

	// smsQuery.exec(function(err, allsms){
	// 	console.log("retrieved all sms : " + allsms.length);

	// 	// prepare data for JSON
	// 	var templateData = {
	// 		status : 'OK',
	// 		sms : allsms
	// 	}
	// 	res.render('sms.html', templateData);
	// });
	
	
	// qualityQuery = qualityModel.find({}); // query for all quality

	// qualityQuery.exec(function(err, allQuality){
	// 	// prepare data for JSON
	// 	var jsonData = {
	// 		status : 'OK',
	// 		quality : allQuality
	// 	}
	// 	res.json(jsonData);
	// });
}

exports.getjson = function(req, res) {
	console.log("getjson page requested");
	res.render("getjson.html");
}

exports.worldmap = function(req, res) {
	console.log("world water quality map requested");
	res.render("worldmap.html");
}


/*
exports.index = function(req, res) {

	console.log("main page resquested");
	res.render('index.html');

	console.log("main page requested");

	// query for all astronauts
	// .find will accept 3 arguments
	// 1) an object for filtering {} (empty here)
	// 2) a string of properties to be return, 'name slug source' will return only the name, slug and source returned astronauts
	// 3) callback function with (err, results)
	//    err will include any error that occurred
	//	  allAstros is our resulting array of astronauts
	
	astronautModel.find({}, 'name slug source', function(err, allAstros){

		if (err) {
			res.send("Unable to query database for astronauts").status(500);
		};
		console.log("retrieved " + allAstros.length + " astronauts from database");

		//build and render template
		var templateData = {
			astros : allAstros,
			pageTitle : "NASA Astronauts (" + allAstros.length + ")"
		}

		res.render('index.html', templateData);
	});
}

exports.data_all = function(req, res) {

	astroQuery = astronautModel.find({}); // query for all astronauts
	astroQuery.sort('-birthdate');
	
	// display only 3 fields from astronaut data
	astroQuery.select('name photo birthdate');
	
	astroQuery.exec(function(err, allAstros){
		// prepare data for JSON
		var jsonData = {
			status : 'OK',
			astros : allAstros	
		}

		res.json(jsonData);
	});
}


exports.detail = function(req, res) {

	console.log("detail page requested for " + req.params.astro_id);

	//get the requested astronaut by the param on the url :astro_id
	var astro_id = req.params.astro_id;

	// query the database for astronaut
	var astroQuery = astronautModel.findOne({slug:astro_id});
	astroQuery.exec(function(err, currentAstronaut){

		if (err) {
			return res.status(500).send("There was an error on the astronaut query");
		}

		if (currentAstronaut == null) {
			return res.status(404).render('404.html');
		}

		console.log("Found astro");
		console.log(currentAstronaut.name);

		// formattedBirthdate function for currentAstronaut
		currentAstronaut.formattedBirthdate = function() {
			// formatting a JS date with moment
			// http://momentjs.com/docs/#/displaying/format/
            return moment(this.birthdate).format("dddd, MMMM Do YYYY");
        };
		
		//query for all astronauts, return only name and slug
		astronautModel.find({}, 'name slug', function(err, allAstros){

			console.log("retrieved all astronauts : " + allAstros.length);

			//prepare template data for view
			var templateData = {
				astro : currentAstronaut,
				astros : allAstros,
				pageTitle : currentAstronaut.name
			}

			// render and return the template
			res.render('detail.html', templateData);

		}) // end of .find (all) query
		
	}); // end of .findOne query

}

exports.data_detail = function(req, res) {

	console.log("detail page requested for " + req.params.astro_id);

	//get the requested astronaut by the param on the url :astro_id
	var astro_id = req.params.astro_id;

	// query the database for astronaut
	var astroQuery = astronautModel.findOne({slug:astro_id});
	astroQuery.exec(function(err, currentAstronaut){

		if (err) {
			return res.status(500).send("There was an error on the astronaut query");
		}

		if (currentAstronaut == null) {
			return res.status(404).render('404.html');
		}

		// formattedBirthdate function for currentAstronaut
		currentAstronaut.formattedBirthdate = function() {
			// formatting a JS date with moment
			// http://momentjs.com/docs/#/displaying/format/
            return moment(this.birthdate).format("dddd, MMMM Do YYYY");
        };
		
		//prepare JSON data for response
		var jsonData = {
			astro : currentAstronaut,
			status : 'OK'
		}

		// return JSON to requestor
		res.json(jsonData);

	}); // end of .findOne query

}

exports.astroForm = function(req, res){

	var templateData = {
		page_title : 'Enlist a new astronaut'
	};

	res.render('create_form.html', templateData);
}


exports.createAstro = function(req, res) {
	
	console.log("received form submission");
	console.log(req.body);

	// accept form post data
	var newAstro = new astronautModel({
		name : req.body.name,
		photo : req.body.photoUrl,
		source : {
			name : req.body.source_name,
			url : req.body.source_url
		},
		slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')

	});

	// you can also add properties with the . (dot) notation
	if (req.body.birthdate) {
		newAstro.birthdate = moment(req.body.birthdate).toDate();
	}

	newAstro.skills = req.body.skills.split(",");

	// walked on moon checkbox
	if (req.body.walkedonmoon) {
		newAstro.walkedOnMoon = true;
	}
	
	// save the newAstro to the database
	newAstro.save(function(err){
		if (err) {
			console.error("Error on saving new astronaut");
			console.error(err); // log out to Terminal all errors

			var templateData = {
				page_title : 'Enlist a new astronaut',
				errors : err.errors, 
				astro : req.body
			};

			res.render('create_form.html', templateData);
			// return res.send("There was an error when creating a new astronaut");

		} else {
			console.log("Created a new astronaut!");
			console.log(newAstro);
			
			// redirect to the astronaut's page
			res.redirect('/astronauts/'+ newAstro.slug)
		}
	});
};

exports.editAstroForm = function(req, res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;
	var astroQuery = astronautModel.findOne({slug:astro_id});
	astroQuery.exec(function(err, astronaut){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ astro_id).status(500);
		}

		if (astronaut != null) {

			// birthdateForm function for edit form
			// html input type=date needs YYYY-MM-DD format
			astronaut.birthdateForm = function() {
					return moment(this.birthdate).format("YYYY-MM-DD");
			}

			// prepare template data
			var templateData = {
				astro : astronaut
			};

			// render template
			res.render('edit_form.html',templateData);

		} else {

			console.log("unable to find astronaut: " + astro_id);
			return res.status(404).render('404.html');
		}

	})

}

exports.updateAstro = function(req, res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;

	// prepare form data
	var updatedData = {
		name : req.body.name,
		photo : req.body.photoUrl,
		source : {
			name : req.body.source_name,
			url : req.body.source_url
		},
		birthdate : moment(req.body.birthdate).toDate(),
		skills : req.body.skills.split(","),

		walkedOnMoon : (req.body.walkedonmoon) ? true : false
		
	}


	// query for astronaut
	astronautModel.update({slug:astro_id}, { $set: updatedData}, function(err, astronaut){

		if (err) {
			console.error("ERROR: While updating");
			console.error(err);			
		}

		if (astronaut != null) {
			res.redirect('/astronauts/' + astro_id);

		} else {

			// unable to find astronaut, return 404
			console.error("unable to find astronaut: " + astro_id);
			return res.status(404).render('404.html');
		}
	})
}

exports.postShipLog = function(req, res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;

	// query database for astronaut
	astronautModel.findOne({slug:astro_id}, function(err, astronaut){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ astro_id).status(500);
		}

		if (astronaut != null) {

			// found the astronaut

			// concatenate submitted date field + time field
			var datetimestr = req.body.logdate + " " + req.body.logtime;

			console.log(datetimestr);
			
			// add a new shiplog
			var logData = {
				date : moment(datetimestr, "YYYY-MM-DD HH:mm").toDate(),
				content : req.body.logcontent
			};

			console.log("new ship log");
			console.log(logData);

			astronaut.shiplogs.push(logData);
			astronaut.save(function(err){
				if (err) {
					console.error(err);
					res.send(err.message);
				}
			});

			res.redirect('/astronauts/' + astro_id);


		} else {

			// unable to find astronaut, return 404
			console.error("unable to find astronaut: " + astro_id);
			return res.status(404).render('404.html');
		}
	})
}

exports.deleteAstro = function(req,res) {

	// Get astronaut from URL params
	var astro_id = req.params.astro_id;

	// if querystring has confirm=yes, delete record
	// else display the confirm page

	if (req.query.confirm == 'yes')  {  // ?confirm=yes
	
		astronautModel.remove({slug:astro_id}, function(err){
			if (err){ 
				console.error(err);
				res.send("Error when trying to remove astronaut: "+ astro_id);
			}

			res.send("Removed astronaut. <a href='/'>Back to home</a>.");
		});

	} else {
		//query astronaut and display confirm page
		astronautModel.findOne({slug:astro_id}, function(err, astronaut){

			if (err) {
				console.error("ERROR");
				console.error(err);
				res.send("There was an error querying for "+ astro_id).status(500);
			}

			if (astronaut != null) {

				var templateData = {
					astro : astronaut
				};
				
				res.render('delete_confirm.html', templateData);
			
			}
		})

	}
};

exports.remote_api = function(req, res) {

	var remote_api_url = 'http://itpdwdexpresstemplates.herokuapp.com/data/astronauts';
	// var remote_api_url = 'http://localhost:5000/data/astronauts';

	// make a request to remote_api_url
	request.get(remote_api_url, function(error, response, data){
		
		if (error){
			res.send("There was an error requesting remote api url.");
			return;
		}

		// Step 2 - convert 'data' to JS
		// convert data JSON string to native JS object
		var apiData = JSON.parse(data);

		console.log(apiData);
		console.log("***********");


		// STEP 3  - check status / respond
		// if apiData has property 'status == OK' then successful api request
		if (apiData.status == 'OK') {

			// prepare template data for remote_api_demo.html template
			var templateData = {
				astronauts : apiData.astros,
				rawJSON : data, 
				remote_url : remote_api_url
			}

			return res.render('remote_api_demo.html', templateData);
		}	
	})
};

exports.set_session = function(req, res) {

	// set the session with the submitted form data
	req.session.userName = req.body.name;
	req.session.userColor = req.body.fav_color;

	// redirect back to where they came from
	console.log(req.referrer);
	res.redirect('/');

}
*/

