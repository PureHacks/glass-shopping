
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var glassMirrorApi = require('./models/glassMirrorApi');

var app = express();

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



var config = {
	displayName: "devlist update",
	clientID: "755482469248-q08tbvotf1f62fd4guhv7riqo9bnhth7.apps.googleusercontent.com",
	clientSecret: "mst-lDnj43oI4yj50sw1obtQ",
	host: "localhost:5000",
	oauth2callbackRoute : "/oauth2callback"
}
if (process.env.NODE_ENV == "prod") {
	config = {
		displayName: "shoppinglist update",
		clientID: "716645361625-j2vb7jg318uo6nu44rkjgu8b7letfvjc.apps.googleusercontent.com",
		clientSecret: "iUG7BPRnAy_NNE8BDmdp5n_8",
		host: "glass-shopping.herokuapp.com",
		oauth2callbackRoute : "/oauth2callback"
	}
}

//called when app needs authentification
var authenticateApp = function(res, oauth2Client){
	// generates a url that allows offline access and asks permissions
	// for Mirror API scope.
	var url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: 'https://www.googleapis.com/auth/glass.timeline https://www.googleapis.com/auth/glass.location'
	});
	res.redirect(url);
};

var genericSuccess = function(data) {
	console.log('success', data);
};


var genericFailure = function(data) {
	console.log('failure', data);
};


var glassApi = glassMirrorApi(config, authenticateApp);


app.get('/', function(req, res){
	glassApi.isAuthenticated(res, gotToken);
	res.render('index', { title: 'Signed up for Shopping list' });
	res.end();
});




app.post('/notify/timeline', function(req, res){
	var notification = req.body;
	var itemId = notification.itemId;
	console.log("/notify/timeline", notification);
	switch (notification.userActions[0].type) {
		case "SHARE":
			glassApi.getTimelineItem(function(data){
				console.log("got share item", data.attachments[0].contentUrl);
				// var img = data.attachments[0].contentUrl;
				// insertImgTimelineItem(img, genericFailure, genericSuccess)
			});

			// perform share
			break;
		case "REPLY":
			// perform reply
			console.log("action reply");
			break;
		case "DELETE":
			// perform delete
			console.log("action DELETE");
			break;
		case "LAUNCH":
			// perform launch
			console.log("action LAUNCH");
			break;
		case "CUSTOM":
			// perform custom
			console.log("action CUSTOM");
			break;
	};
	res.end();
});

//authenticated
app.get('/oauth2callback', function(req, res){
	// if we're able to grab the token, redirect the user back to the main page
	glassApi.getToken(req.query.code, genericFailure, function(){ res.redirect('/'); });
});




var gotToken = function() {
	var date = new Date();
	glassApi.listTimeline(genericFailure, genericSuccess);
	glassApi.insertContact({
			"id": "harold",
			"displayName": config.displayName,
			"priority": 7,
			"acceptCommands": [
				{"type": "POST_AN_UPDATE"},
				{"type": "TAKE_A_NOTE"}
			]
		}, genericFailure, genericSuccess);
	glassApi.insertTimelineItem({
			//"bundleId": "main",
			"html": "<article>\n <b>" + date.toLocaleTimeString() + "<br/>durp</b></article>",
			"speakableText": "Hellooooo duurp",
			"menuItems": [{"action": "DELETE"}],
			"notification": { "level": "DEFAULT" }
		},genericFailure, genericSuccess);
	glassApi.clearTimeline(genericFailure, genericSuccess);
	glassApi.subscribeToNotifications("http://" + config.host + "/notify/timeline", "userTokenTest", "verifyTokenTest", genericFailure, genericSuccess);
};



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});