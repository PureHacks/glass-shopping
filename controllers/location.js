"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Location = mongoose.model('Location');
var glassApi = require('../lib/glassMirrorApi')()
var _ = require('lodash');

//generic response handler
var onDbError = function(err){
	console.error("db query error",err);
	res.render('error', {
		status: 500
	});
};


exports.add = function(req, res, next) {
	var location = new Location(req.body);
	location.save(function(err) {
		if (err) {
			res.redirect('/shoppinglist/manage?error=location-add');
		}else{
			res.redirect('/shoppinglist/manage?success=location-add&name=' + req.body.name);
		}
		res.end();
	});
};



exports.delete = function(req, res) {
	Location.load(req.body.delete, function(err, location) {
		location.remove(function(err){
			if (err) {
				res.redirect('/shoppinglist/manage?error=location-delete');
			}else{
				res.redirect('/shoppinglist/manage?success=location-delete');
			}
			res.end();
		});
	});
};


/**
 * return Locations of ShoppingListItems
 */
exports.allJson = function(req, res) {
	Location.all(function(err, location) {
		res.json(location);
		res.end();
	});
};