"use strict";


/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var glassMirrorApi = require('./lib/glassMirrorApi');
var _ = require('lodash');



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
  // yay!
});

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


app.get('/',  function(req, res){
	glassApi.isAuthenticated(res, function(){
		//subscribeToShoppinglistUpdates();
		res.render('index', { title: 'Glass Shopping List' });
		res.end();
	});
});


//authenticated
app.get('/oauth2callback', function(req, res){
	// if we're able to grab the token, redirect the user back to the main page
	glassApi.getToken(req.query.code, genericFailure, function(){ 
		res.redirect('/');
	});
});


//to find test location 
//http://itouchmap.com/latlong.html
app.get('/location/ping/:lat/:long', function(req, res){
	var latitude = req.body.lat || 43.646357;
	var longitude = req.body.long || -79.395682;

	//todo: add location test
	glassApi.isAuthenticated(res, pushShoppinglistUpdates);
	
	res.render('index', { title: 'Location Ping send (' + latitude + '/' +longitude+')'});
	res.end();
});


//clear timeline
app.get('/timeline/clear', function(req, res){
	glassApi.isAuthenticated(res, function(){
		glassApi.clearTimeline(genericFailure, genericSuccess);
	});
	res.redirect('/');
	res.end(); 
});


//called by googles mirror api
app.post('/notify/timeline/shoppinglist', function(req, res){
	var notification = req.body;
	var itemId = notification.itemId;
	if(notification.userActions[0].type == "DELETE"){
		//TODO: update item by itemId in DB
		glassApi.listTimeline(genericFailure, function(data){
			var bundleCover = _.first(data.items, function(item){ return !!item.isBundleCover })[0];
			var shoppinListItems =  _.compact(_.map(data.items, function(item){ 
				return (item.itemId != itemId && !item.isBundleCover)? item.sourceItemId : false;
			}));

			if(bundleCover) {
				glassApi.patchTimeline(bundleCover.id, shoppingListTimelineCoverItemMarkup(bundleCover.bundleId, shoppinListItems, bundleCover.sourceItemId), genericFailure, function(data){
					console.log("patch successfull", data);
				});
			}
		});
	}
	res.end();
});


var subscribeToShoppinglistUpdates = function() {
	glassApi.subscribeToNotifications(hostBaseUrl + "/notify/timeline/shoppinglist", "shoppinglistInteraction", "durpVerifyxxx", genericFailure, genericSuccess);
};


var shoppingListTimelineItemMarkup = function(bundleId, itemName){
	return {
		"bundleId": bundleId,
		"sourceItemId" : itemName,
		"html": "<article><section><p class=\"text-auto-size\">" + itemName + "</p></section></article>",
		"speakableText": itemName,
		"menuItems": [{
				"action": "DELETE",
				"id": "GotIt",
				"payload" : itemName,
				//"removeWhenSelected" : true,
				"values": [{
					"displayName": "Got It",
					"iconUrl": hostBaseUrl + "/images/icon/got-it.png"
				}]
		}],
		"notification": { "level": "DEFAULT" }
	};
};


var formatFileName = function(name){
	return name.toLowerCase().replace(/[^a-z0-9\-]/g,"");
};


var shoppingListTimelineCoverItemMarkup = function(bundleId, items, store){
	store = store || "Nearby Store"
	var html, speakableText;
	if(items.length>0){
		if(items.length < 4){
			html = "<article style=\"font-size:50px;\"><figure><img src=\""+hostBaseUrl+"/images/stores/" + formatFileName(store) + ".jpg\" /></figure><section>"+store+"<ul><li>" + items.join("</li><li>") + "</li></ul></section></article>";
			speakableText = store + " shopping list: " + items.join(" ");
		}else{
			html = "<article style=\"font-size:40px;\"><figure><img src=\""+hostBaseUrl+"/images/stores/" + formatFileName(store) + ".jpg\" /></figure><section>Stop by "+store+" for "+items.length+" items</section></article>";
			speakableText = "Stop by "+store+" for "+items.length;
		}
	}else{
		html = "<article style=\"font-size:70px;\">" + store + "<p>All Done!</p></article>";
		speakableText = "Shopping list empty";
	}
	return {
		"bundleId": bundleId,
		"sourceItemId": store,
		"isBundleCover" : items.length > 0,
		"html": html,
		"speakableText": speakableText,
		"notification": { "level": "DEFAULT" }
	};
};


var pushShoppingList = function(items, store){
	var bundleId = "ShoppinglistUpdates " +  new Date().toLocaleTimeString();
	_.forEach(items, function(item){
		glassApi.insertTimelineItem(shoppingListTimelineItemMarkup(bundleId, item),genericFailure, genericSuccess);	
	});
	glassApi.insertTimelineItem(shoppingListTimelineCoverItemMarkup(bundleId, items, store),genericFailure, genericSuccess);
};


var pushShoppinglistUpdates = function() {
	glassApi.clearTimeline(genericFailure, function(){
		subscribeToShoppinglistUpdates();
		pushShoppingList(["Tomato", "Cheese", "Salad", "Bread", "Milk"], "Walmart");
	});
};


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});