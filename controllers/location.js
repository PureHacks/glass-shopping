"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Location = mongoose.model('Location');
var _ = require('lodash');


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
				message: "Location added."
			});
		}
	});
};

/**
 * return Locations of ShoppingListItems
 */
exports.all = function(req, res) {
	var latitude = req.params.lat;
	var longitude = req.params.long;

	Location.find().sort('-created').exec(function(err, location) {
		if (err) {
			res.render('error', {
				status: 500
			});
		} else {
			res.json([location, latitude, longitude]);
		}
	});
};