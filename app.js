/**
 * Module dependencies.
 * aqua-framework.herokuapp.com
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

// cartoDB
// var CartoDB = require('cartodb');
var secret = require('./secret.js');

// the ExpressJS App
var app = express();

// configuration of port, templates (/views), static files (/public)
// and other expressjs settings for the web server.
app.configure(function(){

  // server port number
  app.set('port', process.env.PORT || 5000);

  //  templates directory to 'views'
  app.set('views', __dirname + '/views');

  // setup template engine - we're using Hogan-Express
  app.set('view engine', 'html');
  app.set('layout','layout');
  app.engine('html', require('hogan-express')); // https://github.com/vol4ok/hogan-express

  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // pass a secret to cookieParser() for signed cookies
  app.use(express.cookieParser('SECRET_COOKIE_HASH_HERE'));
  app.use(express.cookieSession()); // add req.session cookie support
  
  // make sesssion information available to all templates
  app.use(function(req, res, next){
    res.locals.sessionUserName = req.session.userName;
    res.locals.sessionUserColor = req.session.userColor;
    next();
  });

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // database - skipping until week 5
  app.db = mongoose.connect(process.env.MONGOLAB_URI);
  console.log("connected to database");
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* 
SKIPPING FOR FUTURE CLASSES
SESSIONS w/ MongoDB (store sessions across multiple dynos)
COOKIEHASH in your .env file (also share with heroku) 
*/
// app.use(express.cookieParser(process.env.COOKIEHASH));
// app.use(express.session({ 
//     store: new mongoStore({url:process.env.MONGOLAB_URI, maxAge: 300000})
//     , secret: process.env.COOKIEHASH
//   })
// );


// ROUTES
var routes = require('./routes/index.js');
// cartoDB
// var client = new CartoDB({user: secret.USER,api_key: secret.API_KEY});

app.get('/', routes.index);

app.get('/aboutus', routes.aboutus);
app.get('/history_aqua', routes.history_aqua);
app.get('/tech', routes.tech);
app.get('/team', routes.team);
app.get('/contact', routes.contact);

app.get('/area', routes.area);

app.get('/project_summary', routes.project_summary);

app.get('/news', routes.news);

// water quality data  
app.get('/water', routes.water); // display form
app.post('/createWater', routes.createWater); //form POST submits here
app.get('/allwater', routes.allwater); // json - retreive all quality data from database

// display a single quality data
app.get('/quality/:quality_id', routes.oneWater);


// delete a single quality data
app.get('/adminwater', routes.adminwater);
app.get('/quality/:quality_id/delete', routes.deletewater);
// app.get('/delete_allwater', routes.deleteallwater);

// sms data
app.get('/sms', routes.sms);
app.post('/incoming', routes.incoming); // get sms from Twilio
app.get('/allsms', routes.allsms); // json - retreive all sms from database

// delete sms data
// app.get('/delete_allsms', routes.deleteallsms); 

// visualize data
app.get('/dataviz', routes.dataviz); // data visualization
app.get('/datamapping', routes.datamapping); // data mapping

// visualize world water quality map
app.get('/worldmap', routes.worldmap);

// get JSON data
app.get('/getjson', routes.getjson);

/*
//new astronaut routes
app.get('/create',routes.astroForm); //display form
app.post('/create',routes.createAstro); //form POST submits here

// display a single astronaut
app.get('/astronauts/:astro_id', routes.detail);

// edit astronaut
app.get('/astronauts/:astro_id/edit', routes.editAstroForm); //GET display form
app.post('/astronauts/:astro_id/edit', routes.updateAstro); //POST update database

// delete astronaut
app.get('/astronauts/:astro_id/delete', routes.deleteAstro);

// add ship's log
app.post('/astronauts/:astro_id/addshiplog', routes.postShipLog);

// API JSON Data routes
app.get('/data/astronauts',routes.data_all);
app.get('/data/astronauts/:astro_id', routes.data_detail);

// consume a remote API
app.get('/remote_api_demo', routes.remote_api);

app.post('/set_session', routes.set_session);
*/

// create NodeJS HTTP server using 'app'
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server =listening on port " + app.get('port'));
});

