"use strict";

var _ = require('lodash');
var location = require('../controllers/location');

module.exports = function(app, glassApi, genericFailure, genericSuccess, hostBaseUrl) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	app.get('/locations/all', hasAuthorization, location.allJson);
	app.post('/locations/add', hasAuthorization, location.add);
	app.post('/locations/remove', hasAuthorization, location.delete);

	//to find test location 
	//http://itouchmap.com/latlong.html
	app.get('/location/ping/:lat/:long', hasAuthorization, function(req, res){
		var latitude = req.body.lat || 43.646357;
		var longitude = req.body.long || -79.395682;

		//todo: add location test
		pushShoppinglistUpdates();
		
		res.render('index', { title: 'Location Ping send (' + latitude + '/' +longitude+')'});
		res.end();
	});


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
			if(items.length < 2){
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
			pushShoppingList(["5 Tomatos", "Oka Cheese", "Tuna Salad with bread crumbs"], "Walmart");
		});
	};

	var subscribeToShoppinglistUpdates = function() {
		glassApi.subscribeToNotifications(hostBaseUrl + "/notify/timeline/shoppinglist", "shoppinglistInteraction", "durpVerifyxxx", genericFailure, genericSuccess);
	};

};