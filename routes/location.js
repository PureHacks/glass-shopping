"use strict";

var shoppingListItem = require('../controllers/location');

module.exports = function(app, glassApi) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	app.post('/addLocation', hasAuthorization, shoppingListItem.addLocation);
	app.get('/all/:lat/:long', hasAuthorization, shoppingListItem.all);
};