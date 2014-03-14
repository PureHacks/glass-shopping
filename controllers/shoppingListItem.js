"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var ShoppingListItem = mongoose.model('ShoppingListItem');
var Location = mongoose.model('Location');
var _ = require('lodash');

//generic response handler
var onDbError = function(err){
	console.error("db query error",err);
	res.render('error', {
		status: 500
	});
};


exports.addListItem = function(req, res) {
	var shoppingListItem = new ShoppingListItem(req.body);
	shoppingListItem.save(function(err) {
		if (err) {
			return res.render('addListItem', {
				user: "Error",
				message: "Could not add Item to Shopping List"
			});
		}else{
			return res.render('addListItem', {
				user: "Success",
				message: req.body.name + " added."
			});
		}
	});
};

exports.addListItemForm = function(req, res, next) {
	Location.find().sort("name").exec(function(err, locations){
		if(err) {
			return onDbError(err); 
		}
		ShoppingListItem.find().sort("name").exec(function(err, shoppingListItems){
			if(err) {
				return onDbError(err); 
			}
			res.render('addListItem', { title: 'Add new List Item', locations: locations, shoppingListItems: shoppingListItems });
			res.end();
		});
	});
	
};

/**
 * return ShoppingList of ShoppingListItems with location
 */
exports.all = function(req, res) {
	var latitude = req.params.lat;
	var longitude = req.params.long;
	//.populate({ path: 'location', model: 'override'}).
	ShoppingListItem.find().sort('-created').populate('location', 'name latitude longitude').exec(function(err, shoppingList){
		if(err) {
			return onDbError(err); 
		}
		res.json([shoppingList]);
	});
};