"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var ShoppingListItem = mongoose.model('ShoppingListItem');
var Location = mongoose.model('Location');
var async = require('async');
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
	var shoppingListItems, locations;

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
				locations: result[1]
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
	});
};

/**
 * return all ShoppingList itmems of ShoppingListItems with location
 */
exports.all = function(req, res) {
	ShoppingListItem.all(function(err, shoppingListItems){
		res.json(shoppingListItems);
	});
};