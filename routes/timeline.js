"use strict";

var _ = require('lodash');
var index = require('../controllers/index');

module.exports = function(app, glassApi, genericSuccess, genericFailure, hostBaseUrl) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};
	
	app.get('/timeline/clear', hasAuthorization, function(req, res){
		glassApi.clearTimeline(genericFailure, genericSuccess);
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


};