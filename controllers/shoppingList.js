"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var ShoppingListItem = mongoose.model('ShoppingListItem');
var Location = mongoose.model('Location');
var async = require('async');
var _ = require('lodash');


var getMessage = function(req) {
	if(req.query.success){
		switch(req.query.success){
			case "location-add" : 
				return "Added location: " + req.query.name;
			case "location-delete" :
				return "Deleted location successfully";
			case "listitem-add" : 
				return "Added item: " + req.query.name;
			case "listitem-delete" :
				return "Deleted item successfully";
			default: 
				return "generic success"
		}
	}else if(req.query.error){
		switch(req.query.error){
			case "location-add" : 
				return "Error adding location";
			case "location-delete" :
				return "Error deleting location";
			case "listitem-add" : 
				return "Error adding item to list";
			case "listitem-delete" :
				return "Error deleting item to list";
			default: 
				return "generic error"
		}
		
	}
};

exports.manage = function(req, res) {
	var message = getMessage(req);
	
	async.parallel([
		function(cb){
			ShoppingListItem.all(cb);
		},
		function(cb){
			Location.all(cb);
		}
	], function(err, result){
		res.render('addListItem', { 
			title: 'Add new List Item',
			shoppingListItems: result[0],
			locations: result[1],
			message: message
		});
		res.end();
	});
};

/**
 * return ShoppingList items of ShoppingListItems with location in the range around the lat/long 
 */
exports.allByLatLong = function(req, res) {
	var fuzzinessRange = 0.003;
	ShoppingListItem.allByLatLong(req.params.lat, req.params.long, fuzzinessRange, function(err, shoppingListItems){
		res.json(shoppingListItems);
		res.end();
	});
};