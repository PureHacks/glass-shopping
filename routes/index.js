"use strict";

/*
 * GET home page.
 */
var index = require('../controllers/index');

module.exports = function(app, glassApi, genericSuccess, genericFailure) {

	var hasAuthorization = function(req, res, next){
		glassApi.isAuthenticated(res, function(){
			next();
		});
	};

	app.get('/', hasAuthorization, index.index);

	app.get('/oauth2callback', function(req, res){
		// if we're able to grab the token, redirect the user back to the main page
		glassApi.getToken(req.query.code, genericFailure, function(){
			res.redirect('/');
		});
	});
};