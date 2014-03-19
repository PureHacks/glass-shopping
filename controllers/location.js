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


exports.addLocation = function(req, res) {
	var location = new Location(req.body);
	location.save(function(err) {
		if (err) {
			return res.render('addListItem', {
				user: "Error",
				message: "Could not add Location."
			});
		}else{
			return res.render('addListItem', {
				user: "Success",
				message: req.body.name + " added."
			});
		}
	});
};


/**
 * return Locations of ShoppingListItems
 */
exports.allJson = function(req, res) {
	Location.all(function(err, location) {
		res.json(location);
	});
};