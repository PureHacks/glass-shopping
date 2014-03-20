"use strict";

var shoppingList = require('../controllers/shoppingList');

module.exports = function(app, glassApi) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	app.get('/shoppinglist/all/:lat/:long', shoppingList.allByLatLong);
	app.get('/shoppinglist/manage', hasAuthorization, shoppingList.manage);
};