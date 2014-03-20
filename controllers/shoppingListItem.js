"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var ShoppingListItem = mongoose.model('ShoppingListItem');
var Location = mongoose.model('Location');
var async = require('async');
var _ = require('lodash');


exports.add = function(req, res) {
	var shoppingListItem = new ShoppingListItem(req.body);
	shoppingListItem.save(function(err) {
		if (err) {
			res.redirect('/shoppinglist/manage?error=listitem-add');
		}else{
			res.redirect('/shoppinglist/manage?success=listitem-add&name=' + req.body.name);
		}
		res.end();
	});
};


exports.delete = function(req, res) {
	ShoppingListItem.load(req.body.delete, function(err, shoppingListItem) {
		shoppingListItem.remove(function(err){
			if (err) {
				res.redirect('/shoppinglist/manage?error=listitem-delete');
			}else{
				res.redirect('/shoppinglist/manage?success=listitem-delete');
			}
			res.end();
		});
	});
};


/**
 * return all ShoppingList itmems of ShoppingListItems with location
 */
exports.allJson = function(req, res) {
	ShoppingListItem.all(function(err, shoppingListItems){
		res.json(shoppingListItems);
		res.end();
	});
};