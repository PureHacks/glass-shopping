"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var ShoppingListItem = mongoose.model('ShoppingListItem');
var _ = require('lodash');


exports.addListItem = function(req, res) {
	console.log(req);
	res.json([req.body.listItemName, req.body.location]);
	//ShoppingListItem.sa
};

exports.addListItemForm = function(req, res, next) {
	console.log("durp", arguments.length);
	res.render('addListItem', { title: 'Add new List Item' });
	res.end();
};

/**
 * return ShoppingList of ShoppingListItems
 */
exports.all = function(req, res) {
	var latitude = req.params.lat;
	var longitude = req.params.long;

	ShoppingListItem.find().sort('-created').exec(function(err, shoppingList) {
		if (err) {
			res.render('error', {
				status: 500
			});
		} else {
			res.json([shoppingList, latitude, longitude]);
		}
	});
};