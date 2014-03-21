"use strict";

var _ = require('lodash');
var location = require('../controllers/location');

module.exports = function(app, glassApi) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	app.get('/locations/all', hasAuthorization, location.allJson);
	app.post('/locations/add', hasAuthorization, location.add);
	app.post('/locations/remove', hasAuthorization, location.delete);

};