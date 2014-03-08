"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
var ShoppingList = mongoose.model('ShoppingList'),
var _ = require('lodash');


/**
 * List of ShoppingLists
 */
exports.all = function(req, res) {
    ShoppingList.find().sort('-created').exec(function(err, shoppingLists) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(shoppingLists);
        }
    });
};