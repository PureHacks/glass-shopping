"use strict";

var shoppingListItem = require('../controllers/shoppingListItem');

module.exports = function(app, glassApi) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	//app.put('/tabs/:tabId', authorization.requiresLogin, hasAuthorization, tabs.update);
	app.get('/shoppingList/:lat/:long', shoppingListItem.all);
	app.get('/addListItem', hasAuthorization, shoppingListItem.addListItemForm);
	app.post('/addListItem', hasAuthorization, shoppingListItem.addListItem);
	app.get('/all2', shoppingListItem.all);
	//app.post('/addLocation', hasAuthorization, shoppingListItem.addLocation);
};