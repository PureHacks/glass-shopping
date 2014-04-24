"use strict";


/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var _ = require('lodash');




//change to your setting
var config = {
	displayName: "devlist update",
	clientID: "xxxxxxxx.apps.googleusercontent.com",
	clientSecret: "xxxxxxxx",
	host: "localhost:5000",
	oauth2callbackRoute : "/oauth2callback",
	mongooseUrl : process.env.MONGOHQ_URL || "mongodb://glass-shopping-app:7e441f609f@oceanic.mongohq.com:xxxxx/xxxxxxx"
};

if (process.env.NODE_ENV == "prod") {
	config = _.extend(config, {
		displayName: "shoppinglist update",
		clientID: "xxxxxxxxx.apps.googleusercontent.com",
		clientSecret: "xxxxxxxxxx",
		host: "your_url.herokuapp.com"
	});
}


var hostBaseUrl = "http://" + config.host;

//http://mongoosejs.com/docs/index.html
//https://devcenter.heroku.com/articles/mongohq#mongohq-web-tools
mongoose.connect(config.mongooseUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("open db connection");
});


var app = express();
app.use(express.json());
app.use(express.urlencoded());


// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//called when app needs authentification
var authenticateApp = function(res, oauth2Client){
	// generates a url that allows offline access and asks permissions
	// for Mirror API scope.
	var url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		//scope: 'https://www.googleapis.com/auth/glass.timeline https://www.googleapis.com/auth/glass.location'
		scope: 'https://www.googleapis.com/auth/glass.timeline'
	});
	res.redirect(url);
};

var glassApi = require('./lib/glassMirrorApi')(config, authenticateApp);


//var shoppingListItem = require('./routes/shoppingListItem');
require("./models/shoppingListItem");
require("./models/location");



var genericSuccess = function(data) {
	console.log('success', data);
};

var genericSuccessNoDataLog = function() {
	console.log('success - plain');
};

var genericFailure = function(data) {
	console.log('failure', data);
};


require("./routes/index")(app, glassApi, genericFailure, genericSuccess);
require("./routes/shoppingList")(app, glassApi, genericFailure, genericSuccess, hostBaseUrl);
require("./routes/shoppingListItem")(app, glassApi);
require("./routes/timeline")(app, glassApi, genericFailure, genericSuccess, hostBaseUrl);
require("./routes/location")(app, glassApi);


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});