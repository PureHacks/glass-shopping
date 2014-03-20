"use strict";

var shoppingListItem = require('../controllers/shoppingListItem');

module.exports = function(app, glassApi) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	app.get('/listitems/all', hasAuthorization, shoppingListItem.allJson);
	app.post('/listitems/remove', hasAuthorization, shoppingListItem.delete);
	app.post('/listitems/add', hasAuthorization, hasAuthorization, shoppingListItem.add);
};