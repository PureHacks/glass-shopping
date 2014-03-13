"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

exports.index = function(req, res) {
	//subscribeToShoppinglistUpdates();
	res.render('index', { title: 'Glass Shopping List' });
	res.end();
};