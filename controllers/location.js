"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Location = mongoose.model('Location');
var glassApi = require('../lib/glassMirrorApi')()
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
				message: req.body.name + " added."
			});
		}
	});
};

/**
 * return Locations of ShoppingListItems
 */
exports.allForLocation = function(req, res) {
	var lat =  parseFloat(req.params.lat, 10);
	var long = parseFloat(req.params.long, 10);
	var variation = 0.003;
	//http://itouchmap.com/latlong.html

	console.log(lat,long);

	//todo m
	Location.find({
				latitude : {
					$gte: lat - variation,
					$lte : lat + variation
				},
				longitude : {
					$gte: long - variation,
					$lte : long + variation
				}
			})
			.sort("name")
			.exec(function(err, location) {
				if (err) {
					console.error("db query error",err);
					res.json([err]);
				} else {
					res.json(location);
				}
	});
};

/**
 * return Locations of ShoppingListItems
 */
exports.allJson = function(req, res) {

	Location.find()
			.sort("name")
			.exec(function(err, location) {
				if (err) {
					console.error("db query error",err);
					res.json([err]);
				} else {
					res.json(location);
				}
	});
};