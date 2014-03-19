"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;



/**
 * Tabs Schema
 */
var LocationSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	latitude: {
		type: Number,
		default: '',
		trim: true
	},
	longitude: {
		type: Number,
		default: '',
		trim: true
	}
});


// /**
//  * Statics
// */
LocationSchema.statics.load = function(id, cb) {
	this.findOne({
		_id: id
	}).exec(function(err, location){
		if(err) {
			throw "LocationSchema > DB ERROR: " + err;
		}

		cb(err, location);
	});
};


LocationSchema.statics.all = function(cb) {
	this.find()
		.sort('name')
		.exec(function(err, locations){
			if(err) {
				throw "LocationSchema > DB ERROR: " + err;
			}

			cb(err, locations);
		});
};



mongoose.model('Location', LocationSchema);