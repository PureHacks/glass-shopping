"use strict";

var shoppingList = require('../controllers/shoppingList');



module.exports = function(app, glassApi, genericFailure, genericSuccess, hostBaseUrl) {

	var timelineItem = require('../controllers/timelineItem')(app, glassApi, genericFailure, genericSuccess, hostBaseUrl);

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};


	//http://itouchmap.com/latlong.html
	app.get('/shoppinglist/ping/:lat/:long', hasAuthorization, shoppingList.allByLatLong, function(req, res){
		var latitude = req.body.lat || 43.646357;
		var longitude = req.body.long || -79.395682;
		
		//todo: add location test
		timelineItem.pushShoppinglistUpdates(req.shoppingListItemsNames, req.locations[0]);
		
		res.render('index', { title: 'Location Ping send (' + latitude + '/' +longitude+')'});
		res.end();
	});


	app.get('/shoppinglist/all/:lat/:long', hasAuthorization, shoppingList.allByLatLong, function(req, res){	
		res.json([req.shoppingListItemsNames, req.locations[0]]);
		res.end();
	});

	app.get('/shoppinglist/manage', hasAuthorization, shoppingList.manage);
};