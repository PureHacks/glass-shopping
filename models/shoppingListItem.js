"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');


/**
 * Tabs Schema
 */
var ShoppingListItemSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	name: {
		type: String,
		default: '',
		trim: true
	},
	location: [{
		type: Schema.ObjectId,
		ref: 'Location'
	}]
});


// /**
//  * Statics
// */
ShoppingListItemSchema.statics.load = function(id, cb) {
	this.findOne({
		_id: id
	})
	.populate('location', 'name latitude longitude')
	.exec(function(err, shoppingListItem){
		if(err) {
			throw "ShoppingListItemSchema > DB ERROR: " + err;
		}

		cb(err, shoppingListItem);
	});
};


ShoppingListItemSchema.statics.all = function(cb) {
	this.find()
		.sort('-created')
		.populate('location', 'name latitude longitude')
		.exec(function(err, shoppingListItems){
			if(err) {
				throw "ShoppingListItemSchema > DB ERROR: " + err;
			}

			cb(err, shoppingListItems);
		});
};


ShoppingListItemSchema.statics.allByLatLong = function(lat, long, fuzziness, cb) {
	lat =  parseFloat(lat, 10);
	long = parseFloat(long, 10);
	fuzziness = parseFloat(fuzziness, 10);

	if(isNaN(lat) || isNaN(long) || isNaN(fuzziness)){
		throw "ShoppingListItemSchema > Invalid Argument: invalid latitude, longitude or fuzziness argument (need to be number)";
	}

	this.all(function(err, shoppingListItems){
		cb(err, _.filter(shoppingListItems, function(shoppingListItem){
			return _.filter(shoppingListItem.location, function(location) {
				return (location.latitude > lat - fuzziness 
						&& location.latitude < lat + fuzziness 
						&& location.longitude > long - fuzziness 
						&& location.longitude < long + fuzziness);
			}).length > 0;
		}));
	});
};


mongoose.model('ShoppingListItem', ShoppingListItemSchema);