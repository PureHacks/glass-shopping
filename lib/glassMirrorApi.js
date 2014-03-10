var googleapis = require('googleapis');



module.exports = function(config, onNeedAuthentification) {

	var glass = {};
	var mirrorApi;

	var discoveMirrorApi = function(){
		googleapis.discover('mirror', 'v1').execute(function(err, client) {
			if (!!err){
				console.log("error retrieving mirrorApi API reference", err);
				return;
			}
			mirrorApi = client.mirror;
		});
	};

	var oauth2Client = new googleapis.OAuth2Client(config.clientID, config.clientSecret, "http://" + config.host + config.oauth2callbackRoute);
	
	discoveMirrorApi();

	/*
	* AUTH
	*/

	glass.isAuthenticated = function(res, authenticatedCallback, notAuthenticatedCallback){
		if (!oauth2Client.credentials){
			if(typeof notAuthenticatedCallback == "function"){
				notAuthenticatedCallback(res, oauth2Client);
			}else if(typeof onNeedAuthentification == "function"){
				onNeedAuthentification(res, oauth2Client);
			}else{
				console.error("Need valid 'onNeedAuthentification' function to authenticate app");
			}
		} else {
			authenticatedCallback(res);
		}
	};

	//exposes mirrorApi
	glass.getmirrorApiReference = function(){
		return mirrorApi;
	};

	//exposes oauth2Client
	glass.getOauth2ClientReference = function(){
		return oauth2Client;
	};


	glass.getToken = function(code, errorCallback, successCallback) {
		oauth2Client.getToken(code, function(err, tokens){
			if (!!err){
				if(typeof errorCallback == "function"){
					errorCallback(err);
				}
			}else{
				oauth2Client.credentials = tokens;
				if(typeof successCallback == "function"){
					successCallback(tokens);
				}
			}
		});
	};


	/*
	* TIMELINE
	*/


	glass.listTimeline = function(errorCallback, successCallback){
		mirrorApi.timeline.list()
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
			});
	};



	glass.getTimelineItem = function(itemId, errorCallback, successCallback) {
		mirrorApi.timeline.get({"id": itemId})
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
			});
	};


	glass.updateTimeline = function(timelineItem, errorCallback, successCallback){
		mirrorApi.timeline.update(timelineItem)
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
			});
	};


	glass.patchTimeline = function(timelineItem, errorCallback, successCallback){
		console.log("patch", {"id" : timelineItem.id, "body" : { "html" : "<article>UPDATED</article>"}});
		mirrorApi.timeline.patch({
				"id" : timelineItem.id,
				"body" : { "html" : "<article>UPDATED</article>", "text" : "xxx"}
			})
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
			});
	};


	glass.insertTimelineItem = function(timelineItem, errorCallback, successCallback){
		mirrorApi.timeline.insert(timelineItem)
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
			});
	};



	glass.deleteTimelineItem = function(itemId, errorCallback, successCallback) {
		mirrorApi.timeline.delete({
				id: itemId
			})
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}                   
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
			});
	};



	//util to clear whole timeline
	glass.clearTimeline = function(errorCallback, successCallback){
		mirrorApi.timeline.list()
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err) {
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					var hasError = false;
					for (var i = 0; i < data.items.length; i++) {
						var itemId = data.items[i].id;
						console.log("delete ITEM ID: ", itemId);
						glass.deleteTimelineItem(itemId, errorCallback);
					}
					if(typeof successCallback == "function"){
						successCallback();
					}
				} 
			});
	};



	/*
	* CONTACTS
	*/
	
	glass.insertContact = function(contact, errorCallback, successCallback){
		mirrorApi.contacts.insert(contact)
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
			});
	};




	//TODO: need to get image from resource for this to work
	// var insertImgTimelineItem = function(img, errorCallback, successCallback){
	// 	var date = new Date();
	// 	mirrorApi.timeline.insert(
	// 		{
	// 			//"bundleId": "main",
	// 			"html": "<article>\n test </br><img src=\"" + img + "\" /></article>",
	// 			"menuItems": [{"action": "DELETE"}],
	// 			"notification": { "level": "DEFAULT" }
	// 		}
	// 	)
	// 	.withAuthClient(oauth2Client)
	// 	.execute(function(err, data){
	// 		if (!!err)
	// 			errorCallback(err);
	// 		else
	// 			successCallback(data);
	// 	});
	// };



	glass.subscribeToNotifications = function(callbackUrl, userToken, verifyToken, errorCallback, successCallback) {
		console.log("subscribeToNotifications", callbackUrl, userToken, verifyToken);
		mirrorApi.subscriptions.insert({
				"collection": "timeline",
				"userToken": userToken,
				"verifyToken": userToken,
				"callbackUrl": "https://mirrornotifications.appspot.com/forward?url=" + callbackUrl
			})
			.withAuthClient(oauth2Client)
			.execute(function(err, data){
				if (!!err){
					if(typeof errorCallback == "function"){
						errorCallback(err);
					}
				}else{
					if(typeof successCallback == "function"){
						successCallback(data);
					}
				}
					
			});
	};


	return glass;

};