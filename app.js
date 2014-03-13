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

var glassMirrorApi = require('./lib/glassMirrorApi');

//var shoppingListItem = require('./routes/shoppingListItem');
require("./models/shoppingListItem");
require("./models/location");


var config = {
	displayName: "devlist update",
	clientID: "755482469248-q08tbvotf1f62fd4guhv7riqo9bnhth7.apps.googleusercontent.com",
	clientSecret: "mst-lDnj43oI4yj50sw1obtQ",
	host: "localhost:5000",
	oauth2callbackRoute : "/oauth2callback",
	mongooseUrl : process.env.MONGOHQ_URL || "mongodb://glass-shopping-app:7e441f609f@oceanic.mongohq.com:10074/app22628793"
};

if (process.env.NODE_ENV == "prod") {
	config = _.extend(config, {
		displayName: "shoppinglist update",
		clientID: "716645361625-j2vb7jg318uo6nu44rkjgu8b7letfvjc.apps.googleusercontent.com",
		clientSecret: "iUG7BPRnAy_NNE8BDmdp5n_8",
		host: "glass-shopping.herokuapp.com"
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

var glassApi = glassMirrorApi(config, authenticateApp);

var genericSuccess = function(data) {
	console.log('success', data);
};

var genericSuccessNoDataLog = function() {
	console.log('success - plain');
};

var genericFailure = function(data) {
	console.log('failure', data);
};


require("./routes/index")(app, glassApi, genericSuccess, genericFailure);
require("./routes/shoppingListItem")(app, glassApi);
require("./routes/timeline")(app, glassApi, genericSuccess, genericFailure, hostBaseUrl);
require("./routes/location")(app, glassApi, genericFailure, genericSuccess, hostBaseUrl);


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});