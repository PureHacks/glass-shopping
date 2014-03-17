"use strict";

var shoppingListItem = require('../controllers/shoppingListItem');

module.exports = function(app, glassApi) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	//app.put('/tabs/:tabId', authorization.requiresLogin, hasAuthorization, tabs.update);
	app.get('/listitems/all/:lat/:long', shoppingListItem.all);
	app.get('/listitems/add', hasAuthorization, shoppingListItem.addListItemForm);
	app.post('/listitems/add', hasAuthorization, shoppingListItem.addListItem);
	//app.get('/all/:lat/:long', shoppingListItem.all);
	//app.post('/addLocation', hasAuthorization, shoppingListItem.addLocation);
};